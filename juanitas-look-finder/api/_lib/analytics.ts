// ─── ANALYTICS (funnel de uso) ──────────────────────────────────────────────
// Contadores simples en Redis para el dashboard de /admin. Sin KV configurado
// (dev local sin Upstash), recordEvent es un no-op y getStats devuelve
// enabled:false — nunca rompe la app principal.

import { redis, kvEnabled } from "./kv.js";

export const EVENTS = [
  "family_selected",
  "size_resolved",
  "product_recommended",
  "add_to_cart_click",
  "cart_success",
  "cart_error",
] as const;
export type EventName = (typeof EVENTS)[number];

export const FAMILIES = ["Bombachas", "Camisetas", "Corpiños", "Trajes de baño"] as const;
export type FamilyName = (typeof FAMILIES)[number];

function isEvent(x: string): x is EventName {
  return (EVENTS as readonly string[]).includes(x);
}
function isFamily(x: string): x is FamilyName {
  return (FAMILIES as readonly string[]).includes(x);
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function recordEvent(event: string, family?: string): Promise<void> {
  if (!kvEnabled || !redis || !isEvent(event)) return;

  const day = todayKey();
  const ops: Promise<unknown>[] = [redis.incr(`evt:${event}:total`), redis.incr(`evt:${event}:day:${day}`)];
  if (family && isFamily(family)) ops.push(redis.incr(`evt:${event}:family:${family}`));
  await Promise.all(ops);
}

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export type EventCounts = Record<EventName, number>;
export type Stats = {
  enabled: boolean;
  totals: EventCounts;
  byFamily: Record<FamilyName, EventCounts>;
  daily: { day: string; counts: EventCounts }[];
};

function emptyCounts(): EventCounts {
  return Object.fromEntries(EVENTS.map((e) => [e, 0])) as EventCounts;
}

async function fetchCounts(keys: string[]): Promise<EventCounts> {
  const values = keys.length ? await redis!.mget<(number | null)[]>(...keys) : [];
  return Object.fromEntries(EVENTS.map((e, i) => [e, Number(values[i]) || 0])) as EventCounts;
}

export async function getStats(): Promise<Stats> {
  if (!kvEnabled || !redis) {
    return { enabled: false, totals: emptyCounts(), byFamily: Object.fromEntries(FAMILIES.map((f) => [f, emptyCounts()])) as Stats["byFamily"], daily: [] };
  }

  const days = lastNDays(14);

  const [totals, familyEntries, dailyEntries] = await Promise.all([
    fetchCounts(EVENTS.map((e) => `evt:${e}:total`)),
    Promise.all(FAMILIES.map(async (family) => [family, await fetchCounts(EVENTS.map((e) => `evt:${e}:family:${family}`))] as const)),
    Promise.all(days.map(async (day) => ({ day, counts: await fetchCounts(EVENTS.map((e) => `evt:${e}:day:${day}`)) }))),
  ]);

  return {
    enabled: true,
    totals,
    byFamily: Object.fromEntries(familyEntries) as Stats["byFamily"],
    daily: dailyEntries,
  };
}
