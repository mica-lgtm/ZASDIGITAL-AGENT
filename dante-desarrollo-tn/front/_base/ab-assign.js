/* Asignación A/B estable por visitante (persistida en localStorage). */
(function (global) {
  function variante(expId, pesoA) {
    var clave = "dante_ab_" + expId;
    var guardada = localStorage.getItem(clave);
    if (guardada) return guardada;
    var v = Math.random() < (pesoA == null ? 0.5 : pesoA) ? "A" : "B";
    localStorage.setItem(clave, v);
    return v;
  }
  global.DanteAB = { variante: variante };
})(window);
