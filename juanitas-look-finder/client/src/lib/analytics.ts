declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
  }
}

function push(event: string, params: Record<string, unknown> = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

// Usuario abre el look finder (llegó desde el botón de la tienda)
export function trackOpen() {
  const ref = document.referrer;
  const src = new URLSearchParams(window.location.search).get("utm_source") ?? "directo";
  push("look_finder_open", { referrer: ref, utm_source: src });
}

// Eligió una familia (colaless, corpiño, etc.)
export function trackFamilySelect(family: string) {
  push("look_finder_family_select", { family });
}

// Respondió una pregunta
export function trackAnswer(family: string, questionId: string, value: string, stepIndex: number) {
  push("look_finder_answer", { family, question_id: questionId, value, step: stepIndex + 1 });
}

// Llegó al resultado
export function trackResult(family: string, size: string, productName: string | null) {
  push("look_finder_result", { family, size, product_name: productName });
}

// Hizo click en "¡LO QUIERO AHORA!" → va al checkout
export function trackAddToCart(family: string, productName: string, size: string, price: number | null) {
  push("look_finder_add_to_cart", { family, product_name: productName, size, price });
}

// Abandonó el form (salió antes de ver resultado)
export function trackAbandon(family: string, lastStep: number, totalSteps: number) {
  push("look_finder_abandon", { family, last_step: lastStep, total_steps: totalSteps, pct_complete: Math.round((lastStep / totalSteps) * 100) });
}

// Click en "Ver productos en la tienda" (salida sin carrito)
export function trackStoreExit(family: string, size: string) {
  push("look_finder_store_exit", { family, size });
}
