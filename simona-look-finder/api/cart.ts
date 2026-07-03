import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getProductsByHandle, LOOK_DEFS, ACCESS_TOKEN, TN_BASE, TN_HEADERS } from "./_lib/tn.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { lookKey, talle } = (req.body || {}) as { lookKey?: string; talle?: string };

  if (!lookKey || !talle) {
    res.status(400).json({ error: "lookKey y talle son requeridos" });
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
    const talleKey = talle.toUpperCase();

    const variantToName = new Map<number, string>();
    const items: { variant_id: number; quantity: number }[] = [];

    for (const handle of def.handles) {
      const p = products.get(handle);
      if (!p) continue;
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

    const createDraftOrder = async (cartItems: { variant_id: number; quantity: number }[]) => {
      const payload = {
        contact_name: "Visitante",
        contact_lastname: "LookFinder",
        contact_email: "tu@email.com",
        payment_status: "unpaid",
        sale_channel: "Look Finder Web",
        products: cartItems,
      };
      const r = await fetch(`${TN_BASE}/draft_orders`, {
        method: "POST",
        headers: TN_HEADERS,
        body: JSON.stringify(payload),
      });
      return { res: r, data: await r.json() };
    };

    let { res: tnRes, data } = await createDraftOrder(items);

    if (!tnRes.ok && data?.variant_ids?.length) {
      const oosIds = new Set<number>(data.variant_ids);
      const oosNames = [...oosIds].map((id) => variantToName.get(id)).filter(Boolean);
      const retryItems = items.filter((i) => !oosIds.has(i.variant_id));

      if (retryItems.length > 0) {
        const retry = await createDraftOrder(retryItems);
        if (retry.res.ok) {
          res.status(200).json({
            checkout_url: retry.data.checkout_url,
            draft_order_id: retry.data.id,
            warning: `Sin stock en talle ${talle}: ${oosNames.join(", ")}. Se agregaron las prendas disponibles.`,
          });
          return;
        }
      }

      res.status(422).json({
        error: `Sin stock en talle ${talle}: ${oosNames.join(", ")}. Probá con otro talle.`,
        detail: data,
      });
      return;
    }

    if (!tnRes.ok) {
      console.error("TN draft_orders error:", data);
      res.status(502).json({ error: "Error al crear el carrito en Tienda Nube", detail: data });
      return;
    }

    res.status(200).json({ checkout_url: data.checkout_url, draft_order_id: data.id });
  } catch (err) {
    console.error("/api/cart error:", err);
    res.status(500).json({ error: "Error interno al crear el carrito" });
  }
}
