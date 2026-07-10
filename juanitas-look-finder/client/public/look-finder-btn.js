(function () {
  var LOOK_FINDER_URL =
    "https://juanitas-look-finder.vercel.app" +
    "?utm_source=tienda&utm_medium=boton-flotante&utm_campaign=look-finder";
  var BTN_ID = "jt-look-finder-btn";

  function trackClick() {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "look_finder_click",
      event_category: "look_finder",
      event_label: "boton_flotante",
      page_location: window.location.href,
    });
  }

  function inject() {
    if (document.getElementById(BTN_ID)) return;

    var btn = document.createElement("a");
    btn.id = BTN_ID;
    btn.href = LOOK_FINDER_URL;
    btn.target = "_blank";
    btn.rel = "noopener noreferrer";
    btn.textContent = "✨ Encontrá tu talle";
    btn.addEventListener("click", trackClick);
    btn.style.cssText = [
      "display:inline-flex",
      "align-items:center",
      "justify-content:center",
      "gap:6px",
      "background:#f41f82",
      "color:#fff",
      "font-family:Poppins,Inter,-apple-system,sans-serif",
      "font-size:15px",
      "font-weight:800",
      "letter-spacing:-0.01em",
      "padding:14px 28px",
      "border-radius:999px",
      "box-shadow:0 8px 24px rgba(244,31,130,0.32)",
      "text-decoration:none",
      "cursor:pointer",
      "transition:transform .15s,box-shadow .15s",
      "position:fixed",
      "bottom:24px",
      "right:20px",
      "z-index:9999",
    ].join(";");

    btn.addEventListener("mouseenter", function () {
      btn.style.transform = "translateY(-2px)";
      btn.style.boxShadow = "0 12px 32px rgba(244,31,130,0.42)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.transform = "";
      btn.style.boxShadow = "0 8px 24px rgba(244,31,130,0.32)";
    });

    document.body.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inject);
  } else {
    inject();
  }
})();
