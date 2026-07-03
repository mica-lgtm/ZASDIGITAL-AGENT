import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getProductsByHandle, LOOK_DEFS } from "./_lib/tn.js";

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

    res.status(200).json({ looks });
  } catch (err) {
    console.error("/api/catalog error:", err);
    res.status(500).json({ error: "Error al cargar el catálogo" });
  }
}
