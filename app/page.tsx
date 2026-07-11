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
        <span className="ld-glifo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="46" height="46">
            <path
              fill="currentColor"
              d="M12 3C6.9 3 2.8 6.6 2.8 11c0 2 .9 3.9 2.4 5.3-.2 1.1-.8 2.6-2 3.7 0 0 2.9-.1 5.1-1.6 1.1.4 2.4.6 3.7.6 5.1 0 9.2-3.6 9.2-8S17.1 3 12 3z"
            />
          </svg>
        </span>
        <span className="ld-badge">Creá tu asistente de IA · para cualquier tienda</span>
        <h1>
          Creá el asistente que responde por tu negocio,
          <em> con datos reales — nunca inventados</em>
        </h1>
        <p className="ld-sub">
          Una marca de belleza crea a <strong>María</strong>; una de artesanía,
          a <strong>Silvi</strong>. Tu asistente atiende 24/7 con precios y
          disponibilidad en vivo de tu tienda Shopify (solo el dominio, sin
          tokens), tu tono y tus políticas — y se instala con una línea.
        </p>
        <div className="ld-ctas">
          <a className="ld-btn ld-btn-primario" href="/crear">
            Creá tu asistente gratis →
          </a>
          <a className="ld-btn ld-btn-secundario" href="/chat">
            Ver la demo en vivo (ART-ES)
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

      {/* ── Creador ── */}
      <section className="ld-seccion">
        <h2>Tu asistente, en 2 minutos y sin código</h2>
        <p className="ld-sub-seccion">
          Nombre, colores, personalidad, tu catálogo Shopify y los datos de tu
          negocio — el creador genera el link de tu asistente y el widget
          listos para compartir. El link ES tu asistente: sin cuentas, sin
          base de datos.
        </p>
        <div className="ld-ctas ld-ctas-centro">
          <a className="ld-btn ld-btn-primario" href="/crear">
            Abrir el creador 🎛️
          </a>
          <a className="ld-btn ld-btn-secundario" href="/admin">
            Ver el panel de gestión (demo)
          </a>
        </div>
      </section>

      {/* ── Precios ── */}
      <section className="ld-seccion">
        <h2>Simple: probás gratis, pagás cuando lo querés en tu tienda</h2>
        <div className="ld-grid ld-precios">
          <div className="ld-card">
            <span className="ld-icono">🔗</span>
            <h3>Link compartible — Gratis</h3>
            <p>
              Creá tu asistente y compartí su link donde quieras: redes, bio,
              WhatsApp. Catálogo en vivo, tarjetas con foto y anti-invención
              incluidos. Gratis para siempre.
            </p>
          </div>
          <div className="ld-card ld-card-pro">
            <span className="ld-icono">⚡</span>
            <h3>Widget en tu tienda — Pro</h3>
            <p>
              La burbuja flotante atendiendo dentro de tu propio sitio, con tu
              licencia activada. Pedí la activación desde el creador y te la
              enviamos al instante.
            </p>
          </div>
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
        <h2>Miralo funcionando con una tienda real: ART-ES</h2>
        <p className="ld-sub-seccion">
          Silvi y don José atienden con el catálogo en vivo de art-es.shop —
          bolsos tejidos a mano, carteras y cojines bordados de El Salvador.
          Preguntales lo que quieras.
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
        Hecho en El Salvador 🇸🇻 · Demo con la tienda real de ART-ES · Reto 1 — Vibecoders League 2.0
      </footer>

      {/* El widget real, comiendo nuestro propio dogfood */}
      <Script src="/widget.js" strategy="afterInteractive" />
    </main>
  );
}
