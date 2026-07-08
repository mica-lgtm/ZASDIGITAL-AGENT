import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ACCESS_TOKEN } from "./_lib/tn.js";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.status(200).json({ ok: true, token: !!ACCESS_TOKEN });
}
