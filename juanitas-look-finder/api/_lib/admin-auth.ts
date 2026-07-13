// ─── ADMIN AUTH ──────────────────────────────────────────────────────────
// Password única compartida (env var ADMIN_PASSWORD). Sin ADMIN_PASSWORD
// configurado, el panel queda inaccesible por defecto (fail-closed).

import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
export const ADMIN_COOKIE_NAME = "juanitas_admin";

function expectedToken(): string {
  return crypto.createHash("sha256").update(ADMIN_PASSWORD).digest("hex");
}

export function checkPassword(password: string): boolean {
  if (!ADMIN_PASSWORD || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(ADMIN_PASSWORD);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function sessionCookie(): string {
  return `${ADMIN_COOKIE_NAME}=${expectedToken()}; HttpOnly; Path=/; Max-Age=2592000; SameSite=Lax`;
}

export function clearCookie(): string {
  return `${ADMIN_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;
}

function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  (header || "").split(";").forEach((pair) => {
    const idx = pair.indexOf("=");
    if (idx === -1) return;
    out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
  });
  return out;
}

export function isAuthed(cookieHeader: string | undefined): boolean {
  if (!ADMIN_PASSWORD) return false;
  const token = parseCookies(cookieHeader)[ADMIN_COOKIE_NAME];
  if (!token) return false;
  const a = Buffer.from(token);
  const b = Buffer.from(expectedToken());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
