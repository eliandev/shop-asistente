"use client";

import { useEffect, useRef, useState } from "react";

type Rol = "user" | "assistant";
interface Mensaje {
  role: Rol;
  content: string;
}

const SALUDO =
  "¡Hola! Soy Silvi, de ART-ES 🌿 Te ayudo con nuestras piezas artesanales salvadoreñas: precios, envíos, pagos y más. ¿Qué buscás?";

/** Convierte URLs del texto en enlaces clickeables (wa.me, tienda, productos). */
const URL_REGEX = /(https?:\/\/[^\s)]+|(?:www\.|wa\.me\/)[^\s)]+)/g;

function conEnlaces(texto: string): React.ReactNode[] {
  return texto.split(URL_REGEX).map((parte, i) => {
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

const SUGERENCIAS = [
  "¿Qué venden?",
  "¿Cuánto cuesta el envío?",
  "¿Qué métodos de pago aceptan?",
  "¿Los productos son hechos a mano?",
];

export default function Chat() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { role: "assistant", content: SALUDO },
  ]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, cargando]);

  async function enviar(contenido: string) {
    const limpio = contenido.trim();
    if (!limpio || cargando) return;

    const nuevos: Mensaje[] = [...mensajes, { role: "user", content: limpio }];
    setMensajes(nuevos);
    setTexto("");
    setCargando(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // enviamos solo los turnos user/assistant (sin el saludo inicial no hace falta filtrar,
        // el saludo es assistant y es válido como contexto)
        body: JSON.stringify({ messages: nuevos }),
      });

      const data = await res.json();
      const respuesta =
        data.reply ||
        data.error ||
        "Perdoná, tuve un problema. Probá de nuevo en un momento.";

      setMensajes((prev) => [...prev, { role: "assistant", content: respuesta }]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Perdoná, no logré conectar. Probá de nuevo o escribinos por WhatsApp.",
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

  const mostrarSugerencias = mensajes.length <= 1 && !cargando;

  return (
    <section className="tarjeta" aria-label="Chat con Silvi de ART-ES">
      <header className="encabezado">
        <div className="marca-fila">
          <div className="avatar" aria-hidden="true">
            <img src="/logo.png" alt="" width={38} height={38} />
          </div>
          <div>
            <div className="marca-nombre">ART-ES</div>
            <div className="marca-sub">Silvi · asistente artesanal</div>
            <div className="estado">
              <span className="punto" aria-hidden="true" />
              En línea
            </div>
          </div>
        </div>
      </header>

      <div className="mensajes" role="log" aria-live="polite">
        {mensajes.map((m, i) => (
          <div
            key={i}
            className={`burbuja ${m.role === "user" ? "de-usuario" : "de-silvi"}`}
          >
            {m.role === "assistant" && <div className="etiqueta">Silvi</div>}
            {m.role === "assistant" ? conEnlaces(m.content) : m.content}
          </div>
        ))}

        {cargando && (
          <div className="fila-silvi">
            <img
              className="avatar-silvi"
              src="/avatar-silvi.png"
              alt=""
              width={36}
              height={36}
            />
            <div className="burbuja de-silvi" aria-label="Silvi está escribiendo">
              <div className="etiqueta">Silvi</div>
              <div className="escribiendo">
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        )}
        <div ref={finRef} />
      </div>

      {mostrarSugerencias && (
        <div className="sugerencias">
          {SUGERENCIAS.map((s) => (
            <button key={s} className="chip" onClick={() => enviar(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form className="entrada" onSubmit={onSubmit}>
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escribí tu pregunta…"
          aria-label="Escribí tu pregunta"
          maxLength={800}
          disabled={cargando}
        />
        <button
          className="enviar"
          type="submit"
          disabled={cargando || !texto.trim()}
        >
          Enviar
        </button>
      </form>

      <div className="pie">Hecho a mano en El Salvador 🇸🇻</div>
    </section>
  );
}
