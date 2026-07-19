"use client";

/**
 * "Criterio" — asistente de soporte/ventas de e-commerce (Aurora Store),
 * presentado como UNA PÁGINA MÁS de la plataforma Silvi (mismo chrome negro +
 * lima, nav y marco que la landing). Solo frontend: captura nombre+email y
 * cada mensaje va por POST al Chat Trigger de n8n
 * (NEXT_PUBLIC_CRITERIO_CHAT_URL). La lógica de decisión de autonomía
 * (🟢 responde · 🟡 borrador · 🔴 escala) vive en n8n.
 */

import { useEffect, useRef, useState } from "react";
import type { ConfigAsistente } from "@/lib/config-asistente";

// Asistente en la forma de config de Silvi (fácil de re-marcar).
const CRITERIO: ConfigAsistente = {
  marca: "Aurora Store",
  asistente: "Criterio",
  rubro: "e-commerce",
  saludo:
    "Soy Criterio, el asistente de Aurora Store. Resuelvo tus dudas al toque; y si tu caso necesita a una persona, lo derivo sin que pierdas tiempo. ¿En qué te ayudo?",
  color: "#4F46E5",
  fondo: "#F1F0FB",
  dominio: "",
  whatsapp: "",
  web: "",
  datos: "",
  equipo: [],
  redes: [],
};

// Paleta CLARA de la tarjeta de chat (sobrescribe los tokens negros de .lx).
const PALETA_CHAT: React.CSSProperties = {
  "--marca": CRITERIO.color,
  "--marca-oscuro": CRITERIO.color,
  "--marca-profundo": CRITERIO.color,
  "--marca-suave": "#b9b4ef",
  "--fondo": CRITERIO.fondo,
  "--superficie": "#ffffff",
  "--superficie-tinte": "#f4f3fb",
  "--tinta": "#1e1e1e",
  "--linea": "#e7e5f1",
} as React.CSSProperties;

const CHAT_URL = process.env.NEXT_PUBLIC_CRITERIO_CHAT_URL || "";

const CHIPS = [
  "¿Cuál es el horario de la tienda?",
  "¿Aceptan pago contra entrega?",
  "Mi pedido no llegó y quiero un reembolso",
  "¿Puedo cambiar un producto que ya usé?",
  "Quiero comprar 200 unidades al mayoreo",
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

export default function CriterioPagina() {
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
          content: cuerpo || "Recibido ✅, un asesor te contactará.",
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
            ? "El asistente aún no está conectado a su cerebro (n8n). Configurá NEXT_PUBLIC_CRITERIO_CHAT_URL para activarlo."
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
          </nav>
          <a className="lx-logo" href="/">SILVI°</a>
          <a className="lx-btn-nav" href="/crear">↳ Crear asistente</a>
        </header>

        {/* contenido: narrativa (chrome plataforma) + tarjeta de chat */}
        <section className="crit-wrap">
          <div className="crit-intro">
            <span className="lx-etiqueta">[ asistente en vivo ]</span>
            <h1>Criterio</h1>
            <p className="crit-tag">
              El agente que sabe <strong>cuándo responder solo</strong> y cuándo
              pasarle el caso a una persona.
            </p>
            <div className="crit-niveles">
              <div className="crit-nivel">
                <span className="crit-dot" style={{ background: "#22c55e" }} />
                <span><b>Responde solo</b> — dudas claras (horarios, pagos, envíos).</span>
              </div>
              <div className="crit-nivel">
                <span className="crit-dot" style={{ background: "#eab308" }} />
                <span><b>Deja un borrador</b> — casos sensibles que revisa un humano.</span>
              </div>
              <div className="crit-nivel">
                <span className="crit-dot" style={{ background: "#ef4444" }} />
                <span><b>Escala</b> — decisiones grandes (mayoreo, reclamos): pasa a una persona.</span>
              </div>
            </div>
            <a className="lx-btn-nav crit-cta" href="/crear">↳ Creá un asistente así para tu tienda</a>
          </div>

          {/* tarjeta de chat: elemento claro, con su propia paleta de marca */}
          <div className="crit-card-wrap" style={PALETA_CHAT}>
            <section className="tarjeta crit-card" aria-label="Chat con Criterio de Aurora Store">
              <header className="encabezado">
                <div className="marca-fila">
                  <div className="avatar" aria-hidden="true">
                    <span className="avatar-inicial">{inicial}</span>
                  </div>
                  <div>
                    <div className="marca-nombre">{CRITERIO.marca}</div>
                    <div className="marca-sub">{CRITERIO.asistente} · asistente de e-commerce</div>
                    <div className="estado">
                      <span className="punto" aria-hidden="true" />
                      En línea
                    </div>
                  </div>
                </div>
              </header>

              {!iniciado ? (
                <form className="crit-gate" onSubmit={iniciar}>
                  <h2>Antes de empezar…</h2>
                  <p className="crit-sub">Dejanos tu nombre y correo para atender tu consulta.</p>
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
                    Iniciar chat
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
                      placeholder="Escribí tu mensaje…"
                      aria-label="Escribí tu mensaje"
                      maxLength={800}
                      disabled={cargando}
                    />
                    <button
                      className="enviar"
                      type="submit"
                      disabled={cargando || !texto.trim()}
                      aria-label="Enviar mensaje"
                    >
                      Enviar
                    </button>
                  </form>
                </>
              )}

              <div className="pie">Aurora Store · con criterio, por Silvi Assistants</div>
            </section>
          </div>
        </section>

        <footer className="lx-pie">
          <span>SILVI° — asistentes de IA para tiendas</span>
          <span>
            Criterio · Aurora Store · <a href="/crear">Creá el tuyo</a>
          </span>
        </footer>
      </div>
    </main>
  );
}
