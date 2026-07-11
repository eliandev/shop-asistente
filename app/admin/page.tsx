"use client";

/**
 * DEMO del panel de personalización ("solo para mostrarlo").
 * Los controles re-marcan la vista previa EN VIVO, del lado del cliente.
 * No persiste nada ni requiere login — la versión conectada (config por
 * tienda en KV + auth) es la Fase 7 del roadmap (ver docs/DESARROLLO.md).
 */

import { useState } from "react";
import { knowledgeBase } from "@/lib/knowledge-base";

const PRESETS = [
  { nombre: "Azul ART-ES", marca: "#0047AB", fondo: "#F5EEE3" },
  { nombre: "Verde selva", marca: "#1B7A43", fondo: "#F1F6EC" },
  { nombre: "Terracota", marca: "#B4471B", fondo: "#FAF1E8" },
  { nombre: "Noche", marca: "#3A2FBF", fondo: "#EFEFF8" },
];

export default function AdminDemo() {
  const [nombreTienda, setNombreTienda] = useState("ART-ES");
  const [nombre, setNombre] = useState("Silvi");
  const [saludo, setSaludo] = useState(
    "¡Hola! Te atiende el taller de Silvi 🧶 ¿Qué buscás?"
  );
  const [marca, setMarca] = useState("#0047AB");
  const [fondo, setFondo] = useState("#F5EEE3");
  const [dominio, setDominio] = useState("art-es.shop");
  const [artesanoId, setArtesanoId] = useState("silvi");

  const artesano =
    knowledgeBase.artesanos.find((a) => a.id === artesanoId) ??
    knowledgeBase.artesanos[0];

  return (
    <main className="adm">
      <header className="adm-encabezado">
        <a className="adm-volver" href="/">← Volver a la landing</a>
        <h1>Panel de personalización</h1>
        <span className="adm-demo-badge">DEMO · vista previa sin guardar</span>
      </header>

      <div className="adm-cuerpo">
        {/* ── Controles ── */}
        <section className="adm-controles" aria-label="Controles de personalización">
          <h2>Tu marca</h2>

          <label className="adm-campo">
            <span>Nombre de la tienda</span>
            <input
              value={nombreTienda}
              onChange={(e) => setNombreTienda(e.target.value)}
              maxLength={24}
            />
          </label>

          <label className="adm-campo">
            <span>Nombre del asistente</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={24}
            />
          </label>

          <label className="adm-campo">
            <span>Saludo inicial</span>
            <textarea
              value={saludo}
              onChange={(e) => setSaludo(e.target.value)}
              rows={3}
              maxLength={160}
            />
          </label>

          <div className="adm-fila">
            <label className="adm-campo">
              <span>Color primario</span>
              <input
                type="color"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
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
                  setMarca(p.marca);
                  setFondo(p.fondo);
                }}
              />
            ))}
          </div>

          <h2>Quién atiende</h2>
          <div className="adm-artesanos">
            {knowledgeBase.artesanos.map((a) => (
              <button
                key={a.id}
                type="button"
                className={`adm-artesano ${a.id === artesanoId ? "activo" : ""}`}
                onClick={() => setArtesanoId(a.id)}
              >
                <img src={a.avatar} alt="" width={40} height={40} />
                <span>{a.nombre}</span>
              </button>
            ))}
          </div>

          <h2>Catálogo conectado</h2>
          <label className="adm-campo">
            <span>Dominio Shopify (sin token, vía UCP)</span>
            <input
              value={dominio}
              onChange={(e) => setDominio(e.target.value)}
              placeholder="mitienda.com"
            />
          </label>
          <p className="adm-nota">
            ✓ Catálogo en vivo activo para <strong>{dominio || "—"}</strong>
          </p>

          <button type="button" className="adm-guardar" disabled>
            Guardar cambios (próximamente — Fase 7)
          </button>
        </section>

        {/* ── Vista previa en vivo ── */}
        <section
          className="adm-preview"
          aria-label="Vista previa del chat"
          style={
            {
              "--marca": marca,
              "--marca-oscuro": marca,
              "--marca-profundo": marca,
              "--fondo": fondo,
              background: fondo,
            } as React.CSSProperties
          }
        >
          <div className="tarjeta adm-tarjeta">
            <header className="encabezado">
              <div className="marca-fila">
                <div className="avatar" aria-hidden="true">
                  <img src="/logo.png" alt="" width={38} height={38} />
                </div>
                <div>
                  <div className="marca-nombre">{nombreTienda || "Tu tienda"}</div>
                  <div className="marca-sub">
                    Taller de {nombre || "tu asistente"} · {artesano.taller}
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
                <div className="etiqueta">Taller de {nombre || "—"}</div>
                {saludo || "…"}
              </div>
              <div className="burbuja de-usuario">¿Qué carteras tienen?</div>
              <div className="fila-silvi">
                <img
                  className="avatar-silvi"
                  src={artesano.avatar}
                  alt=""
                  width={36}
                  height={36}
                />
                <div className="burbuja de-silvi">
                  <div className="etiqueta">Taller de {nombre || "—"}</div>
                  Tenemos piezas hermosas tejidas a mano. Esta es la favorita:
                  <div className="productos">
                    <span className="producto-card">
                      <img src={artesano.avatar} alt="" />
                      <span className="producto-info">
                        <span className="producto-nombre">Cartera Estilo Rubí</span>
                        <span className="producto-precio">45.00 USD</span>
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="entrada">
              <input placeholder="Escribí tu pregunta…" disabled aria-label="Vista previa del campo de mensaje" />
              <button className="enviar" disabled>Enviar</button>
            </div>
            <div className="pie">Hecho a mano en El Salvador 🇸🇻</div>
          </div>
        </section>
      </div>
    </main>
  );
}
