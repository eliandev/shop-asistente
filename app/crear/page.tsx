"use client";

/**
 * CREADOR DE ASISTENTES — el "motor de marca" generalizado.
 * Cualquier marca arma aquí su asistente (ej. "María" para belleza):
 * identidad, colores, catálogo Shopify (solo el dominio, sin tokens) y datos
 * del negocio. La config viaja EN EL LINK (?c=) y en el widget: el link ES el
 * asistente — sin cuentas ni base de datos (v1).
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

export default function CrearAsistente() {
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

  const listo = config.marca.length >= 2 && config.asistente.length >= 2;
  const origen =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://silvi-art-es.vercel.app";
  const c = codificarConfig(config);
  const linkChat = `${origen}/chat?c=${c}`;
  const snippetWidget = `<script src="${origen}/widget.js" defer
  data-color="${config.color}"
  data-etiqueta="Chateá con ${config.asistente || "tu asistente"}"
  data-config="${c}">
</script>`;

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

      <div className="adm-cuerpo">
        {/* ── Formulario ── */}
        <section className="adm-controles" aria-label="Datos del asistente">
          <h2>1 · Identidad</h2>
          <label className="adm-campo">
            <span>Nombre de tu marca *</span>
            <input
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Glow Beauty"
              maxLength={40}
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
            <span>Saludo inicial (opcional, se genera solo)</span>
            <textarea
              value={saludo}
              onChange={(e) => setSaludo(e.target.value)}
              placeholder={saludoPorDefecto(asistente, marca)}
              rows={2}
              maxLength={200}
            />
          </label>

          <h2>2 · Colores</h2>
          <div className="adm-fila">
            <label className="adm-campo">
              <span>Primario</span>
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
          <div className="adm-presets">
            {PRESETS.map((p) => (
              <button
                key={p.nombre}
                type="button"
                className="adm-preset"
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

          <h2>3 · Catálogo en vivo (opcional)</h2>
          <label className="adm-campo">
            <span>Dominio de tu tienda Shopify — sin tokens ni apps</span>
            <input
              value={dominio}
              onChange={(e) => setDominio(e.target.value)}
              placeholder="mitienda.com"
            />
          </label>
          <p className="adm-nota">
            {config.dominio
              ? `✓ ${config.asistente || "Tu asistente"} responderá con productos y precios EN VIVO de ${config.dominio}`
              : "Sin tienda conectada, el asistente responde solo con los datos que cargués abajo."}
          </p>

          <h2>4 · Datos del negocio (opcional)</h2>
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
            <span>Envíos, pagos, políticas, horarios… (lo que debe saber)</span>
            <textarea
              value={datos}
              onChange={(e) => setDatos(e.target.value)}
              placeholder="Envíos a todo el país por $3.50 en 2-4 días. Pagos con tarjeta y transferencia. Devoluciones dentro de 30 días con empaque original…"
              rows={5}
              maxLength={700}
            />
          </label>
          <p className="adm-nota">
            🛡️ Si algo no está aquí ni en el catálogo, tu asistente lo admite
            con honestidad — nunca inventa.
          </p>
        </section>

        {/* ── Vista previa + resultado ── */}
        <div>
          <section
            className="adm-preview"
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
                    : "Te cuento sobre la marca con los datos que me cargaron ✨"}
                </div>
              </div>
              <div className="entrada">
                <input placeholder="Escribí tu pregunta…" disabled aria-label="Vista previa del campo de mensaje" />
                <button className="enviar" disabled>Enviar</button>
              </div>
              <div className="pie">{config.marca || "Tu marca"} · asistente virtual</div>
            </div>
          </section>

          <section className="crd-resultado" aria-label="Tu asistente listo">
            <h2>🎉 Tu asistente {listo ? "está listo" : "casi está"}</h2>
            {!listo && (
              <p className="crd-falta">
                Completá el nombre de tu marca y el del asistente (mínimo 2
                letras) para generar el link.
              </p>
            )}
            {listo && (
              <>
                <label className="adm-campo">
                  <span>Link para compartir (probalo ya mismo)</span>
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
                <label className="adm-campo">
                  <span>Widget para tu web o tienda Shopify (Custom Liquid en el footer)</span>
                  <div className="crd-copia">
                    <textarea readOnly rows={5} value={snippetWidget} onFocus={(e) => e.target.select()} />
                    <button type="button" onClick={() => copiar(snippetWidget, "widget")}>
                      {copiado === "widget" ? "¡Copiado!" : "Copiar"}
                    </button>
                  </div>
                </label>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
