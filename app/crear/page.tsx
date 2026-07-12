"use client";

/**
 * CREADOR DE ASISTENTES — wizard por pasos con vista previa SIEMPRE visible.
 * La config viaja EN EL LINK (?c=) y en el widget: el link ES el asistente —
 * sin cuentas ni base de datos (v1). El servidor sanitiza todo.
 */

import { useMemo, useState } from "react";
import {
  codificarConfig,
  sanitizarConfig,
  saludoPorDefecto,
  type ConfigAsistente,
} from "@/lib/config-asistente";

const PRESETS = [
  { nombre: "Cobalto", marca: "#0047AB", fondo: "#F5EEE3" },
  { nombre: "Rosa beauty", marca: "#C2185B", fondo: "#FDF0F4" },
  { nombre: "Verde selva", marca: "#1B7A43", fondo: "#F1F6EC" },
  { nombre: "Terracota", marca: "#B4471B", fondo: "#FAF1E8" },
  { nombre: "Noche", marca: "#3A2FBF", fondo: "#EFEFF8" },
];

const PASOS = [
  { n: 1, titulo: "Identidad" },
  { n: 2, titulo: "Estilo" },
  { n: 3, titulo: "Catálogo" },
  { n: 4, titulo: "Conocimiento" },
  { n: 5, titulo: "Publicar" },
];

export default function CrearAsistente() {
  const [paso, setPaso] = useState(1);
  const [maxPaso, setMaxPaso] = useState(1);

  const [marca, setMarca] = useState("");
  const [asistente, setAsistente] = useState("");
  const [rubro, setRubro] = useState("");
  const [saludo, setSaludo] = useState("");
  const [color, setColor] = useState("#C2185B");
  const [fondo, setFondo] = useState("#FDF0F4");
  const [dominio, setDominio] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [web, setWeb] = useState("");
  const [datos, setDatos] = useState("");
  const [copiado, setCopiado] = useState<"link" | "widget" | null>(null);

  const config: ConfigAsistente = useMemo(
    () =>
      sanitizarConfig({
        marca,
        asistente,
        rubro,
        saludo: saludo || saludoPorDefecto(asistente, marca),
        color,
        fondo,
        dominio,
        whatsapp,
        web,
        datos,
      }),
    [marca, asistente, rubro, saludo, color, fondo, dominio, whatsapp, web, datos]
  );

  const identidadLista = config.marca.length >= 2 && config.asistente.length >= 2;
  const origen =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://silvi-assistants.vercel.app";
  const c = codificarConfig(config);
  const linkChat = `${origen}/chat?c=${c}`;
  const snippetWidget = `<script src="${origen}/widget.js" defer
  data-color="${config.color}"
  data-etiqueta="Chateá con ${config.asistente || "tu asistente"}"
  data-licencia="TU-LICENCIA-PRO"
  data-config="${c}">
</script>`;
  const mensajeActivacion = encodeURIComponent(
    `Hola! Quiero activar el widget Pro de mi asistente "${config.asistente || "?"}" para ${config.marca || "mi marca"}${config.dominio ? ` (tienda: ${config.dominio})` : ""}.`
  );
  const linkActivacion = `https://wa.me/50372100755?text=${mensajeActivacion}`;

  const puedeAvanzar = paso === 1 ? identidadLista : true;

  function irA(n: number) {
    if (n >= 1 && n <= maxPaso) setPaso(n);
  }
  function avanzar() {
    if (!puedeAvanzar || paso >= 5) return;
    const siguiente = paso + 1;
    setPaso(siguiente);
    setMaxPaso((m) => Math.max(m, siguiente));
  }
  function volver() {
    if (paso > 1) setPaso(paso - 1);
  }

  async function copiar(texto: string, cual: "link" | "widget") {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(cual);
      setTimeout(() => setCopiado(null), 1800);
    } catch {
      /* sin clipboard, el usuario puede seleccionar el texto */
    }
  }

  return (
    <main className="adm">
      <header className="adm-encabezado">
        <a className="adm-volver" href="/">← Volver a la landing</a>
        <h1>Creá tu asistente</h1>
        <span className="adm-demo-badge">Gratis · sin cuenta · el link es tu asistente</span>
      </header>

      {/* ── stepper ── */}
      <nav className="crd-stepper" aria-label="Pasos del creador">
        {PASOS.map((p) => (
          <button
            key={p.n}
            type="button"
            className={`crd-step ${paso === p.n ? "actual" : ""} ${
              maxPaso >= p.n ? "alcanzado" : ""
            } ${maxPaso > p.n ? "hecho" : ""}`}
            onClick={() => irA(p.n)}
            disabled={p.n > maxPaso}
            aria-current={paso === p.n ? "step" : undefined}
          >
            <span className="crd-step-num">{maxPaso > p.n ? "✓" : p.n}</span>
            <span className="crd-step-nombre">{p.titulo}</span>
          </button>
        ))}
        <div
          className="crd-progreso"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={5}
          aria-valuenow={paso}
        >
          <span style={{ width: `${((paso - 1) / 4) * 100}%` }} />
        </div>
      </nav>

      <div className="adm-cuerpo crd-cuerpo">
        {/* ── vista previa SIEMPRE visible ── */}
        <section
          className="adm-preview crd-preview"
          aria-label="Vista previa del asistente"
          style={
            {
              "--marca": config.color,
              "--marca-oscuro": config.color,
              "--marca-profundo": config.color,
              background: config.fondo,
            } as React.CSSProperties
          }
        >
          <div className="tarjeta adm-tarjeta">
            <header className="encabezado">
              <div className="marca-fila">
                <div className="avatar" aria-hidden="true">
                  <span className="avatar-inicial">
                    {(config.asistente || "?").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="marca-nombre">{config.marca || "Tu marca"}</div>
                  <div className="marca-sub">
                    {config.asistente || "Tu asistente"} · asistente virtual
                  </div>
                  <div className="estado">
                    <span className="punto" aria-hidden="true" />
                    En línea
                  </div>
                </div>
              </div>
            </header>
            <div className="mensajes">
              <div className="burbuja de-silvi">
                <div className="etiqueta">{config.asistente || "—"}</div>
                {config.saludo}
              </div>
              <div className="burbuja de-usuario">¿Qué venden?</div>
              <div className="burbuja de-silvi">
                <div className="etiqueta">{config.asistente || "—"}</div>
                {config.dominio
                  ? `Te muestro el catálogo en vivo de ${config.dominio} con precios reales ✨`
                  : config.datos
                    ? "Te respondo con los datos que me enseñó la marca ✨"
                    : "Cargá tu catálogo o tus datos y respondo con información real ✨"}
              </div>
            </div>
            <div className="entrada">
              <input placeholder="Escribí tu pregunta…" disabled aria-label="Vista previa del campo de mensaje" />
              <button className="enviar" disabled>Enviar</button>
            </div>
            <div className="pie">{config.marca || "Tu marca"} · asistente virtual</div>
          </div>
        </section>

        {/* ── paso actual ── */}
        <section className="adm-controles crd-panel" aria-label={`Paso ${paso} de 5`} key={paso}>
          {paso === 1 && (
            <div className="crd-paso-anim">
              <h2>¿Quién va a atender?</h2>
              <p className="crd-paso-sub">
                Dale nombre a tu marca y a tu asistente — mirá cómo cobra vida
                a la derecha.
              </p>
              <label className="adm-campo">
                <span>Nombre de tu marca *</span>
                <input
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  placeholder="Glow Beauty"
                  maxLength={40}
                  autoFocus
                />
              </label>
              <label className="adm-campo">
                <span>Nombre del asistente *</span>
                <input
                  value={asistente}
                  onChange={(e) => setAsistente(e.target.value)}
                  placeholder="María"
                  maxLength={30}
                />
              </label>
              <label className="adm-campo">
                <span>¿A qué se dedica tu marca?</span>
                <input
                  value={rubro}
                  onChange={(e) => setRubro(e.target.value)}
                  placeholder="productos de belleza y skincare"
                  maxLength={90}
                />
              </label>
              <label className="adm-campo">
                <span>Saludo inicial (opcional — se escribe solo)</span>
                <textarea
                  value={saludo}
                  onChange={(e) => setSaludo(e.target.value)}
                  placeholder={saludoPorDefecto(asistente, marca)}
                  rows={2}
                  maxLength={200}
                />
              </label>
              {!identidadLista && (
                <p className="crd-falta">
                  Completá marca y asistente (mínimo 2 letras) para continuar.
                </p>
              )}
            </div>
          )}

          {paso === 2 && (
            <div className="crd-paso-anim">
              <h2>Vestilo con tu marca</h2>
              <p className="crd-paso-sub">
                Elegí un preset o afiná tus colores — el cambio es inmediato.
              </p>
              <div className="adm-presets crd-presets-grandes">
                {PRESETS.map((p) => (
                  <button
                    key={p.nombre}
                    type="button"
                    className={`adm-preset ${color === p.marca ? "elegido" : ""}`}
                    style={{ background: p.marca }}
                    title={p.nombre}
                    aria-label={`Preset ${p.nombre}`}
                    onClick={() => {
                      setColor(p.marca);
                      setFondo(p.fondo);
                    }}
                  />
                ))}
              </div>
              <div className="adm-fila">
                <label className="adm-campo">
                  <span>Color primario</span>
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    aria-label="Color primario"
                  />
                </label>
                <label className="adm-campo">
                  <span>Fondo</span>
                  <input
                    type="color"
                    value={fondo}
                    onChange={(e) => setFondo(e.target.value)}
                    aria-label="Color de fondo"
                  />
                </label>
              </div>
            </div>
          )}

          {paso === 3 && (
            <div className="crd-paso-anim">
              <h2>Conectá tu catálogo</h2>
              <p className="crd-paso-sub">
                Solo el dominio de tu tienda Shopify — sin tokens, sin apps.
                Tu asistente responderá con precios y stock EN VIVO.
              </p>
              <label className="adm-campo">
                <span>Dominio de tu tienda Shopify (opcional)</span>
                <input
                  value={dominio}
                  onChange={(e) => setDominio(e.target.value)}
                  placeholder="mitienda.com"
                  autoFocus
                />
              </label>
              <p className="adm-nota">
                {config.dominio
                  ? `✓ ${config.asistente || "Tu asistente"} responderá con el catálogo en vivo de ${config.dominio}`
                  : "¿Sin tienda Shopify? No pasa nada: en el siguiente paso le enseñás tu negocio."}
              </p>
            </div>
          )}

          {paso === 4 && (
            <div className="crd-paso-anim">
              <h2>Enseñale tu negocio</h2>
              <p className="crd-paso-sub">
                Envíos, pagos, políticas, horarios… Si algo no está aquí ni en
                el catálogo, tu asistente lo admite — nunca inventa. 🛡️
              </p>
              <label className="adm-campo">
                <span>WhatsApp / teléfono de contacto</span>
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+503 7777 7777"
                  maxLength={30}
                />
              </label>
              <label className="adm-campo">
                <span>Web</span>
                <input
                  value={web}
                  onChange={(e) => setWeb(e.target.value)}
                  placeholder="https://mitienda.com"
                  maxLength={120}
                />
              </label>
              <label className="adm-campo">
                <span>Lo que debe saber</span>
                <textarea
                  value={datos}
                  onChange={(e) => setDatos(e.target.value)}
                  placeholder="Envíos a todo el país por $3.50 en 2-4 días. Pagos con tarjeta y transferencia. Devoluciones dentro de 30 días con empaque original…"
                  rows={6}
                  maxLength={700}
                />
              </label>
            </div>
          )}

          {paso === 5 && (
            <div className="crd-paso-anim">
              <h2>🎉 {config.asistente} está en línea</h2>
              <p className="crd-paso-sub">
                Este link ES tu asistente — compartilo en redes, en tu bio o
                por WhatsApp. Gratis para siempre.
              </p>
              <label className="adm-campo">
                <span>Link para compartir</span>
                <div className="crd-copia">
                  <input readOnly value={linkChat} onFocus={(e) => e.target.select()} />
                  <button type="button" onClick={() => copiar(linkChat, "link")}>
                    {copiado === "link" ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
              </label>
              <a
                className="ld-btn ld-btn-primario crd-probar"
                href={linkChat}
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir mi asistente →
              </a>

              <div className="crd-pro">
                <div className="crd-pro-encabezado">
                  <span className="crd-pro-badge">PRO</span>
                  <h3>Widget para tu web o tienda Shopify</h3>
                </div>
                <p className="crd-pro-texto">
                  Para atender <strong>dentro de tu propio sitio</strong> con la
                  burbuja flotante, activá el plan Pro: te enviamos tu licencia
                  y pegás este código (Custom Liquid del Theme Editor):
                </p>
                <div className="crd-copia">
                  <textarea readOnly rows={6} value={snippetWidget} onFocus={(e) => e.target.select()} />
                  <button type="button" onClick={() => copiar(snippetWidget, "widget")}>
                    {copiado === "widget" ? "¡Copiado!" : "Copiar"}
                  </button>
                </div>
                <p className="crd-pro-nota">
                  Sin licencia, el widget muestra una vista previa con aviso de
                  activación (tu link gratis sigue funcionando siempre).
                </p>
                <a
                  className="ld-btn ld-btn-primario crd-probar"
                  href={linkActivacion}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Activar el widget Pro 💬
                </a>
              </div>
            </div>
          )}

          {/* ── navegación ── */}
          <div className="crd-nav">
            {paso > 1 ? (
              <button type="button" className="crd-nav-volver" onClick={volver}>
                ← Volver
              </button>
            ) : (
              <span />
            )}
            {paso < 5 && (
              <button
                type="button"
                className="crd-nav-seguir"
                onClick={avanzar}
                disabled={!puedeAvanzar}
              >
                {paso === 4 ? "Generar mi asistente ✨" : "Continuar →"}
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
