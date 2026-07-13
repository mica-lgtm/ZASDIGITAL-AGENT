// Tracking de eventos de uso para el dashboard de /admin. Fire-and-forget:
// nunca debe bloquear ni romper la experiencia del buscador de talles.

export type TrackEvent = "family_selected" | "size_resolved" | "product_recommended" | "add_to_cart_click" | "cart_success" | "cart_error";

export function track(event: TrackEvent, family?: string): void {
  try {
    const payload = JSON.stringify({ event, family });
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon && navigator.sendBeacon("/api/track", blob)) return;
    fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: payload, keepalive: true }).catch(() => {});
  } catch {
    // no-op: el tracking nunca debe romper la UI
  }
}
