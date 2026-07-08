import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getLiveCatalog } from "./_lib/tn.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const catalog = await getLiveCatalog();
    res.status(200).json({ products: Array.from(catalog.values()) });
  } catch (err) {
    console.error("/api/catalog error:", err);
    res.status(500).json({ error: "Error al cargar el catálogo" });
  }
}
