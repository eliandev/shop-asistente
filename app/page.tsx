import Script from "next/script";

/**
 * Landing de producto: cuenta cómo funciona el asistente y lo presenta como
 * "motor de marca" re-marcable. El chat real vive en /chat y la burbuja
 * flotante de esta misma página ES el widget real (dogfooding).
 */
export default function Landing() {
  return (
    <main className="ld">
      {/* ── Hero ── */}
      <section className="ld-hero">
        <img className="ld-logo" src="/logo.png" alt="Logo de ART-ES" width={72} height={72} />
        <span className="ld-badge">Motor de marca · IA para tiendas Shopify</span>
        <h1>
          Un asistente que responde por tu negocio,
          <em> con datos reales — nunca inventados</em>
        </h1>
        <p className="ld-sub">
          Silvi atiende a tus clientes 24/7 con precios y disponibilidad en vivo
          de tu tienda, tu tono y tus políticas. Se instala con una sola línea
          y se re-marca para cualquier tienda en minutos.
        </p>
        <div className="ld-ctas">
          <a className="ld-btn ld-btn-primario" href="/chat">
            Probalo en vivo →
          </a>
          <a className="ld-btn ld-btn-secundario" href="/admin">
            Ver cómo se personaliza
          </a>
        </div>
        <p className="ld-pista">
          Psst… la burbuja azul de abajo a la derecha es el widget real. Tocala 👇
        </p>
      </section>

      {/* ── Cómo funciona ── */}
      <section className="ld-seccion">
        <h2>Cómo funciona</h2>
        <div className="ld-pasos">
          <article className="ld-paso">
            <span className="ld-num">1</span>
            <h3>Conectá tu catálogo</h3>
            <p>
              Solo el dominio de tu tienda Shopify. Sin tokens ni apps: usa el
              catálogo público para agentes de IA (UCP). Precios y stock
              siempre al día, directo de tu tienda.
            </p>
          </article>
          <article className="ld-paso">
            <span className="ld-num">2</span>
            <h3>Enseñale tu negocio</h3>
            <p>
              Envíos, pagos, políticas y FAQ viven en una base de conocimiento
              editable. Si algo no está ahí, el asistente lo admite con
              honestidad y deriva a tu WhatsApp. Cero datos inventados.
            </p>
          </article>
          <article className="ld-paso">
            <span className="ld-num">3</span>
            <h3>Insertalo donde quieras</h3>
            <p>
              Un link público listo para compartir y una burbuja flotante que
              se pega en tu tienda con una línea, desde el Theme Editor — sin
              tocar el código del tema.
            </p>
          </article>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="ld-seccion ld-alterna">
        <h2>Lo que lo hace distinto</h2>
        <div className="ld-grid">
          <div className="ld-card">
            <span className="ld-icono">🛍️</span>
            <h3>Catálogo en vivo, sin tokens</h3>
            <p>Consulta tu Shopify en tiempo real vía UCP Catalog MCP. Conectar otra tienda = cambiar un dominio.</p>
          </div>
          <div className="ld-card">
            <span className="ld-icono">🧵</span>
            <h3>Te atiende el artesano correcto</h3>
            <p>Según el producto que mira el cliente, responde la voz del taller de Silvi o de don José — fijo toda la sesión.</p>
          </div>
          <div className="ld-card">
            <span className="ld-icono">🛡️</span>
            <h3>Anti-invención de serie</h3>
            <p>Reglas estrictas y fuentes acotadas: si no lo sabe, lo dice y pasa el WhatsApp. La confianza no se negocia.</p>
          </div>
          <div className="ld-card">
            <span className="ld-icono">🖼️</span>
            <h3>Tarjetas de producto con foto</h3>
            <p>Cada pieza mencionada aparece con su foto, precio y enlace directo a comprarla. Del chat al carrito.</p>
          </div>
          <div className="ld-card">
            <span className="ld-icono">⚡</span>
            <h3>Widget de una línea</h3>
            <p>Burbuja flotante con carga perezosa (no frena tu tienda), accesible, y con eventos GA4 para medir uso.</p>
          </div>
          <div className="ld-card">
            <span className="ld-icono">🎨</span>
            <h3>Tu marca, no la nuestra</h3>
            <p>Paleta, logo, avatares, voz y saludo: todo se personaliza. Nada de "look genérico de IA".</p>
          </div>
        </div>
      </section>

      {/* ── Dashboard demo ── */}
      <section className="ld-seccion">
        <h2>Personalizalo desde el dashboard</h2>
        <p className="ld-sub-seccion">
          Colores, avatar, nombre del asistente, saludo y la tienda conectada —
          todo desde un panel, sin tocar código. Miralo en acción:
        </p>
        <div className="ld-ctas ld-ctas-centro">
          <a className="ld-btn ld-btn-primario" href="/admin">
            Abrir demo del panel 🎛️
          </a>
        </div>
      </section>

      {/* ── Snippet ── */}
      <section className="ld-seccion ld-alterna">
        <h2>Así de fácil se instala en tu tienda</h2>
        <p className="ld-sub-seccion">
          Theme Editor → sección <strong>Custom Liquid</strong> en el footer → pegar y guardar:
        </p>
        <pre className="ld-codigo">{`<script
  src="https://silvi-art-es.vercel.app/widget.js"
  defer
  data-color="#0047AB"
  data-etiqueta="Chateá con el taller"
  {% if product %}data-artesano="{{ product.vendor | escape }}"{% endif %}>
</script>`}</pre>
      </section>

      {/* ── Cierre ── */}
      <section className="ld-seccion ld-final">
        <h2>Probalo con el catálogo real de ART-ES</h2>
        <p className="ld-sub-seccion">
          Bolsos tejidos a mano, carteras y cojines bordados de El Salvador —
          preguntale lo que quieras.
        </p>
        <div className="ld-ctas ld-ctas-centro">
          <a className="ld-btn ld-btn-primario" href="/chat">
            Chatear con el taller →
          </a>
          <a
            className="ld-btn ld-btn-secundario"
            href="https://art-es.shop"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visitar art-es.shop
          </a>
        </div>
      </section>

      <footer className="ld-pie">
        Hecho a mano en El Salvador 🇸🇻 · ART-ES · Reto 1 — Vibecoders League 2.0
      </footer>

      {/* El widget real, comiendo nuestro propio dogfood */}
      <Script src="/widget.js" strategy="afterInteractive" />
    </main>
  );
}
