"use client";

/**
 * SOPORTE de silvi-chatbot.online — atendido por "Criterio".
 * Flujo tipo help-center (Shopify Help): la primera pantalla es solo el
 * título + el campo para preguntar. Criterio responde si puede (nivel 1,
 * base de FAQ). Si detecta que el caso necesita intervención humana
 * (nivel 2/3), recién ahí pide nombre + correo para contactar y escalar.
 * La decisión de autonomía vive en n8n; esta página es solo el frontend.
 */

import { useEffect, useRef, useState } from "react";

const CHAT_URL = process.env.NEXT_PUBLIC_CRITERIO_CHAT_URL || "";

// Temas frecuentes (dudas reales de usuarios de la plataforma).
const TEMAS = [
  "¿Cómo creo mi asistente?",
  "¿Cómo instalo el widget en mi tienda Shopify?",
  "¿Qué incluye el plan Pro?",
  "¿Puedo conectar mi catálogo sin tokens?",
  "Mi asistente no encuentra mis productos",
];

type Rol = "user" | "assistant";
interface Turno {
  role: Rol;
  content: string;
  meta?: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// tokeniza **negrita** y enlaces (http/https, www., wa.me), dejando el resto tal cual
const TOKEN_RE = /(\*\*[^*\n]+\*\*|https?:\/\/[^\s)]+|(?:www\.|wa\.me\/)[^\s)]+)/g;

/** Renderiza el texto de Criterio: negritas markdown + URLs clickeables. */
function conEnlaces(texto: string): React.ReactNode[] {
  return texto.split(TOKEN_RE).map((parte, i) => {
    if (!parte) return null;
    if (parte.length > 4 && parte.startsWith("**") && parte.endsWith("**")) {
      return <strong key={i}>{parte.slice(2, -2)}</strong>;
    }
    if (/^https?:\/\//.test(parte) || /^(?:www\.|wa\.me\/)/.test(parte)) {
      const href = parte.startsWith("http") ? parte : `https://${parte}`;
      return (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer">
          {parte}
        </a>
      );
    }
    return parte;
  });
}

/** Extrae el texto de la respuesta, tolerando varias formas comunes de n8n. */
function extraerTexto(data: any): string {
  if (data == null) return "";
  if (typeof data === "string") return data;
  if (Array.isArray(data)) return extraerTexto(data[0]);
  return (
    data.output ??
    data.text ??
    data.message ??
    data.answer ??
    data.reply ??
    data.respuesta ??
    data.result?.text ?? // fallback: respuesta tipo notificación (Telegram)
    ""
  ).toString();
}

function separarMeta(texto: string): { cuerpo: string; meta: string | null } {
  const i = texto.indexOf("———");
  if (i < 0) return { cuerpo: texto.trim(), meta: null };
  return { cuerpo: texto.slice(0, i).trim(), meta: texto.slice(i + 3).trim() || null };
}

/** Quita ruido que agregan algunos nodos (p.ej. la atribución de Telegram). */
function limpiarCuerpo(texto: string): string {
  return texto
    .replace(/\n*\s*This message was sent automatically with[\s\S]*$/i, "")
    .trim();
}

/**
 * Interpreta la respuesta en cualquiera de las formas que manda n8n:
 *  - { output: "respuesta ——— decisión" }
 *  - texto de notificación: "🟢 …decisión…\nEnvié: <respuesta al cliente>"
 * Devuelve el texto para el cliente (`cuerpo`) y la decisión (`meta`).
 */
function parseRespuesta(data: any): { cuerpo: string; meta: string | null } {
  const texto = extraerTexto(data);
  if (!texto) return { cuerpo: "", meta: null };
  let cuerpo: string;
  let meta: string | null;
  const m = texto.match(/Envi[eé]:\s*([\s\S]*)$/);
  if (m && m.index !== undefined) {
    const metaPrevia = texto.slice(0, m.index).trim() || null;
    const sub = separarMeta(m[1].trim()); // por si la respuesta trae además ———
    cuerpo = sub.cuerpo;
    meta = sub.meta || metaPrevia;
  } else {
    const sub = separarMeta(texto);
    cuerpo = sub.cuerpo;
    meta = sub.meta;
  }
  return { cuerpo: limpiarCuerpo(cuerpo), meta };
}

/**
 * ¿La DECISIÓN de Criterio indica intervención humana? Se evalúa SOLO sobre la
 * meta (lo que viene tras "———"), nunca sobre el cuerpo de la respuesta: así el
 * texto normal (o un fallback) no dispara la captura de contacto por error.
 */
function necesitaContacto(meta: string | null): boolean {
  if (!meta) return false;
  return /🟡|🔴|borrador|escal|nivel\s*2|nivel\s*3|intervenci[oó]n humana|revisa (un|una) (humano|persona|asesor)/.test(
    meta.toLowerCase()
  );
}

export default function SoporteCriterio() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [contacto, setContacto] = useState<{ nombre: string; email: string } | null>(null);
  const [pidiendoContacto, setPidiendoContacto] = useState(false);
  const [cNombre, setCNombre] = useState("");
  const [cEmail, setCEmail] = useState("");
  const finRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string | null>(null);
  // guard SÍNCRONO contra doble POST (doble clic / doble submit en el mismo tick,
  // antes de que `cargando` se actualice). Más fiable que mirar el estado.
  const enviandoRef = useRef(false);
  // la consulta que hizo escalar a Criterio: se reenvía CON el contacto en una
  // sola llamada, en vez de mandar un POST aparte con "mis datos de contacto".
  const consultaEscaladaRef = useRef("");

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
    // scrollea SOLO el contenedor de conversación (.sop-scroll), no la página
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turnos, cargando, pidiendoContacto]);

  async function preguntar(
    consulta: string,
    contactoAhora: { nombre: string; email: string } | null = contacto,
    opciones: { mostrarPregunta?: boolean } = {}
  ) {
    const { mostrarPregunta = true } = opciones;
    const limpio = consulta.trim();
    // guard síncrono: si ya hay un POST en curso, no dispares otro (doble clic).
    if (!limpio || enviandoRef.current) return;
    enviandoRef.current = true;
    if (mostrarPregunta) {
      setTurnos((prev) => [...prev, { role: "user", content: limpio }]);
      setTexto("");
    }
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
          nombre: contactoAhora?.nombre || "",
          email: contactoAhora?.email || "",
        }),
      });
      // un 4xx/5xx (webhook mal configurado o error del workflow) NO es una
      // respuesta válida: lo tratamos como fallo de conexión, no como "recibido".
      if (!res.ok) throw new Error(`webhook ${res.status}`);
      const data = await res.json().catch(() => ({}));
      let { cuerpo, meta } = parseRespuesta(data);
      // n8n puede mandar la decisión en un campo aparte (más simple que ———)
      const metaCampo =
        data && typeof data === "object" ? data.decision ?? data.meta ?? data.nivel : null;
      if (!meta && typeof metaCampo === "string" && metaCampo.trim()) {
        meta = metaCampo.trim();
      }
      const contenido =
        cuerpo || "No pude leer la respuesta del asistente. Probá de nuevo en un momento.";
      setTurnos((prev) => [...prev, { role: "assistant", content: contenido, meta }]);
      // ¿escaló? solo si la DECISIÓN (meta) lo indica y aún no hay contacto.
      // Recordamos la consulta para reenviarla CON el contacto (una sola llamada).
      if (!contactoAhora && necesitaContacto(meta)) {
        consultaEscaladaRef.current = limpio;
        setPidiendoContacto(true);
      }
    } catch (err) {
      const sinWebhook = err instanceof Error && err.message === "sin-webhook";
      setTurnos((prev) => [
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
      enviandoRef.current = false;
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    preguntar(texto);
  }

  function enviarContacto(e: React.FormEvent) {
    e.preventDefault();
    const nombre = cNombre.trim();
    const email = cEmail.trim();
    if (nombre.length < 2 || !EMAIL_RE.test(email)) return;
    const c = { nombre, email };
    setContacto(c);
    setPidiendoContacto(false);
    // UNA sola llamada: reenviamos la CONSULTA ORIGINAL (la que escaló) ahora con
    // el contacto en el MISMO body. No mandamos un POST aparte de "mis datos de
    // contacto" (eso creaba una segunda tarjeta con mensaje basura). Tampoco
    // re-mostramos la pregunta como burbuja nueva (mostrarPregunta: false).
    const consulta =
      consultaEscaladaRef.current ||
      [...turnos].reverse().find((t) => t.role === "user")?.content ||
      "";
    if (consulta) preguntar(consulta, c, { mostrarPregunta: false });
  }

  const hayConversacion = turnos.length > 0 || cargando;

  return (
    <main className="ld lx sop-page">
      <div className="lx-marco">
        <div className="lx-franja" aria-hidden="true" />

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

        <section className={`sop-hero${hayConversacion ? " sop-chat" : ""}`}>
          <div className="sop-cabecera">
            <span className="lx-etiqueta">[ centro de soporte ]</span>
            <h1>¿Cómo podemos ayudarte?</h1>
            <p className="sop-sub">
              Preguntá lo que necesités sobre tu asistente de Silvi — desde
              “¿por dónde empiezo?” hasta lo técnico. Te atiende{" "}
              <strong>Criterio</strong>; si hace falta, te deriva al equipo.
            </p>
          </div>

          {/* área que scrollea por dentro — la página no se mueve */}
          <div className="sop-scroll">
            {!hayConversacion ? (
              /* primera pantalla: temas frecuentes */
              <div className="sop-temas" aria-label="Temas frecuentes">
                <span className="sop-temas-titulo">Temas frecuentes</span>
                <div className="sop-temas-chips">
                  {TEMAS.map((t) => (
                    <button key={t} className="chip" onClick={() => preguntar(t)}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* conversación: pregunta → respuesta (+ meta) → contacto si escala */
              <div className="sop-conversacion">
                {turnos.map((t, i) =>
                  t.role === "user" ? (
                    <p key={i} className="sop-pregunta">{t.content}</p>
                  ) : (
                    <div key={i} className="sop-turno">
                      <div className="sop-respuesta-label">✧ Respuesta de Criterio</div>
                      <div className="sop-respuesta">
                        {conEnlaces(t.content)}
                        {t.meta && <div className="meta-decision">🔎 {t.meta}</div>}
                      </div>
                    </div>
                  )
                )}

                {cargando && (
                  <div className="sop-turno">
                    <div className="sop-respuesta-label">✧ Criterio</div>
                    <div className="sop-typing" aria-label="Criterio está escribiendo">
                      <span /><span /><span />
                    </div>
                  </div>
                )}

                {pidiendoContacto && (
                  <form className="sop-contacto" onSubmit={enviarContacto}>
                    <h3>Esto lo ve una persona del equipo</h3>
                    <p>Dejanos tu nombre y correo y te contactamos para darle seguimiento.</p>
                    <div className="sop-campo">
                      <label htmlFor="c-nombre">Tu nombre</label>
                      <input
                        id="c-nombre"
                        value={cNombre}
                        onChange={(e) => setCNombre(e.target.value)}
                        placeholder="Ana"
                        maxLength={60}
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div className="sop-campo">
                      <label htmlFor="c-email">Tu correo</label>
                      <input
                        id="c-email"
                        type="email"
                        value={cEmail}
                        onChange={(e) => setCEmail(e.target.value)}
                        placeholder="ana@correo.com"
                        maxLength={120}
                        autoComplete="email"
                        required
                      />
                    </div>
                    <button
                      className="sop-contacto-enviar"
                      type="submit"
                      disabled={
                        cargando ||
                        cNombre.trim().length < 2 ||
                        !EMAIL_RE.test(cEmail.trim())
                      }
                    >
                      {cargando ? "Enviando…" : "Enviar mis datos"}
                    </button>
                  </form>
                )}
                <div ref={finRef} />
              </div>
            )}
          </div>

          {/* campo para preguntar — anclado abajo, siempre visible */}
          <form className="sop-ask" onSubmit={onSubmit}>
            <input
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder={hayConversacion ? "Preguntá algo más…" : "Escribí tu pregunta…"}
              aria-label="Escribí tu pregunta"
              maxLength={800}
              disabled={cargando}
              autoFocus
            />
            <button type="submit" disabled={cargando || !texto.trim()} aria-label="Enviar pregunta">
              ↑
            </button>
          </form>
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
