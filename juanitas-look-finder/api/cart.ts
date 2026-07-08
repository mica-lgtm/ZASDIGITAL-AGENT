import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ACCESS_TOKEN, TN_BASE, TN_HEADERS, getRawProduct, tnStr, type TNVariantRaw } from "./_lib/tn.js";

function normalize(s: string): string {
  return (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
}

function findVariant(variants: TNVariantRaw[], size: string, color?: string): TNVariantRaw | null {
  const normSize = normalize(size);
  const normColor = color ? normalize(color) : null;
  const candidates = variants.filter((v) => {
    const vals = v.values.map((x) => normalize(tnStr(x)));
    const sizeMatch = vals.includes(normSize);
    const colorMatch = normColor ? vals.includes(normColor) : true;
    return sizeMatch && colorMatch;
  });
  return candidates[0] || null;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { handle, size, color } = (req.body || {}) as { handle?: string; size?: string; color?: string };
  if (!handle || !size) {
    res.status(400).json({ error: "handle y size son requeridos" });
    return;
  }
  if (!ACCESS_TOKEN) {
    res.status(503).json({ error: "TIENDANUBE_ACCESS_TOKEN no configurado" });
    return;
  }

  try {
    const raw = await getRawProduct(handle);
    if (!raw) {
      res.status(404).json({ error: "Producto no encontrado en la tienda" });
      return;
    }

    const variant = findVariant(raw.variants, size, color);
    if (!variant) {
      res.status(422).json({ error: "No se encontró una variante disponible para ese talle/color" });
      return;
    }

    const payload = {
      contact_name: "Visitante",
      contact_lastname: "MiTalleJuanitas",
      contact_email: "tu@email.com",
      payment_status: "unpaid",
      sale_channel: "Mi Talle Juanitas",
      products: [{ variant_id: variant.id, quantity: 1 }],
    };

    const tnRes = await fetch(`${TN_BASE}/draft_orders`, {
      method: "POST",
      headers: TN_HEADERS,
      body: JSON.stringify(payload),
    });
    const data = await tnRes.json();

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
