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

// Fallback estático para cuando TN API no está disponible
const STATIC_PRODUCTS: Record<string, { name: string; price: string; img: string; url: string }> = {
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

// Categoría de cada prenda — determina qué talle se usa al armar el carrito.
const PRODUCT_CATEGORIES: Record<string, "arriba" | "abajo"> = {
  "campera-anada-bordo-k84tk": "arriba",
  "jean-vigor-1nmtv": "abajo",
  "remera-basica-escote-redondo-leon-negro": "arriba",
  "remera-teddy-petroleo-1xnfr": "arriba",
  "pantalon-terra-chocolate-1w1na": "abajo",
  "campera-nero-verde-38emi": "arriba",
  "camisa-lidia": "arriba",
  "jean-mom-negro-gastado1": "abajo",
  "zueco-pantu-negro": "abajo",
  "blazer-bouquet-negro-142qu": "arriba",
  "pantalon-algarrobo-tvt0h": "abajo",
  "blazer-mendoza-chocolate-liso-1j10l": "arriba",
  "chaleco-tejido-gris-1ssdp": "arriba",
  "texana-saison-t6iwy": "abajo",
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
