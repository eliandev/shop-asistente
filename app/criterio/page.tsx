"use client";

/**
 * SOPORTE de silvi-chatbot.online — atendido por "Criterio", el agente de
 * soporte de Silvi Assistants. Los usuarios preguntan sobre sus chatbots
 * (crearlos, instalarlos, plan Pro, catálogo, dudas técnicas). Es UNA PÁGINA
 * MÁS del sistema (mismo chrome negro+lima). Solo frontend: cada mensaje va
 * por POST al Chat Trigger de n8n (NEXT_PUBLIC_CRITERIO_CHAT_URL); Criterio
 * decide responder solo (🟢), dejar borrador (🟡) o escalar a una persona (🔴).
 */

import { useEffect, useRef, useState } from "react";
import type { ConfigAsistente } from "@/lib/config-asistente";

// Criterio = agente de soporte de la plataforma, en la forma de config de Silvi.
const CRITERIO: ConfigAsistente = {
  marca: "Silvi Assistants",
  asistente: "Criterio",
  rubro: "soporte de asistentes de IA",
  saludo:
    "Soy Criterio, del soporte de Silvi Assistants. Te ayudo con tu asistente: crearlo, instalar el widget, el plan Pro, conectar tu catálogo o cualquier duda técnica. Si el caso necesita a una persona, lo derivo. ¿En qué te ayudo?",
  color: "#0047AB",
  fondo: "#0e0e0f",
  dominio: "",
  whatsapp: "",
  web: "",
  datos: "",
  equipo: [],
  redes: [],
};

// Paleta CLARA de la tarjeta de chat (sobrescribe los tokens negros de .lx).
const PALETA_CHAT: React.CSSProperties = {
  "--marca": "#0047AB",
  "--marca-oscuro": "#003585",
  "--marca-profundo": "#002a69",
  "--marca-suave": "#8aa9d6",
  "--fondo": "#eef2fb",
  "--superficie": "#ffffff",
  "--superficie-tinte": "#f2f5fc",
  "--tinta": "#1e1e1e",
  "--linea": "#dfe4ef",
} as React.CSSProperties;

const CHAT_URL = process.env.NEXT_PUBLIC_CRITERIO_CHAT_URL || "";

// Temas frecuentes de soporte (dudas reales de usuarios de la plataforma).
const CHIPS = [
  "¿Cómo creo mi asistente?",
  "¿Cómo instalo el widget en mi tienda Shopify?",
  "¿Qué incluye el plan Pro?",
  "Mi asistente no encuentra mis productos",
  "¿Puedo conectar mi catálogo sin tokens?",
];

type Rol = "user" | "assistant";
interface Mensaje {
  role: Rol;
  content: string;
  meta?: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function extraerOutput(data: any): string {
  if (typeof data === "string") return data;
  if (Array.isArray(data)) {
    const f = data[0];
    return (f?.output ?? f?.text ?? "").toString();
  }
  return (data?.output ?? data?.text ?? "").toString();
}

function separarMeta(texto: string): { cuerpo: string; meta: string | null } {
  const i = texto.indexOf("———");
  if (i < 0) return { cuerpo: texto.trim(), meta: null };
  return {
    cuerpo: texto.slice(0, i).trim(),
    meta: texto.slice(i + 3).trim() || null,
  };
}

export default function SoporteCriterio() {
  const [iniciado, setIniciado] = useState(false);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);

  function getSessionId(): string {
    if (!sessionIdRef.current) {
      sessionIdRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `sess-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    }
    return sessionIdRef.current;
  }

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);

  const emailValido = EMAIL_RE.test(email.trim());
  const puedeIniciar = nombre.trim().length >= 2 && emailValido;

  function iniciar(e: React.FormEvent) {
    e.preventDefault();
    if (!puedeIniciar) return;
    getSessionId();
    setMensajes([
      { role: "assistant", content: `¡Hola, ${nombre.trim()}! ${CRITERIO.saludo}` },
    ]);
    setIniciado(true);
  }

  async function enviar(contenido: string) {
    const limpio = contenido.trim();
    if (!limpio || cargando) return;
    setMensajes((prev) => [...prev, { role: "user", content: limpio }]);
    setTexto("");
    setCargando(true);
    try {
      if (!CHAT_URL) throw new Error("sin-webhook");
      const res = await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "sendMessage",
          sessionId: getSessionId(),
          chatInput: limpio,
          nombre: nombre.trim(),
          email: email.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      const { cuerpo, meta } = separarMeta(extraerOutput(data));
      setMensajes((prev) => [
        ...prev,
        {
          role: "assistant",
          content: cuerpo || "Recibido ✅. Un miembro del equipo te contactará por correo.",
          meta,
        },
      ]);
    } catch (err) {
      const sinWebhook = err instanceof Error && err.message === "sin-webhook";
      setMensajes((prev) => [
        ...prev,
        {
          role: "assistant",
          content: sinWebhook
            ? "El soporte aún no está conectado a su cerebro (n8n). Configurá NEXT_PUBLIC_CRITERIO_CHAT_URL para activarlo."
            : "No pude conectar en este momento. Probá de nuevo en un ratito 🙏",
        },
      ]);
    } finally {
      setCargando(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    enviar(texto);
  }

  const inicial = CRITERIO.asistente.charAt(0).toUpperCase();
  const mostrarChips = iniciado && mensajes.length <= 1 && !cargando;

  return (
    <main className="ld lx">
      <div className="lx-marco">
        <div className="lx-franja" aria-hidden="true" />

        {/* nav — idéntica al resto del sistema */}
        <header className="lx-nav">
          <nav className="lx-menu" aria-label="Navegación principal">
            <a href="/">Inicio</a>
            <a href="/#producto">El producto</a>
            <a href="/#demos">Demos</a>
            <a href="/#precios">Precios</a>
            <a href="/criterio" aria-current="page">Soporte</a>
          </nav>
          <a className="lx-logo" href="/">SILVI°</a>
          <a className="lx-btn-nav" href="/crear">↳ Crear asistente</a>
        </header>

        {/* hero de soporte, centrado (estilo help center) */}
        <section className="sop-hero">
          <span className="lx-etiqueta">[ centro de soporte ]</span>
          <h1>¿Cómo podemos ayudarte?</h1>
          <p className="sop-sub">
            Resolvé dudas sobre tu asistente de Silvi — desde “¿por dónde
            empiezo?” hasta lo técnico. Te atiende <strong>Criterio</strong>;
            si tu caso necesita a una persona, lo deriva al equipo.
          </p>

          {/* tarjeta de chat: único elemento claro, con paleta propia */}
          <div className="sop-card-wrap" style={PALETA_CHAT}>
            <section className="tarjeta crit-card" aria-label="Soporte de Silvi Assistants con Criterio">
              <header className="encabezado">
                <div className="marca-fila">
                  <div className="avatar" aria-hidden="true">
                    <span className="avatar-inicial">{inicial}</span>
                  </div>
                  <div>
                    <div className="marca-nombre">Soporte · Silvi</div>
                    <div className="marca-sub">{CRITERIO.asistente} · asistente de soporte</div>
                    <div className="estado">
                      <span className="punto" aria-hidden="true" />
                      En línea
                    </div>
                  </div>
                </div>
              </header>

              {!iniciado ? (
                <form className="crit-gate" onSubmit={iniciar}>
                  <h2>Contanos quién sos</h2>
                  <p className="crit-sub">
                    Así podemos darte seguimiento por correo si tu caso pasa a una persona.
                  </p>
                  <div className="crit-campo">
                    <label htmlFor="crit-nombre">Tu nombre</label>
                    <input
                      id="crit-nombre"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Ana"
                      maxLength={60}
                      autoComplete="name"
                      required
                    />
                  </div>
                  <div className="crit-campo">
                    <label htmlFor="crit-email">Tu correo</label>
                    <input
                      id="crit-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ana@correo.com"
                      maxLength={120}
                      autoComplete="email"
                      required
                    />
                  </div>
                  <button className="crit-iniciar" type="submit" disabled={!puedeIniciar}>
                    Empezar
                  </button>
                  <p className="crit-priv">🔒 Tus datos solo se usan para atender tu consulta.</p>
                </form>
              ) : (
                <>
                  <div className="mensajes" role="log" aria-live="polite">
                    {mensajes.map((m, i) =>
                      m.role === "user" ? (
                        <div key={i} className="burbuja de-usuario">{m.content}</div>
                      ) : (
                        <div key={i} className="fila-silvi">
                          <span className="avatar-silvi avatar-inicial-chica" aria-hidden="true">
                            {inicial}
                          </span>
                          <div className="burbuja de-silvi">
                            <div className="etiqueta">{CRITERIO.asistente}</div>
                            {m.content}
                            {m.meta && <div className="meta-decision">🔎 {m.meta}</div>}
                          </div>
                        </div>
                      )
                    )}
                    {cargando && (
                      <div className="fila-silvi">
                        <span className="avatar-silvi avatar-inicial-chica" aria-hidden="true">
                          {inicial}
                        </span>
                        <div className="burbuja de-silvi" aria-label="Criterio está escribiendo">
                          <div className="etiqueta">{CRITERIO.asistente}</div>
                          <div className="escribiendo"><span /><span /><span /></div>
                        </div>
                      </div>
                    )}
                    <div ref={finRef} />
                  </div>

                  {mostrarChips && (
                    <div className="sugerencias">
                      {CHIPS.map((c) => (
                        <button key={c} className="chip" onClick={() => enviar(c)}>{c}</button>
                      ))}
                    </div>
                  )}

                  <form className="entrada" onSubmit={onSubmit}>
                    <input
                      type="text"
                      value={texto}
                      onChange={(e) => setTexto(e.target.value)}
                      placeholder="Escribí tu consulta…"
                      aria-label="Escribí tu consulta"
                      maxLength={800}
                      disabled={cargando}
                    />
                    <button
                      className="enviar"
                      type="submit"
                      disabled={cargando || !texto.trim()}
                      aria-label="Enviar consulta"
                    >
                      Enviar
                    </button>
                  </form>
                </>
              )}

              <div className="pie">Soporte de Silvi Assistants</div>
            </section>
          </div>

          {/* temas frecuentes (visibles siempre, como "browse by topic") */}
          <div className="sop-temas" aria-label="Temas frecuentes">
            <span className="sop-temas-titulo">Temas frecuentes</span>
            <div className="sop-temas-grid">
              <div>
                <b>Primeros pasos</b>
                <span>Crear tu asistente · compartir el link · conectar tu tienda</span>
              </div>
              <div>
                <b>Widget en tu tienda</b>
                <span>Instalarlo en Shopify · plan Pro · activar tu licencia</span>
              </div>
              <div>
                <b>Catálogo y respuestas</b>
                <span>Conectar Shopify sin tokens · por qué no inventa · equipo por proveedor</span>
              </div>
            </div>
          </div>
        </section>

        <footer className="lx-pie">
          <span>SILVI° — asistentes de IA para tiendas</span>
          <span>
            <a href="/">Inicio</a> · <a href="/crear">Crear asistente</a> · Soporte
          </span>
        </footer>
      </div>
    </main>
  );
}
