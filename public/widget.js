/**
 * ============================================================================
 *  SILVI WIDGET — burbuja flotante de chat para cualquier sitio
 * ============================================================================
 *  Inserta un botón flotante que abre el asistente en un panel (iframe).
 *  Pensado para tiendas Shopify (sección "Custom Liquid") o cualquier web.
 *
 *  Uso básico (la URL del chat se deduce del propio script):
 *    <script src="https://TU-APP.vercel.app/widget.js" defer></script>
 *
 *  Personalización opcional con atributos data-*:
 *    <script src="https://TU-APP.vercel.app/widget.js" defer
 *            data-color="#0047AB"          — color del botón
 *            data-posicion="derecha"       — "derecha" (default) o "izquierda"
 *            data-etiqueta="¿Te ayudo?">   — tooltip accesible del botón
 *    </script>
 *
 *  Eventos: empuja eventos a window.dataLayer (GA4) si existe:
 *    silvi_widget_abierto / silvi_widget_cerrado
 * ============================================================================
 */
(function () {
  "use strict";
  if (window.__silviWidgetCargado) return;
  window.__silviWidgetCargado = true;

  var script = document.currentScript;
  var origen;
  try {
    origen = new URL(script.src).origin;
  } catch (e) {
    return; // sin origen válido no hay chat que mostrar
  }

  var color = (script.dataset && script.dataset.color) || "#0047AB";
  var posicion = (script.dataset && script.dataset.posicion) === "izquierda" ? "left" : "right";
  var etiqueta = (script.dataset && script.dataset.etiqueta) || "Abrir chat de asistencia";

  function evento(nombre) {
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event: nombre });
    }
  }

  /* ---------- estilos ---------- */
  var css =
    ".silvi-btn{position:fixed;bottom:20px;" + posicion + ":20px;z-index:2147483000;" +
    "width:60px;height:60px;border-radius:50%;border:none;cursor:pointer;" +
    "background:" + color + ";box-shadow:0 8px 24px rgba(0,0,0,.28);" +
    "display:flex;align-items:center;justify-content:center;padding:0;" +
    "transition:transform .15s ease;}" +
    ".silvi-btn:hover{transform:scale(1.06);}" +
    ".silvi-btn:focus-visible{outline:3px solid #E8B023;outline-offset:2px;}" +
    ".silvi-btn svg{width:30px;height:30px;fill:#fff;}" +
    ".silvi-panel{position:fixed;bottom:92px;" + posicion + ":20px;z-index:2147483000;" +
    "width:min(380px,calc(100vw - 40px));height:min(600px,calc(100vh - 120px));" +
    "border:none;border-radius:18px;box-shadow:0 24px 64px rgba(0,0,0,.32);" +
    "background:#fff;display:none;}" +
    ".silvi-panel.abierto{display:block;}" +
    "@media (max-width:480px){.silvi-panel{bottom:0;" + posicion + ":0;width:100vw;" +
    "height:100dvh;border-radius:0;}}";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- botón flotante ---------- */
  var btn = document.createElement("button");
  btn.className = "silvi-btn";
  btn.type = "button";
  btn.setAttribute("aria-label", etiqueta);
  btn.setAttribute("aria-expanded", "false");
  // Ícono burbuja de chat (abierto) / X (cerrado)
  var iconoChat =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.9 3 2.8 6.6 2.8 11c0 2 .9 3.9 2.4 5.3-.2 1.1-.8 2.6-2 3.7 0 0 2.9-.1 5.1-1.6 1.1.4 2.4.6 3.7.6 5.1 0 9.2-3.6 9.2-8S17.1 3 12 3z"/></svg>';
  var iconoCerrar =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19l1.4-1.4L13.4 12 19 6.4 17.6 5 12 10.6 6.4 5z"/></svg>';
  btn.innerHTML = iconoChat;

  /* ---------- panel con el chat ---------- */
  var panel = document.createElement("iframe");
  panel.className = "silvi-panel";
  panel.title = "Chat de asistencia";
  panel.setAttribute("loading", "lazy");

  var abierto = false;
  btn.addEventListener("click", function () {
    abierto = !abierto;
    if (abierto && !panel.src) {
      panel.src = origen + "/"; // carga perezosa: solo al primer clic
    }
    panel.classList.toggle("abierto", abierto);
    btn.innerHTML = abierto ? iconoCerrar : iconoChat;
    btn.setAttribute("aria-expanded", String(abierto));
    evento(abierto ? "silvi_widget_abierto" : "silvi_widget_cerrado");
  });

  document.body.appendChild(panel);
  document.body.appendChild(btn);
})();
