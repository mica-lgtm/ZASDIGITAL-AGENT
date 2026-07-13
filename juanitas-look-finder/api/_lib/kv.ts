// ─── KV (Upstash Redis) ─────────────────────────────────────────────────────
// Usado para contadores del funnel de uso (ver api/_lib/analytics.ts). Acepta
// tanto las env vars que inyecta la integración de Vercel Marketplace
// (KV_REST_API_URL/TOKEN) como las nativas de una cuenta Upstash directa.

import { Redis } from "@upstash/redis";

const URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";

export const kvEnabled = !!(URL && TOKEN);

export const redis = kvEnabled ? new Redis({ url: URL, token: TOKEN }) : null;
