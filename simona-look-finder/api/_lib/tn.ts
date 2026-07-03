// ─── TIENDA NUBE SHARED LOGIC ───────────────────────────────────────────────
// Used by /api/catalog and /api/cart Vercel Functions.

export const STORE_ID = process.env.TIENDANUBE_STORE_ID || "601496";
export const ACCESS_TOKEN = process.env.TIENDANUBE_ACCESS_TOKEN || "";
export const TN_BASE = `https://api.tiendanube.com/v1/${STORE_ID}`;
export const TN_HEADERS = {
  "Content-Type": "application/json",
  Authentication: `bearer ${ACCESS_TOKEN}`,
  "User-Agent": "Simona-LookFinder (mica@zasdigital.com)",
};

// ─── LOOK DEFINITIONS ────────────────────────────────────────────────────────

export type LookDef = { name: string; heroImg: string; handles: string[] };

export const LOOK_DEFS: Record<string, LookDef> = {
  "casual-clasico": {
    name: "Look Añada",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310519663489253832/GCNEfmb632ab7e3kLMogtf/simona_casual_card-agapjfK4g8LJxGyRBt33S5.webp",
    handles: ["campera-anada-bordo-k84tk", "jean-vigor-1nmtv", "remera-basica-escote-redondo-leon-negro"],
  },
  "casual-trendy": {
    name: "Look Teddy",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310519663489253832/GCNEfmb632ab7e3kLMogtf/simona_casual_card-agapjfK4g8LJxGyRBt33S5.webp",
    handles: ["remera-teddy-petroleo-1xnfr", "pantalon-terra-chocolate-1w1na", "campera-nero-verde-38emi"],
  },
  "casual-relaxed": {
    name: "Look Domaine",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310519663489253832/GCNEfmb632ab7e3kLMogtf/simona_casual_card-agapjfK4g8LJxGyRBt33S5.webp",
    handles: ["camisa-lidia", "jean-mom-negro-gastado1", "zueco-pantu-negro"],
  },
  "oficina-clasico": {
    name: "Look Bouquet",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310519663489253832/GCNEfmb632ab7e3kLMogtf/simona_office_card-NngjnDLLBdaegFD8sxdn5A.webp",
    handles: ["blazer-bouquet-negro-142qu", "pantalon-algarrobo-tvt0h", "camisa-lidia"],
  },
  "oficina-trendy": {
    name: "Look Mendoza",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310519663489253832/GCNEfmb632ab7e3kLMogtf/simona_office_card-NngjnDLLBdaegFD8sxdn5A.webp",
    handles: ["blazer-mendoza-chocolate-liso-1j10l", "pantalon-terra-chocolate-1w1na", "remera-basica-escote-redondo-leon-negro"],
  },
  "oficina-relaxed": {
    name: "Look Chaleco",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310519663489253832/GCNEfmb632ab7e3kLMogtf/simona_office_card-NngjnDLLBdaegFD8sxdn5A.webp",
    handles: ["chaleco-tejido-gris-1ssdp", "pantalon-algarrobo-tvt0h", "camisa-lidia"],
  },
  "noche-clasico": {
    name: "Look Animal Print",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310519663489253832/GCNEfmb632ab7e3kLMogtf/simona_night_card-AhEiPNAPcxAc6aryPKhdxG.webp",
    handles: ["blazer-bouquet-negro-142qu", "pantalon-algarrobo-tvt0h", "texana-saison-t6iwy"],
  },
  "noche-trendy": {
    name: "Look Nero",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310519663489253832/GCNEfmb632ab7e3kLMogtf/simona_night_card-AhEiPNAPcxAc6aryPKhdxG.webp",
    handles: ["campera-nero-verde-38emi", "jean-mom-negro-gastado1", "zueco-pantu-negro"],
  },
  "noche-relaxed": {
    name: "Look Saison",
    heroImg: "https://d2xsxph8kpxj0f.cloudfront.net/310519663489253832/GCNEfmb632ab7e3kLMogtf/simona_night_card-AhEiPNAPcxAc6aryPKhdxG.webp",
    handles: ["campera-anada-bordo-k84tk", "pantalon-terra-chocolate-1w1na", "texana-saison-t6iwy"],
  },
};

export const STATIC_PRODUCTS: Record<string, { name: string; price: string; img: string; url: string }> = {
  "campera-anada-bordo-k84tk": { name: "Campera Añada Bordo", price: "$82.500", img: "https://simonashop.com.ar/archivos/productos/campera-anada-bordo-k84tk-1.webp", url: "https://www.simonashop.com.ar/productos/campera-anada-bordo-k84tk/" },
  "jean-vigor-1nmtv": { name: "Jean Vigor", price: "$95.900", img: "https://simonashop.com.ar/archivos/productos/jean-vigor-negro-gastado-1.webp", url: "https://www.simonashop.com.ar/productos/jean-vigor-1nmtv/" },
  "remera-basica-escote-redondo-leon-negro": { name: "Remera León Negro", price: "$33.900", img: "https://simonashop.com.ar/archivos/productos/remera-leon-negro-1.webp", url: "https://www.simonashop.com.ar/productos/remera-basica-escote-redondo-leon-negro/" },
  "remera-teddy-petroleo-1xnfr": { name: "Remera Teddy Petróleo", price: "$32.500", img: "https://simonashop.com.ar/archivos/productos/remera-teddy-petroleo-1.webp", url: "https://www.simonashop.com.ar/productos/remera-teddy-petroleo-1xnfr/" },
  "pantalon-terra-chocolate-1w1na": { name: "Pantalón Terra Chocolate", price: "$75.500", img: "https://simonashop.com.ar/archivos/productos/pantalon-terra-chocolate-1.webp", url: "https://www.simonashop.com.ar/productos/pantalon-terra-chocolate-1w1na/" },
  "campera-nero-verde-38emi": { name: "Campera Nero Verde", price: "$95.500", img: "https://simonashop.com.ar/archivos/productos/campera-nero-verde-1.webp", url: "https://www.simonashop.com.ar/productos/campera-nero-verde-38emi/" },
  "camisa-lidia": { name: "Camisa Domaine", price: "$59.990", img: "https://simonashop.com.ar/archivos/productos/camisa-domaine-blanca-1.webp", url: "https://www.simonashop.com.ar/productos/camisa-lidia/" },
  "jean-mom-negro-gastado1": { name: "Jean Mom Maison Negro", price: "$65.900", img: "https://simonashop.com.ar/archivos/productos/jean-mom-maison-negro-gastado-1.webp", url: "https://www.simonashop.com.ar/productos/jean-mom-negro-gastado1/" },
  "zueco-pantu-negro": { name: "Zueco Pantu Negro", price: "$149.500", img: "https://simonashop.com.ar/archivos/productos/zueco-pantu-negro-1.webp", url: "https://www.simonashop.com.ar/productos/zueco-pantu-negro/" },
  "blazer-bouquet-negro-142qu": { name: "Blazer Bouquet Negro", price: "$92.500", img: "https://simonashop.com.ar/archivos/productos/blazer-bouquet-negro-1.webp", url: "https://www.simonashop.com.ar/productos/blazer-bouquet-negro-142qu/" },
  "pantalon-algarrobo-tvt0h": { name: "Pantalón Algarrobo", price: "$64.900", img: "https://simonashop.com.ar/archivos/productos/pantalon-algarrobo-1.webp", url: "https://www.simonashop.com.ar/productos/pantalon-algarrobo-tvt0h/" },
  "blazer-mendoza-chocolate-liso-1j10l": { name: "Blazer Mendoza Chocolate Liso", price: "$97.500", img: "https://simonashop.com.ar/archivos/productos/blazer-mendoza-chocolate-liso-1.webp", url: "https://www.simonashop.com.ar/productos/blazer-mendoza-chocolate-liso-1j10l/" },
  "chaleco-tejido-gris-1ssdp": { name: "Chaleco Tejido Gris", price: "$62.500", img: "https://simonashop.com.ar/archivos/productos/chaleco-tejido-gris-1.webp", url: "https://www.simonashop.com.ar/productos/chaleco-tejido-gris-1ssdp/" },
  "texana-saison-t6iwy": { name: "Texana Saison", price: "$218.500", img: "https://simonashop.com.ar/archivos/productos/texana-saison-1.webp", url: "https://www.simonashop.com.ar/productos/texana-saison-t6iwy/" },
};

// ─── TN PRODUCT IDs ──────────────────────────────────────────────────────────
// Verificados contra API real. Permite GET /products/{id} directo (14 req paralelos).

export const PRODUCT_IDS: Record<string, number> = {
  "campera-anada-bordo-k84tk": 334464832,
  "jean-vigor-1nmtv": 339259104,
  "remera-basica-escote-redondo-leon-negro": 294060832,
  "remera-teddy-petroleo-1xnfr": 339268124,
  "pantalon-terra-chocolate-1w1na": 305065764,
  "campera-nero-verde-38emi": 342193787,
  "camisa-lidia": 298655918,
  "jean-mom-negro-gastado1": 290364726,
  "zueco-pantu-negro": 256649340,
  "blazer-bouquet-negro-142qu": 330600330,
  "pantalon-algarrobo-tvt0h": 338366607,
  "blazer-mendoza-chocolate-liso-1j10l": 344086012,
  "chaleco-tejido-gris-1ssdp": 342200731,
  "texana-saison-t6iwy": 330834506,
};

// ─── TN TYPES ────────────────────────────────────────────────────────────────

export type TNVariant = {
  id: number;
  price: string;
  promotional_price: string | null;
  stock: number | null;
  values: (string | { es?: string; en?: string })[];
};

export type TNProduct = {
  id: number;
  name: { es?: string; en?: string } | string;
  handle: { es?: string; en?: string } | string;
  images: { src: string }[];
  canonical_url: string;
  variants: TNVariant[];
  published?: boolean;
};

export type EnrichedProduct = {
  name: string;
  price: string;
  img: string;
  url: string;
  variantsByTalle: Record<string, number>;
  defaultVariantId: number | null;
  published: boolean;
};

export function tnStr(val: { es?: string; en?: string } | string | undefined): string {
  if (!val) return "";
  if (typeof val === "string") return val;
  return val.es || val.en || "";
}

export function formatPrice(price: string | number): string {
  const num = typeof price === "string" ? parseFloat(price) : price;
  if (isNaN(num)) return "$0";
  return `$${Math.round(num).toLocaleString("es-AR")}`;
}

export function extractTalle(variant: TNVariant): string {
  if (!Array.isArray(variant.values) || variant.values.length === 0) return "";
  const v = variant.values[0];
  if (typeof v === "string") return v.toUpperCase();
  return (v.es || v.en || "").toUpperCase();
}

export function enrichProduct(p: TNProduct, handle?: string): EnrichedProduct {
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

export async function getProductsByHandle(): Promise<Map<string, EnrichedProduct>> {
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

  for (const [handle, s] of Object.entries(STATIC_PRODUCTS)) {
    if (!byHandle.has(handle) && !unpublished.has(handle)) {
      byHandle.set(handle, { ...s, variantsByTalle: {}, defaultVariantId: null, published: true });
    }
  }

  productCache = { byHandle, expires: Date.now() + 5 * 60 * 1000 };
  return byHandle;
}
