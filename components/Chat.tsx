"use client";

import { useEffect, useRef, useState } from "react";
import { resolverArtesano, type Artesano } from "@/lib/knowledge-base";

type Rol = "user" | "assistant";
interface Mensaje {
  role: Rol;
  content: string;
}

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
  // El artesano que atiende la sesión: por defecto el del taller principal;
  // se resuelve tras montar leyendo ?artesano= (evita mismatch de hidratación).
  const [artesano, setArtesano] = useState<Artesano>(() => resolverArtesano());
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { role: "assistant", content: resolverArtesano().saludo },
  ]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("artesano");
    if (!param) return;
    const elegido = resolverArtesano(param);
    setArtesano(elegido);
    // si la conversación no empezó, el saludo pasa a ser el del artesano elegido
    setMensajes((prev) =>
      prev.length <= 1 ? [{ role: "assistant", content: elegido.saludo }] : prev
    );
  }, []);

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
        // el saludo inicial es assistant y es válido como contexto
        body: JSON.stringify({ messages: nuevos, artesano: artesano.id }),
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
    <section className="tarjeta" aria-label={`Chat con el taller de ${artesano.nombre} de ART-ES`}>
      <header className="encabezado">
        <div className="marca-fila">
          <div className="avatar" aria-hidden="true">
            <img src="/logo.png" alt="" width={38} height={38} />
          </div>
          <div>
            <div className="marca-nombre">ART-ES</div>
            <div className="marca-sub">
              Taller de {artesano.nombre} · {artesano.taller}
            </div>
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
            {m.role === "assistant" && (
              <div className="etiqueta">Taller de {artesano.nombre}</div>
            )}
            {m.role === "assistant" ? conEnlaces(m.content) : m.content}
          </div>
        ))}

        {cargando && (
          <div className="fila-silvi">
            <img
              className="avatar-silvi"
              src={artesano.avatar}
              alt=""
              width={36}
              height={36}
            />
            <div
              className="burbuja de-silvi"
              aria-label={`El taller de ${artesano.nombre} está escribiendo`}
            >
              <div className="etiqueta">Taller de {artesano.nombre}</div>
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
