import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isAuthed } from "../_lib/admin-auth.js";
import { getStats } from "../_lib/analytics.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isAuthed(req.headers.cookie)) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  try {
    const stats = await getStats();
    res.status(200).json(stats);
  } catch (err) {
    console.error("/api/admin/stats error:", err);
    res.status(500).json({ error: "Error al cargar estadísticas" });
  }
}
