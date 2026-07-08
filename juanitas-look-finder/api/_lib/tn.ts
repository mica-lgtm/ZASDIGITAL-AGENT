// ─── TIENDA NUBE SHARED LOGIC ───────────────────────────────────────────────
// Used by /api/catalog (Vercel Function) and server/index.ts (dev local).

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

type TNProductRaw = {
  id: number;
  handle: TNField;
  name: TNField;
  images: { src: string }[];
  canonical_url: string;
  published?: boolean;
  variants: { price: string; promotional_price: string | null }[];
};

function tnStr(v: TNField | undefined): string {
  if (!v) return "";
  return typeof v === "string" ? v : v.es || "";
}

const TN_TIMEOUT_MS = 10000;
const CACHE_MS = 5 * 60 * 1000;

let catalogCache: { byHandle: Map<string, LiveProduct>; expires: number } | null = null;

async function fetchTNPage(page: number, perPage: number): Promise<TNProductRaw[]> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TN_TIMEOUT_MS);
  try {
    const res = await fetch(
      `${TN_BASE}/products?per_page=${perPage}&page=${page}&fields=id,handle,name,published,images,variants,canonical_url`,
      { headers: TN_HEADERS, signal: ac.signal }
    );
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

// Catálogo curado (family/category/talles/corpinioTalles/variantKeys) enriquecido
// con precio, imagen y estado de publicación en vivo desde Tienda Nube. Cachea
// 5 minutos para no golpear la API en cada carga de la app.
export async function getLiveCatalog(): Promise<Map<string, LiveProduct>> {
  if (catalogCache && Date.now() < catalogCache.expires) {
    return catalogCache.byHandle;
  }

  const byHandle = new Map<string, LiveProduct>();

  if (!ACCESS_TOKEN) {
    for (const p of CURATED_PRODUCTS) byHandle.set(p.handle, { ...p, published: true });
    catalogCache = { byHandle, expires: Date.now() + CACHE_MS };
    return byHandle;
  }

  const tnProducts = await fetchAllTNProducts();
  const tnByHandle = new Map<string, TNProductRaw>();
  for (const p of tnProducts) tnByHandle.set(tnStr(p.handle), p);

  for (const curated of CURATED_PRODUCTS) {
    const live = tnByHandle.get(curated.handle);
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
    });
  }

  catalogCache = { byHandle, expires: Date.now() + CACHE_MS };
  return byHandle;
}
