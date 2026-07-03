import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getProductsByHandle,
  LOOK_DEFS,
  LOOKCOMPLETO_COUPON,
  LOOKCOMPLETO_DISCOUNT_PERCENT,
  LOOKCOMPLETO_WINDOW_MS,
  mintCouponToken,
} from "./_lib/tn.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const products = await getProductsByHandle();

    const looks: Record<
      string,
      { name: string; heroImg: string; products: { name: string; price: string; img: string; url: string }[] }
    > = {};

    for (const [key, def] of Object.entries(LOOK_DEFS)) {
      looks[key] = {
        name: def.name,
        heroImg: def.heroImg,
        // Solo se muestran productos publicados/visibles en la tienda; los
        // despublicados o no encontrados quedan afuera para no mostrar links rotos.
        products: def.handles
          .map((handle) => products.get(handle))
          .filter((p): p is NonNullable<typeof p> => !!p)
          .map((p) => ({ name: p.name, price: p.price, img: p.img, url: p.url })),
      };
    }

    // Token firmado: el cliente lo guarda la primera vez que ve un look y lo
    // reenvía en /api/cart durante 24hs para que el 15% off se siga aplicando.
    const issuedAt = Date.now();
    res.status(200).json({
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
}
