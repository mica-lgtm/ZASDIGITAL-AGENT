import type { VercelRequest, VercelResponse } from "@vercel/node";
import { checkPassword, sessionCookie } from "../_lib/admin-auth.js";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  const { password } = (req.body || {}) as { password?: string };
  if (!checkPassword(password || "")) {
    res.status(401).json({ error: "Contraseña incorrecta" });
    return;
  }
  res.setHeader("Set-Cookie", sessionCookie());
  res.status(200).json({ ok: true });
}
