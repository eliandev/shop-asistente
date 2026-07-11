import Script from "next/script";
import {
  codificarConfig,
  sanitizarConfig,
} from "@/lib/config-asistente";

/**
 * Landing de la PLATAFORMA (negro + lima, estilo estudio/agencia):
 * marco con grilla visible, tipografía condensada gigante, etiquetas
 * [ENTRE CORCHETES], demos numeradas y barra CTA full-width.
 * El chat vive en /chat y la burbuja flotante de esta página ES el
 * widget real (dogfooding). ART-ES es la demo con tienda real.
 */

// Demo clickeable de asistente personalizado: María (catálogo ColourPop)
const MARIA = sanitizarConfig({
  marca: "Glow Beauty",
  asistente: "María",
  rubro: "productos de belleza y skincare",
  saludo: "¡Hola! Soy María, de Glow Beauty 💄 ¿Buscás algo para tu rutina?",
  color: "#C2185B",
  fondo: "#FDF0F4",
  dominio: "colourpop.com",
  whatsapp: "",
  web: "",
  datos: "",
});
const LINK_MARIA = `/chat?c=${codificarConfig(MARIA)}`;

export default function Landing() {
  return (
    <main className="ld lx">
      <div className="lx-marco">
        {/* ── banda rayada superior ── */}
        <div className="lx-franja" aria-hidden="true" />

        {/* ── nav ── */}
        <header className="lx-nav">
          <nav className="lx-menu" aria-label="Navegación principal">
            <a href="/">Inicio</a>
            <a href="#producto">El producto</a>
            <a href="#demos">Demos</a>
            <a href="#precios">Precios</a>
          </nav>
          <div className="lx-logo">SILVI°</div>
          <a className="lx-btn-nav" href="/crear">↳ Crear asistente</a>
        </header>

        {/* ── hero ── */}
        <section className="lx-hero">
          <div className="lx-hero-izq">
            <h1>
              Creá<br />Conectá<br />Vendé
            </h1>
          </div>
          <div className="lx-hero-der">
            <p className="lx-tagline">
              Asistentes de IA que responden por tu negocio
              con datos reales — nunca inventados
            </p>
            <div className="lx-minis" aria-label="Asistentes de ejemplo">
              <a className="lx-mini" href="/chat" style={{ "--mini": "#0047AB" } as React.CSSProperties}>
                <span className="lx-mini-avatar">S</span>
                <span>
                  <strong>Silvi</strong>
                  ART-ES · artesanía
                </span>
              </a>
              <a className="lx-mini" href={LINK_MARIA} style={{ "--mini": "#C2185B" } as React.CSSProperties}>
                <span className="lx-mini-avatar">M</span>
                <span>
                  <strong>María</strong>
                  Glow Beauty · belleza
                </span>
              </a>
              <a className="lx-mini" href="/crear" style={{ "--mini": "#C9F73A" } as React.CSSProperties}>
                <span className="lx-mini-avatar">+</span>
                <span>
                  <strong>El tuyo</strong>
                  en 2 minutos
                </span>
              </a>
            </div>
            <span className="lx-scroll">( deslizá )</span>
          </div>
        </section>

        {/* ── el producto ── */}
        <section className="lx-sobre" id="producto">
          <span className="lx-etiqueta">[ el producto ]</span>
          <div className="lx-sobre-fila">
            <h2>
              Tu catálogo Shopify en vivo, tu conocimiento y tu marca,
              atendiendo clientes 24/7 — sin inventar jamás un precio.
            </h2>
            <div className="lx-desde">
              <span>desde</span>
              <strong>2026</strong>
            </div>
          </div>
          <div className="lx-stats">
            <div className="lx-stat">
              <strong>2 min</strong>
              <span>de idea a asistente publicado, sin código ni cuentas</span>
            </div>
            <div className="lx-stat">
              <strong>1 línea</strong>
              <span>para instalar el widget en tu tienda desde el Theme Editor</span>
            </div>
            <div className="lx-stat">
              <strong>24/7</strong>
              <span>respuestas con precios y stock en vivo de tu Shopify, sin tokens</span>
            </div>
            <div className="lx-stat lx-stat-acento">
              <strong>0</strong>
              <span>datos inventados: si no lo sabe, lo admite y deriva a tu WhatsApp</span>
            </div>
          </div>
        </section>

        {/* ── demos ── */}
        <section className="lx-demos" id="demos">
          <span className="lx-etiqueta lx-centro">[ demos en vivo ]</span>
          <h2 className="lx-demos-titulo">
            Creados para vender<br />hechos para responder
          </h2>

          <article className="lx-demo">
            <div className="lx-demo-info">
              <span className="lx-demo-num">001.</span>
              <h3>ART-ES — Silvi &amp; Don José</h3>
              <p>
                La demo con tienda real: artesanía salvadoreña hecha a mano.
                Atiende el artesano correcto según la pieza que mirás.
              </p>
              <div className="lx-chips">
                <span>catálogo vivo</span>
                <span>2 artesanos</span>
              </div>
              <a className="lx-demo-link" href="/chat">↳ Abrir demo</a>
            </div>
            <div className="lx-tiles">
              <span className="lx-tile" style={{ background: "linear-gradient(140deg,#0047AB,#002a69)" }}>🧶</span>
              <span className="lx-tile" style={{ background: "linear-gradient(140deg,#1b5fd0,#0047AB)" }}>👜</span>
              <span className="lx-tile" style={{ background: "linear-gradient(140deg,#e8b023,#b4471b)" }}>🧺</span>
              <span className="lx-tile" style={{ background: "linear-gradient(140deg,#2e7d32,#14532d)" }}>🪵</span>
            </div>
          </article>

          <article className="lx-demo">
            <div className="lx-demo-info">
              <span className="lx-demo-num">002.</span>
              <h3>Glow Beauty — María</h3>
              <p>
                Creada en 2 minutos con el creador, conectada al catálogo real
                de ColourPop. Así se ve TU marca en el motor.
              </p>
              <div className="lx-chips">
                <span>creada en /crear</span>
                <span>catálogo colourpop</span>
              </div>
              <a className="lx-demo-link" href={LINK_MARIA}>↳ Chatear con María</a>
            </div>
            <div className="lx-tiles">
              <span className="lx-tile" style={{ background: "linear-gradient(140deg,#C2185B,#7c0f3a)" }}>💄</span>
              <span className="lx-tile" style={{ background: "linear-gradient(140deg,#f06292,#C2185B)" }}>💅</span>
              <span className="lx-tile" style={{ background: "linear-gradient(140deg,#fdb4c9,#f06292)" }}>🌸</span>
              <span className="lx-tile" style={{ background: "linear-gradient(140deg,#8e24aa,#4a148c)" }}>✨</span>
            </div>
          </article>

          <article className="lx-demo">
            <div className="lx-demo-info">
              <span className="lx-demo-num">003.</span>
              <h3>Tu marca — tu asistente</h3>
              <p>
                Nombre, personalidad, colores, tu catálogo y tus políticas.
                El link es tu asistente: compartilo donde quieras, gratis.
              </p>
              <div className="lx-chips">
                <span>tu catálogo</span>
                <span>tu voz</span>
              </div>
              <a className="lx-demo-link" href="/crear">↳ Crearlo ahora</a>
            </div>
            <div className="lx-tiles">
              <span className="lx-tile" style={{ background: "linear-gradient(140deg,#c9f73a,#5a7a10)" }}>🛍️</span>
              <span className="lx-tile" style={{ background: "linear-gradient(140deg,#26c6da,#00838f)" }}>☕</span>
              <span className="lx-tile" style={{ background: "linear-gradient(140deg,#ffb300,#e65100)" }}>👟</span>
              <span className="lx-tile lx-tile-mas">+</span>
            </div>
          </article>
        </section>

        {/* ── barra CTA ── */}
        <a className="lx-barra" href="/crear">↳ Creá tu asistente gratis</a>

        {/* ── precios ── */}
        <section className="lx-precios" id="precios">
          <span className="lx-palabra" aria-hidden="true">Precios</span>
          <span className="lx-etiqueta lx-centro">[ simple y honesto ]</span>
          <div className="lx-precios-grid">
            <div className="lx-plan">
              <div className="lx-plan-tabs">
                <span className="activo">Link gratis</span>
                <span>Widget Pro</span>
              </div>
              <div className="lx-plan-precio">
                <strong>$0</strong>
                <span>/ link compartible, para siempre</span>
              </div>
              <ul className="lx-plan-lista">
                <li>✓ Catálogo Shopify en vivo (sin tokens)</li>
                <li>✓ Tarjetas de producto con foto y precio</li>
                <li>✓ Anti-invención y derivación a tu WhatsApp</li>
                <li>✓ Tu marca: colores, nombre y personalidad</li>
              </ul>
              <a className="lx-plan-btn" href="/crear">↳ Crear gratis</a>
            </div>
            <div className="lx-plan lx-plan-pro">
              <span className="lx-plan-badge">PRO</span>
              <h3>El widget, en tu tienda</h3>
              <p>
                La burbuja flotante atendiendo dentro de tu propio sitio,
                activada con tu licencia. Pedila desde el creador y la
                recibís al instante.
              </p>
              <a className="lx-plan-btn lx-plan-btn-borde" href="/crear">
                ↳ Solicitar activación
              </a>
            </div>
          </div>
        </section>

        {/* ── instalación ── */}
        <section className="lx-snippet">
          <span className="lx-etiqueta lx-centro">[ instalación ]</span>
          <h2 className="lx-demos-titulo lx-snippet-titulo">Una línea. En serio.</h2>
          <pre className="ld-codigo">{`<script
  src="https://silvi-assistants.vercel.app/widget.js"
  defer
  data-color="#0047AB"
  data-etiqueta="Chateá con el taller"
  data-licencia="TU-LICENCIA-PRO"
  {% if product %}data-artesano="{{ product.vendor | escape }}"{% endif %}>
</script>`}</pre>
        </section>

        <footer className="lx-pie">
          <span>SILVI° — asistentes de IA para tiendas</span>
          <span>
            Hecho en El Salvador 🇸🇻 · Demo con la tienda real de{" "}
            <a href="https://art-es.shop" target="_blank" rel="noopener noreferrer">ART-ES</a>{" "}
            · Reto 1 — Vibecoders League 2.0 · <a href="/admin">Panel (demo)</a>
          </span>
        </footer>
      </div>

      {/* El widget real, comiendo nuestro propio dogfood */}
      <Script src="/widget.js" strategy="afterInteractive" />
    </main>
  );
}
