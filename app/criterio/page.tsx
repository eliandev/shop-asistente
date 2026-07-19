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
const URL_RE = /(https?:\/\/[^\s)]+|(?:www\.|wa\.me\/)[^\s)]+)/g;

/** Convierte URLs en enlaces clickeables dentro de la respuesta. */
function conEnlaces(texto: string): React.ReactNode[] {
  return texto.split(URL_RE).map((parte, i) => {
    if (i % 2 === 1) {
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
  return { cuerpo: texto.slice(0, i).trim(), meta: texto.slice(i + 3).trim() || null };
}

/** ¿La decisión de Criterio indica que hace falta intervención humana? */
function necesitaContacto(cuerpo: string, meta: string | null): boolean {
  const base = (meta || cuerpo || "").toLowerCase();
  return /🟡|🔴|borrador|escal|nivel\s*2|nivel\s*3|intervenci[oó]n humana|un asesor|una persona del equipo|te contactar/.test(
    base
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
  }, [turnos, cargando, pidiendoContacto]);

  async function preguntar(
    consulta: string,
    contactoAhora: { nombre: string; email: string } | null = contacto
  ) {
    const limpio = consulta.trim();
    if (!limpio || cargando) return;
    setTurnos((prev) => [...prev, { role: "user", content: limpio }]);
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
          nombre: contactoAhora?.nombre || "",
          email: contactoAhora?.email || "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      const { cuerpo, meta } = separarMeta(extraerOutput(data));
      const contenido = cuerpo || "Recibido ✅. Un miembro del equipo te contactará.";
      setTurnos((prev) => [...prev, { role: "assistant", content: contenido, meta }]);
      // ¿escaló? si no tenemos contacto aún, lo pedimos.
      if (!contactoAhora && necesitaContacto(contenido, meta)) {
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
    // avisamos a n8n con el contacto para que complete la escalación
    preguntar(`Mis datos de contacto — nombre: ${nombre}, correo: ${email}`, c);
  }

  const hayConversacion = turnos.length > 0 || cargando;

  return (
    <main className="ld lx">
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

        <section className="sop-hero">
          <span className="lx-etiqueta">[ centro de soporte ]</span>
          <h1>¿Cómo podemos ayudarte?</h1>
          <p className="sop-sub">
            Preguntá lo que necesités sobre tu asistente de Silvi — desde
            “¿por dónde empiezo?” hasta lo técnico. Te atiende{" "}
            <strong>Criterio</strong>; si hace falta, te deriva al equipo.
          </p>

          {/* campo para preguntar (siempre visible) */}
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

          {!hayConversacion ? (
            /* primera pantalla: solo temas frecuentes bajo el campo */
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
                    disabled={cNombre.trim().length < 2 || !EMAIL_RE.test(cEmail.trim())}
                  >
                    Enviar mis datos
                  </button>
                </form>
              )}
              <div ref={finRef} />
            </div>
          )}
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
