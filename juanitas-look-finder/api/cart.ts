import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getProductsByHandle,
  LOOK_DEFS,
  PRODUCT_CATEGORIES,
  ACCESS_TOKEN,
  TN_BASE,
  TN_HEADERS,
  LOOKCOMPLETO_COUPON,
  LOOKCOMPLETO_DISCOUNT_PERCENT,
  isCouponTokenValid,
} from "./_lib/tn.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { lookKey, talleArriba, talleAbajo, couponToken } = (req.body || {}) as {
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

    res.status(200).json({ checkout_url: data.checkout_url, draft_order_id: data.id, couponApplied: couponValid });
  } catch (err) {
    console.error("/api/cart error:", err);
    res.status(500).json({ error: "Error interno al crear el carrito" });
  }
}
