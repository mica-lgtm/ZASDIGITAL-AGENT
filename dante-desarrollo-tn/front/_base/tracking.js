/* Telemetría client-side opcional. Emite eventos del experimento.
   Por defecto usa GA4 (gtag) si está presente; si no, no rompe. */
(function (global) {
  function evento(nombre, params) {
    try {
      if (typeof global.gtag === "function") {
        global.gtag("event", nombre, params || {});
      }
      if (global.console) console.debug("[Dante]", nombre, params || {});
    } catch (e) {}
  }
  global.DanteTrack = { evento: evento };
})(window);
