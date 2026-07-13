import type { VercelRequest, VercelResponse } from "@vercel/node";
import { recordEvent } from "./_lib/analytics.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  try {
    const { event, family } = (req.body || {}) as { event?: string; family?: string };
    if (event) await recordEvent(event, family);
  } catch (err) {
    console.error("/api/track error:", err);
  }
  // Fire-and-forget desde el cliente (sendBeacon): siempre 204, nunca bloquea la UI.
  res.status(204).end();
}
