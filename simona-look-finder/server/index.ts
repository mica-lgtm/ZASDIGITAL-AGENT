import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { createHmac, timingSafeEqual } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── TIENDA NUBE CONFIG ──────────────────────────────────────────────────────

const STORE_ID = process.env.TIENDANUBE_STORE_ID || "601496";
const ACCESS_TOKEN = process.env.TIENDANUBE_ACCESS_TOKEN || "";
const TN_BASE = `https://api.tiendanube.com/v1/${STORE_ID}`;
const TN_HEADERS = {
  "Content-Type": "application/json",
  Authentication: `bearer ${ACCESS_TOKEN}`,
  "User-Agent": "Simona-LookFinder (mica@zasdigital.com)",
};

// Cupón "LOOK COMPLETO": 15% off automático al comprar el look entero desde
// el Look Finder. Se aplica como discount directo en el draft order (Tienda
// Nube no soporta aplicar cupones por código vía API), no requiere que la
// clienta ingrese nada en el checkout.
const LOOKCOMPLETO_COUPON = "LOOKCOMPLETO";
const LOOKCOMPLETO_DISCOUNT_PERCENT = 15;
const LOOKCOMPLETO_WINDOW_MS = 24 * 60 * 60 * 1000; // 24hs desde que se muestra el look

// Tienda Nube no soporta poner fecha de vencimiento al discount de un draft
// order via API, así que la ventana de 24hs se controla acá: el cliente recibe
// un token firmado (HMAC) con la hora en que se generó el look, y /api/cart
// solo aplica el descuento si ese token es válido y todavía no pasaron 24hs.
const COUPON_SIGNING_SECRET = process.env.COUPON_SIGNING_SECRET || ACCESS_TOKEN || "simona-lookcompleto-dev-secret";

function signCouponIssuedAt(issuedAt: number): string {
  return createHmac("sha256", COUPON_SIGNING_SECRET).update(String(issuedAt)).digest("hex");
}

function mintCouponToken(issuedAt: number = Date.now()): string {
  return `${issuedAt}.${signCouponIssuedAt(issuedAt)}`;
}

function isCouponTokenValid(token: unknown): boolean {
  if (typeof token !== "string") return false;
  const [issuedAtStr, sig] = token.split(".");
  const issuedAt = Number(issuedAtStr);
  if (!issuedAtStr || !sig || !Number.isFinite(issuedAt)) return false;

  const expected = signCouponIssuedAt(issuedAt);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expected);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return false;

  const age = Date.now() - issuedAt;
  return age >= 0 && age <= LOOKCOMPLETO_WINDOW_MS;
}

// ─── LOOK DEFINITIONS ───────────────────────────────────────────────────────
// Handles verificados contra la API de Tienda Nube real.

type LookDef = { name: string; heroImg: string; handles: string[] };

const LOOK_DEFS: Record<string, LookDef> = {
  "casual-clasico": {
    name: "Look Imola",
    heroImg: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc03706-3190420bf6de92665f17794621717209-1024-1024.jpg",
    handles: ["jean-imola", "camisa-brisa-bsasy", "remera-teddy-beige-1kg9x", "campera-anada-chocolate-2gonp", "mocasines-alba-chocolate-uibiv"],
  },
  "casual-trendy": {
    name: "Look Cordillera",
    heroImg: "https://acdn-us.mitiendanube.com/stores/601/496/products/img_0323-21449e00367792b19b17763706727426-1024-1024.jpg",
    handles: ["jean-cordillera-1pnxy", "camisa-carolina", "trench-barro-verde-jznwa", "texana-saison-t6iwy"],
  },
  "casual-relaxed": {
    name: "Look Mendoza Blanco",
    heroImg: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc03324-42c8c7646d6bf1e79317792794021234-1024-1024.jpg",
    handles: ["jean-imola", "remera-basica-blanco", "blazer-mendoza-negro-bolan", "zapatilla-adele-tiza"],
  },
  "oficina-clasico": {
    name: "Look Acacia",
    heroImg: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc03859-fe23e6d26f474aab9d17792796510672-1024-1024.jpg",
    handles: ["jean-cordillera-1pnxy", "sweater-acacia-negro-1h39g", "blazer-mendoza-negro-bolan", "texana-saison-t6iwy"],
  },
  "oficina-trendy": {
    name: "Look Angelica",
    heroImg: "https://acdn-us.mitiendanube.com/stores/601/496/products/img_4668-08df5f0da4bf7b0ce917774840737114-1024-1024.jpg",
    handles: ["jean-imola", "remera-basica-blanco", "sweater-acacia-negro-1h39g", "saco-angelica-gris-17v2j", "zapatilla-adele-tiza"],
  },
  "oficina-relaxed": {
    name: "Look Terra",
    heroImg: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc02283-94c88038310055a64917780926875368-1024-1024.jpg",
    handles: ["pantalon-terra-blanco-1ekgn", "camisa-cultura-celeste-n5r3f", "campera-nero-camel-1ssjz", "sweater-lotea-gris-1fusl", "texana-saison-chocolate-7z1z5"],
  },
  "noche-clasico": {
    name: "Look Algarrobo",
    heroImg: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc02254-f34e911c443809371017780925900721-1024-1024.jpg",
    handles: ["pantalon-algarrobo-n0g4u", "camisa-clasica-blanco", "campera-nero-bordo-1ils5", "zapatilla-adele-tiza"],
  },
  "noche-trendy": {
    name: "Look Lias",
    heroImg: "https://acdn-us.mitiendanube.com/stores/601/496/products/img_3360-f9eacf7c3ebede179617703845884191-1024-1024.jpg",
    handles: ["falda-lias-chocolate-1vv8n", "musculosa-origen-negro-14bvm", "blazer-print-1y7oj", "texana-bianca-chocolate"],
  },
  "noche-relaxed": {
    name: "Look Cava",
    heroImg: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc01698-28dc953124982fd93317775569130327-1024-1024.jpg",
    handles: ["jean-imola", "sweater-cava-crudo-nx9sp", "saco-altura-beige-vt0ev", "zapatilla-adele-tiza"],
  },
};

// Fallback estático para cuando TN API no está disponible
const STATIC_PRODUCTS: Record<string, { name: string; price: string; img: string; url: string }> = {
  "jean-imola": { name: "Jean Imola", price: "$79.990", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc00702-b448f3c71ed7b8d05f17732481859544-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/jean-imola/" },
  "camisa-brisa-bsasy": { name: "Camisa Brisa", price: "$64.900", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc01790-c217d2cd122498489b17775560501445-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/camisa-brisa-bsasy/" },
  "remera-teddy-beige-1kg9x": { name: "Remera Teddy Beige", price: "$32.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/img_4573-a94d111620f4385ab717768084761482-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/remera-teddy-beige-1kg9x/" },
  "campera-anada-chocolate-2gonp": { name: "Campera Añada Chocolate", price: "$82.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc03706-3190420bf6de92665f17794621717209-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/campera-anada-chocolate-2gonp/" },
  "mocasines-alba-chocolate-uibiv": { name: "Mocasines Alba Chocolate", price: "$165.900", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc02892-a47a62788137e5568a17781688543081-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/mocasines-alba-chocolate-uibiv/" },
  "jean-cordillera-1pnxy": { name: "Jean Flare Cordillera", price: "$91.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc04019-47ccde1434f51f18d717798920087758-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/jean-cordillera-1pnxy/" },
  "camisa-carolina": { name: "Camisa Huella", price: "$65.000", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/img_3317-14f3d06a0e041d720717763819883494-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/camisa-carolina/" },
  "trench-barro-verde-jznwa": { name: "Trench Corto Verde", price: "$75.900", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/img_0323-21449e00367792b19b17763706727426-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/trench-barro-verde-jznwa/" },
  "texana-saison-t6iwy": { name: "Texana Saison", price: "$218.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/img_0585-4fa2eb893511ed1bad17763803454879-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/texana-saison-t6iwy/" },
  "remera-basica-blanco": { name: "Remera Básica Blanco", price: "$25.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc00812-0a3834318d11fa1d8717732612777655-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/remera-basica-blanco/" },
  "blazer-mendoza-negro-bolan": { name: "Blazer Mendoza Negro", price: "$97.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc03324-42c8c7646d6bf1e79317792794021234-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/blazer-mendoza-negro-bolan/" },
  "zapatilla-adele-tiza": { name: "Zapatilla Adele Tiza", price: "$169.000", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/img_3277-b8599f6173861b3def17703844112362-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/zapatilla-adele-tiza/" },
  "sweater-acacia-negro-1h39g": { name: "Sweater Acacia Negro", price: "$64.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc03859-fe23e6d26f474aab9d17792796510672-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/sweater-acacia-negro-1h39g/" },
  "saco-angelica-gris-17v2j": { name: "Saco Angelica Gris", price: "$105.900", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/img_4668-08df5f0da4bf7b0ce917774840737114-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/saco-angelica-gris-17v2j/" },
  "pantalon-terra-blanco-1ekgn": { name: "Pantalón Terra Crudo", price: "$75.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc03899-77f4871f143f8a053117792867397310-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/pantalon-terra-blanco-1ekgn/" },
  "camisa-cultura-celeste-n5r3f": { name: "Camisa Cultura Celeste", price: "$56.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc03079-bc84310dcbe99abe1717792888476740-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/camisa-cultura-celeste-n5r3f/" },
  "campera-nero-camel-1ssjz": { name: "Campera Nero Camel", price: "$95.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc02283-94c88038310055a64917780926875368-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/campera-nero-camel-1ssjz/" },
  "sweater-lotea-gris-1fusl": { name: "Sweater Lotea Gris", price: "$78.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc03501-3a1f0a76628117e0ee17817117333891-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/sweater-lotea-gris-1fusl/" },
  "texana-saison-chocolate-7z1z5": { name: "Texana Saison Chocolate", price: "$218.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc01089-20d23fc19fb85086f017739246230211-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/texana-saison-chocolate-7z1z5/" },
  "pantalon-algarrobo-n0g4u": { name: "Pantalón Algarrobo", price: "$64.900", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/img_3542-2ea77b63e8c63def6517768120016425-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/pantalon-algarrobo-n0g4u/" },
  "camisa-clasica-blanco": { name: "Camisa Clásica Blanco", price: "$44.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc00616-9efe395d7ade2d24d317732609929304-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/camisa-clasica-blanco/" },
  "campera-nero-bordo-1ils5": { name: "Campera Nero Bordo", price: "$95.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc02254-f34e911c443809371017780925900721-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/campera-nero-bordo-1ils5/" },
  "falda-lias-chocolate-1vv8n": { name: "Falda Lias Chocolate", price: "$42.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/img_3620-855971a2bc671922f217768128088536-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/falda-lias-chocolate-1vv8n/" },
  "musculosa-origen-negro-14bvm": { name: "Musculosa Origen Negro", price: "$36.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc09678-7c9144470a5107411a17758252872499-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/musculosa-origen-negro-14bvm/" },
  "blazer-print-1y7oj": { name: "Blazer Print", price: "$89.900", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/img_3360-f9eacf7c3ebede179617703845884191-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/blazer-print-1y7oj/" },
  "texana-bianca-chocolate": { name: "Texana Bianca Chocolate", price: "$219.000", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc08055-36ed56bd1ca23d91b017715125546971-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/texana-bianca-chocolate/" },
  "sweater-cava-crudo-nx9sp": { name: "Sweater Cava Crudo", price: "$59.900", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/img_4092-9218afc6ebfa45115917768039864352-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/sweater-cava-crudo-nx9sp/" },
  "saco-altura-beige-vt0ev": { name: "Saco Altura Beige", price: "$107.500", img: "https://acdn-us.mitiendanube.com/stores/601/496/products/dsc01698-28dc953124982fd93317775569130327-1024-1024.jpg", url: "https://www.simonashop.com.ar/productos/saco-altura-beige-vt0ev/" },
};

// Categoría de cada prenda — determina qué talle se usa al armar el carrito.
const PRODUCT_CATEGORIES: Record<string, "arriba" | "abajo"> = {
  "jean-imola": "abajo",
  "camisa-brisa-bsasy": "arriba",
  "remera-teddy-beige-1kg9x": "arriba",
  "campera-anada-chocolate-2gonp": "arriba",
  "mocasines-alba-chocolate-uibiv": "abajo",
  "jean-cordillera-1pnxy": "abajo",
  "camisa-carolina": "arriba",
  "trench-barro-verde-jznwa": "arriba",
  "texana-saison-t6iwy": "abajo",
  "remera-basica-blanco": "arriba",
  "blazer-mendoza-negro-bolan": "arriba",
  "zapatilla-adele-tiza": "abajo",
  "sweater-acacia-negro-1h39g": "arriba",
  "saco-angelica-gris-17v2j": "arriba",
  "pantalon-terra-blanco-1ekgn": "abajo",
  "camisa-cultura-celeste-n5r3f": "arriba",
  "campera-nero-camel-1ssjz": "arriba",
  "sweater-lotea-gris-1fusl": "arriba",
  "texana-saison-chocolate-7z1z5": "abajo",
  "pantalon-algarrobo-n0g4u": "abajo",
  "camisa-clasica-blanco": "arriba",
  "campera-nero-bordo-1ils5": "arriba",
  "falda-lias-chocolate-1vv8n": "abajo",
  "musculosa-origen-negro-14bvm": "arriba",
  "blazer-print-1y7oj": "arriba",
  "texana-bianca-chocolate": "abajo",
  "sweater-cava-crudo-nx9sp": "arriba",
  "saco-altura-beige-vt0ev": "arriba",
};

// ─── TN API TYPES ────────────────────────────────────────────────────────────

type TNVariant = {
  id: number;
  price: string;
  promotional_price: string | null;
  stock: number | null;
  values: (string | { es?: string; en?: string })[];
};

type TNProduct = {
  id: number;
  name: { es?: string; en?: string } | string;
  handle: { es?: string; en?: string } | string;
  images: { src: string }[];
  canonical_url: string;
  variants: TNVariant[];
  published?: boolean;
};

function tnStr(val: { es?: string; en?: string } | string | undefined): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val.es || val.en || "";
}

function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "$0";
  return `$${Math.round(num).toLocaleString("es-AR")}`;
}

function extractTalle(variant: TNVariant): string {
  if (!Array.isArray(variant.values) || variant.values.length === 0) return "";
  const v = variant.values[0];
  if (typeof v === "string") return v.toUpperCase();
  return (v.es || v.en || "").toUpperCase();
}

// ─── ENRICHED PRODUCT TYPE ───────────────────────────────────────────────────

type EnrichedProduct = {
  name: string;
  price: string;
  img: string;
  url: string;
  variantsByTalle: Record<string, number>;
  defaultVariantId: number | null;
  published: boolean;
};

function enrichProduct(p: TNProduct, handle?: string): EnrichedProduct {
  // Usar nombre curado del fallback si existe, en lugar del nombre verbose de TN
  const name = (handle && STATIC_PRODUCTS[handle]?.name) || tnStr(p.name);
  const img = p.images?.[0]?.src || "";
  const url = p.canonical_url || "";
  const variants = Array.isArray(p.variants) ? p.variants : [];
  const defaultVariant = variants[0];
  const price = defaultVariant
    ? formatPrice(defaultVariant.promotional_price || defaultVariant.price)
    : "$0";

  const variantsByTalle: Record<string, number> = {};
  for (const v of variants) {
    const t = extractTalle(v);
    if (t) variantsByTalle[t] = v.id;
  }

  return {
    name,
    price,
    img,
    url,
    variantsByTalle,
    defaultVariantId: defaultVariant?.id ?? null,
    published: p.published !== false,
  };
}

// ─── PRODUCT ID MAP ──────────────────────────────────────────────────────────
// IDs verificados contra la API de Tienda Nube. Permite fetch directo por ID.

const PRODUCT_IDS: Record<string, number> = {
  "jean-imola": 275260225,
  "camisa-brisa-bsasy": 340640496,
  "remera-teddy-beige-1kg9x": 339267839,
  "campera-anada-chocolate-2gonp": 334464704,
  "mocasines-alba-chocolate-uibiv": 342666308,
  "jean-cordillera-1pnxy": 346567262,
  "camisa-carolina": 298638341,
  "trench-barro-verde-jznwa": 338173608,
  "texana-saison-t6iwy": 330834506,
  "remera-basica-blanco": 259884707,
  "blazer-mendoza-negro-bolan": 344087251,
  "zapatilla-adele-tiza": 289233431,
  "sweater-acacia-negro-1h39g": 344292868,
  "saco-angelica-gris-17v2j": 334460791,
  "pantalon-terra-blanco-1ekgn": 305065454,
  "camisa-cultura-celeste-n5r3f": 344294920,
  "campera-nero-camel-1ssjz": 342194067,
  "sweater-lotea-gris-1fusl": 350993826,
  "texana-saison-chocolate-7z1z5": 332532550,
  "pantalon-algarrobo-n0g4u": 339546287,
  "camisa-clasica-blanco": 266330911,
  "campera-nero-bordo-1ils5": 342192867,
  "falda-lias-chocolate-1vv8n": 334486281,
  "musculosa-origen-negro-14bvm": 337130885,
  "blazer-print-1y7oj": 321328678,
  "texana-bianca-chocolate": 286421016,
  "sweater-cava-crudo-nx9sp": 339252684,
  "saco-altura-beige-vt0ev": 334470007,
};

// ─── CATALOG CACHE ───────────────────────────────────────────────────────────

let productCache: { byHandle: Map<string, EnrichedProduct>; expires: number } | null = null;

const TN_TIMEOUT_MS = 8000;

async function fetchProductById(id: number): Promise<TNProduct | null> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TN_TIMEOUT_MS);
  try {
    const res = await fetch(`${TN_BASE}/products/${id}`, { headers: TN_HEADERS, signal: ac.signal });
    if (!res.ok) return null;
    return res.json() as Promise<TNProduct>;
  } finally {
    clearTimeout(timer);
  }
}

async function getProductsByHandle(): Promise<Map<string, EnrichedProduct>> {
  if (productCache && Date.now() < productCache.expires) {
    return productCache.byHandle;
  }

  const byHandle = new Map<string, EnrichedProduct>();

  if (!ACCESS_TOKEN) {
    for (const [handle, s] of Object.entries(STATIC_PRODUCTS)) {
      byHandle.set(handle, { ...s, variantsByTalle: {}, defaultVariantId: null, published: true });
    }
    return byHandle;
  }

  // Handles confirmados como despublicados/no visibles en la tienda: no deben
  // mostrarse ni caer al fallback estático (mostraría el mismo producto roto).
  const unpublished = new Set<string>();

  // Fetch todos los productos en paralelo por ID (14 requests simultáneos)
  const results = await Promise.allSettled(
    Object.entries(PRODUCT_IDS).map(async ([handle, id]) => {
      const product = await fetchProductById(id);
      return { handle, product };
    })
  );

  for (const result of results) {
    if (result.status === "fulfilled" && result.value.product) {
      const { handle, product } = result.value;
      const enriched = enrichProduct(product, handle);
      if (enriched.published) {
        byHandle.set(handle, enriched);
      } else {
        unpublished.add(handle);
      }
    }
  }

  // Fallback estático para los que no se encontraron (pero no para despublicados)
  for (const [handle, s] of Object.entries(STATIC_PRODUCTS)) {
    if (!byHandle.has(handle) && !unpublished.has(handle)) {
      byHandle.set(handle, { ...s, variantsByTalle: {}, defaultVariantId: null, published: true });
    }
  }

  productCache = { byHandle, expires: Date.now() + 5 * 60 * 1000 };
  return byHandle;
}

// ─── SERVER ──────────────────────────────────────────────────────────────────

async function startServer() {
  const app = express();
  const server = createServer(app);

  app.use(express.json());

  // ── GET /api/health ───────────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      token: !!ACCESS_TOKEN,
      cache: productCache ? "warm" : "cold",
      cacheExpiresIn: productCache ? Math.round((productCache.expires - Date.now()) / 1000) + "s" : null,
    });
  });

  // ── GET /api/catalog ──────────────────────────────────────────────────────
  app.get("/api/catalog", async (_req, res) => {
    try {
      const products = await getProductsByHandle();

      const looks: Record<string, { name: string; heroImg: string; products: { name: string; price: string; img: string; url: string }[] }> = {};
      for (const [key, def] of Object.entries(LOOK_DEFS)) {
        looks[key] = {
          name: def.name,
          heroImg: def.heroImg,
          // Solo se muestran productos publicados/visibles en la tienda; los
          // despublicados o no encontrados quedan afuera para no mostrar links rotos.
          products: def.handles
            .map((handle) => {
              const p = products.get(handle);
              return p ? { handle, name: p.name, price: p.price, img: p.img, url: p.url } : null;
            })
            .filter((p): p is NonNullable<typeof p> => !!p),
        };
      }

      // Token firmado: el cliente lo guarda la primera vez que ve un look y lo
      // reenvía en /api/cart durante 24hs para que el 15% off se siga aplicando.
      const issuedAt = Date.now();
      res.json({
        looks,
        coupon: {
          code: LOOKCOMPLETO_COUPON,
          percent: LOOKCOMPLETO_DISCOUNT_PERCENT,
          windowMs: LOOKCOMPLETO_WINDOW_MS,
          issuedAt,
          token: mintCouponToken(issuedAt),
        },
      });
    } catch (err) {
      console.error("/api/catalog error:", err);
      res.status(500).json({ error: "Error al cargar el catálogo" });
    }
  });

  // ── POST /api/cart ────────────────────────────────────────────────────────
  // Body: { lookKey: string, talleArriba: string, talleAbajo: string, couponToken?: string }
  // Returns: { checkout_url: string, draft_order_id: number, couponApplied: boolean }
  app.post("/api/cart", async (req, res) => {
    const { lookKey, talleArriba, talleAbajo, couponToken } = req.body as {
      lookKey?: string;
      talleArriba?: string;
      talleAbajo?: string;
      couponToken?: string;
    };

    if (!lookKey || !talleArriba || !talleAbajo) {
      res.status(400).json({ error: "lookKey, talleArriba y talleAbajo son requeridos" });
      return;
    }

    const def = LOOK_DEFS[lookKey];
    if (!def) {
      res.status(400).json({ error: `Look "${lookKey}" no encontrado` });
      return;
    }

    if (!ACCESS_TOKEN) {
      res.status(503).json({ error: "TIENDANUBE_ACCESS_TOKEN no configurado" });
      return;
    }

    try {
      const products = await getProductsByHandle();
      const talleArribaKey = talleArriba.toUpperCase();
      const talleAbajoKey = talleAbajo.toUpperCase();

      // Mapa variant_id → nombre de producto (para errores descriptivos)
      const variantToName = new Map<number, string>();
      const items: { variant_id: number; quantity: number }[] = [];
      for (const handle of def.handles) {
        const p = products.get(handle);
        if (!p) continue;
        const category = PRODUCT_CATEGORIES[handle] ?? "arriba";
        const talleKey = category === "abajo" ? talleAbajoKey : talleArribaKey;
        const variantId = p.variantsByTalle[talleKey] ?? p.defaultVariantId;
        if (variantId) {
          items.push({ variant_id: variantId, quantity: 1 });
          variantToName.set(variantId, p.name);
        }
      }

      if (items.length === 0) {
        res.status(422).json({ error: "No se encontraron variantes para este talle" });
        return;
      }

      // El descuento solo se aplica si el token de cupón (firmado server-side en
      // /api/catalog) sigue vigente dentro de la ventana de 24hs — no se confía
      // en ningún timestamp que mande el cliente sin firmar.
      const couponValid = isCouponTokenValid(couponToken);

      const createDraftOrder = async (cartItems: { variant_id: number; quantity: number }[]) => {
        const payload = {
          contact_name: "Visitante",
          contact_lastname: "LookFinder",
          contact_email: "tu@email.com",
          payment_status: "unpaid",
          sale_channel: "Look Finder Web",
          products: cartItems,
          ...(couponValid
            ? {
                discount: String(LOOKCOMPLETO_DISCOUNT_PERCENT),
                discount_type: "percentage",
                note: `Cupón ${LOOKCOMPLETO_COUPON} aplicado automáticamente (${LOOKCOMPLETO_DISCOUNT_PERCENT}% off look completo)`,
              }
            : {}),
        };
        const r = await fetch(`${TN_BASE}/draft_orders`, {
          method: "POST",
          headers: TN_HEADERS,
          body: JSON.stringify(payload),
        });
        return { res: r, data: await r.json() };
      };

      let { res: tnRes, data } = await createDraftOrder(items);

      // Si TN rechaza por stock, reintentar sin los variants sin stock
      if (!tnRes.ok && data?.variant_ids?.length) {
        const oosIds = new Set<number>(data.variant_ids);
        const oosNames = [...oosIds].map((id) => variantToName.get(id)).filter(Boolean);
        const retryItems = items.filter((i) => !oosIds.has(i.variant_id));

        if (retryItems.length > 0) {
          const retry = await createDraftOrder(retryItems);
          if (retry.res.ok) {
            res.json({
              checkout_url: retry.data.checkout_url,
              draft_order_id: retry.data.id,
              couponApplied: couponValid,
              warning: `Sin stock de algunas prendas: ${oosNames.join(", ")}. Se agregaron las disponibles.`,
            });
            return;
          }
        }

        res.status(422).json({
          error: `Sin stock: ${oosNames.join(", ")}. Probá con otro talle.`,
          detail: data,
        });
        return;
      }

      if (!tnRes.ok) {
        console.error("TN draft_orders error:", data);
        res.status(502).json({ error: "Error al crear el carrito en Tienda Nube", detail: data });
        return;
      }

      res.json({ checkout_url: data.checkout_url, draft_order_id: data.id, couponApplied: couponValid });
    } catch (err) {
      console.error("/api/cart error:", err);
      res.status(500).json({ error: "Error interno al crear el carrito" });
    }
  });

  // ── Static / SPA ─────────────────────────────────────────────────────────
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    // Pre-warm: carga productos al inicio para que el primer usuario no espere
    if (ACCESS_TOKEN) {
      getProductsByHandle()
        .then(() => console.log("Catalog cache warmed"))
        .catch((e) => console.warn("Catalog pre-warm failed:", e));
    }
  });
}

startServer().catch(console.error);
