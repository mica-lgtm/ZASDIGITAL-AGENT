// ─── TIENDA NUBE SHARED LOGIC ───────────────────────────────────────────────
// Used by /api/catalog, /api/cart (Vercel Functions) and server/index.ts (dev local).

import { PRODUCTS as CURATED_PRODUCTS, type Product } from "../../client/src/data/catalog.js";

export const STORE_ID = process.env.TIENDANUBE_STORE_ID || "3671131";
export const ACCESS_TOKEN = process.env.TIENDANUBE_ACCESS_TOKEN || "";
export const TN_BASE = `https://api.tiendanube.com/v1/${STORE_ID}`;
export const TN_HEADERS = {
  "Content-Type": "application/json",
  Authentication: `bearer ${ACCESS_TOKEN}`,
  "User-Agent": "Juanitas-LookFinder (mica@zasdigital.com)",
};

export type LiveProduct = Product & { published: boolean };

type TNField = { es?: string } | string;

export type TNVariantRaw = {
  id: number;
  price: string;
  promotional_price: string | null;
  stock: number | null;
  values: TNField[];
};

export type TNProductRaw = {
  id: number;
  handle: TNField;
  name: TNField;
  images: { src: string }[];
  canonical_url: string;
  published?: boolean;
  variants: TNVariantRaw[];
};

export function tnStr(v: TNField | undefined): string {
  if (!v) return "";
  return typeof v === "string" ? v : v.es || "";
}

function normalize(s: string): string {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
}

// Para cada talle real del producto (curado, no el crudo de TN), ¿hay stock
// en al menos un color? stock=null/undefined en TN significa "sin control de
// stock" (se asume disponible); solo se marca sin stock si es explícitamente 0.
function computeStockBySize(curated: Product, live: TNProductRaw): Record<string, boolean> {
  const targetTalles = new Set([...(curated.talles || []), ...(curated.corpinioTalles || [])].map(normalize));
  const stockBySize: Record<string, boolean> = {};
  for (const v of live.variants || []) {
    const vals = v.values.map((x) => normalize(tnStr(x)));
    const talleVal = vals.find((val) => targetTalles.has(val));
    if (!talleVal) continue;
    const inStock = v.stock === null || v.stock === undefined || v.stock > 0;
    stockBySize[talleVal] = stockBySize[talleVal] || inStock;
  }
  return stockBySize;
}

const TN_TIMEOUT_MS = 10000;
const CACHE_MS = 5 * 60 * 1000;

let rawCache: { byHandle: Map<string, TNProductRaw>; expires: number } | null = null;

async function fetchTNPage(page: number, perPage: number): Promise<TNProductRaw[]> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TN_TIMEOUT_MS);
  try {
    const res = await fetch(`${TN_BASE}/products?per_page=${perPage}&page=${page}`, { headers: TN_HEADERS, signal: ac.signal });
    if (!res.ok) return [];
    return (await res.json()) as TNProductRaw[];
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function fetchAllTNProducts(): Promise<TNProductRaw[]> {
  const perPage = 200;
  const all: TNProductRaw[] = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await fetchTNPage(page, perPage);
    all.push(...batch);
    if (batch.length < perPage) break;
  }
  return all;
}

// Cache compartido de los productos crudos de Tienda Nube (con variantes
// completas: id, values, precio, stock). Usado tanto para armar el catálogo
// enriquecido (/api/catalog) como para resolver el variant_id exacto al
// armar el carrito (/api/cart).
async function getRawCatalog(): Promise<Map<string, TNProductRaw>> {
  if (rawCache && Date.now() < rawCache.expires) return rawCache.byHandle;

  const byHandle = new Map<string, TNProductRaw>();
  if (ACCESS_TOKEN) {
    const tnProducts = await fetchAllTNProducts();
    for (const p of tnProducts) byHandle.set(tnStr(p.handle), p);
  }
  rawCache = { byHandle, expires: Date.now() + CACHE_MS };
  return byHandle;
}

export async function getRawProduct(handle: string): Promise<TNProductRaw | undefined> {
  const raw = await getRawCatalog();
  return raw.get(handle);
}

// Catálogo curado (family/category/talles/corpinioTalles/variantKeys) enriquecido
// con precio, imagen y estado de publicación en vivo desde Tienda Nube.
export async function getLiveCatalog(): Promise<Map<string, LiveProduct>> {
  const raw = await getRawCatalog();
  const byHandle = new Map<string, LiveProduct>();

  if (!ACCESS_TOKEN) {
    for (const p of CURATED_PRODUCTS) byHandle.set(p.handle, { ...p, published: true });
    return byHandle;
  }

  for (const curated of CURATED_PRODUCTS) {
    const live = raw.get(curated.handle);
    // No encontrado en la tienda (dado de baja) o despublicado: no se muestra,
    // para no recomendar un producto que ya no se puede comprar.
    if (!live || live.published === false) continue;

    const firstVariant = live.variants?.[0];
    byHandle.set(curated.handle, {
      ...curated,
      id: String(live.id),
      name: tnStr(live.name) || curated.name,
      image: live.images?.[0]?.src || curated.image,
      price: firstVariant?.price ?? curated.price,
      promoPrice: firstVariant?.promotional_price || "",
      url: live.canonical_url || curated.url,
      published: true,
      stockBySize: computeStockBySize(curated, live),
    });
  }

  return byHandle;
}
