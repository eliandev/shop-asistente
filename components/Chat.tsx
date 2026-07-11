"use client";

import { useEffect, useRef, useState } from "react";
import { resolverArtesano, type Artesano } from "@/lib/knowledge-base";
import {
  decodificarConfig,
  saludoPorDefecto,
  type ConfigAsistente,
} from "@/lib/config-asistente";

type Rol = "user" | "assistant";

interface TarjetaProducto {
  titulo: string;
  precio: string;
  url: string | null;
  imagen: string | null;
}

interface Mensaje {
  role: Rol;
  content: string;
  /** tarjetas de productos mencionados en esta respuesta (con foto) */
  productos?: TarjetaProducto[];
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

const SUGERENCIAS_ARTES = [
  "¿Qué venden?",
  "¿Cuánto cuesta el envío?",
  "¿Qué métodos de pago aceptan?",
  "¿Los productos son hechos a mano?",
];

const SUGERENCIAS_GENERICAS = [
  "¿Qué venden?",
  "¿Cuánto cuesta el envío?",
  "¿Qué métodos de pago aceptan?",
  "¿Cómo puedo comprar?",
];

/** Variables CSS que un asistente personalizado re-marca en toda la página. */
function aplicarMarca(config: ConfigAsistente | null) {
  const raiz = document.documentElement.style;
  if (config) {
    raiz.setProperty("--marca", config.color);
    raiz.setProperty("--marca-oscuro", config.color);
    raiz.setProperty("--marca-profundo", config.color);
    raiz.setProperty("--fondo", config.fondo);
  } else {
    raiz.removeProperty("--marca");
    raiz.removeProperty("--marca-oscuro");
    raiz.removeProperty("--marca-profundo");
    raiz.removeProperty("--fondo");
  }
}

export default function Chat() {
  // ART-ES: el artesano que atiende la sesión (default del taller principal).
  const [artesano, setArtesano] = useState<Artesano>(() => resolverArtesano());
  // Asistente personalizado (creado en /crear): config del link (?c=).
  const [config, setConfig] = useState<ConfigAsistente | null>(null);
  const [cRaw, setCRaw] = useState<string | null>(null);
  // Plan Pro: si el chat corre embebido (widget en otro sitio) manda la
  // licencia; el servidor decide si está activado.
  const [embebido, setEmbebido] = useState(false);
  const [lic, setLic] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    { role: "assistant", content: resolverArtesano().saludo },
  ]);
  const [texto, setTexto] = useState("");
  const [cargando, setCargando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  // Se resuelve tras montar leyendo la URL (evita mismatch de hidratación).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    try {
      setEmbebido(window.self !== window.top);
    } catch {
      setEmbebido(true); // acceso bloqueado entre orígenes = seguro embebido
    }
    setLic(params.get("lic"));
    const c = params.get("c");
    const cfg = decodificarConfig(c);
    if (cfg && c) {
      setConfig(cfg);
      setCRaw(c);
      aplicarMarca(cfg);
      setMensajes((prev) =>
        prev.length <= 1
          ? [
              {
                role: "assistant",
                content:
                  cfg.saludo || saludoPorDefecto(cfg.asistente, cfg.marca),
              },
            ]
          : prev
      );
      return;
    }
    const param = params.get("artesano");
    if (!param) return;
    const elegido = resolverArtesano(param);
    setArtesano(elegido);
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
        // el saludo inicial es assistant y es válido como contexto;
        // se envían solo role/content (las tarjetas son de presentación)
        body: JSON.stringify({
          messages: nuevos.map(({ role, content }) => ({ role, content })),
          artesano: artesano.id,
          ...(cRaw ? { c: cRaw, embebido, ...(lic ? { lic } : {}) } : {}),
        }),
      });

      const data = await res.json();
      const respuesta =
        data.reply ||
        data.error ||
        "Perdoná, tuve un problema. Probá de nuevo en un momento.";

      setMensajes((prev) => [
        ...prev,
        {
          role: "assistant",
          content: respuesta,
          productos: Array.isArray(data.productos) ? data.productos : [],
        },
      ]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Perdoná, no logré conectar. Probá de nuevo en un momento.",
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

  // Textos e identidad según el modo (ART-ES o asistente personalizado)
  const nombreMarca = config ? config.marca : "ART-ES";
  const subtitulo = config
    ? `${config.asistente} · asistente virtual`
    : `Taller de ${artesano.nombre} · ${artesano.taller}`;
  const etiqueta = config ? config.asistente : `Taller de ${artesano.nombre}`;
  const sugerencias = config ? SUGERENCIAS_GENERICAS : SUGERENCIAS_ARTES;
  const pie = config
    ? `${config.marca} · asistente virtual`
    : "Hecho a mano en El Salvador 🇸🇻";
  const inicial = (config?.asistente || "A").charAt(0).toUpperCase();

  return (
    <section className="tarjeta" aria-label={`Chat con ${etiqueta} de ${nombreMarca}`}>
      <header className="encabezado">
        <div className="marca-fila">
          <div className="avatar" aria-hidden="true">
            {config ? (
              <span className="avatar-inicial">{inicial}</span>
            ) : (
              <img src="/logo.png" alt="" width={38} height={38} />
            )}
          </div>
          <div>
            <div className="marca-nombre">{nombreMarca}</div>
            <div className="marca-sub">{subtitulo}</div>
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
            {m.role === "assistant" && <div className="etiqueta">{etiqueta}</div>}
            {m.role === "assistant" ? conEnlaces(m.content) : m.content}
            {m.role === "assistant" && (m.productos?.length ?? 0) > 0 && (
              <div className="productos">
                {m.productos!.map((p) =>
                  p.url ? (
                    <a
                      key={p.url}
                      className="producto-card"
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {p.imagen && <img src={p.imagen} alt="" loading="lazy" />}
                      <span className="producto-info">
                        <span className="producto-nombre">{p.titulo}</span>
                        <span className="producto-precio">{p.precio}</span>
                      </span>
                    </a>
                  ) : (
                    <span key={p.titulo} className="producto-card">
                      {p.imagen && <img src={p.imagen} alt="" loading="lazy" />}
                      <span className="producto-info">
                        <span className="producto-nombre">{p.titulo}</span>
                        <span className="producto-precio">{p.precio}</span>
                      </span>
                    </span>
                  )
                )}
              </div>
            )}
          </div>
        ))}

        {cargando && (
          <div className="fila-silvi">
            {config ? (
              <span className="avatar-silvi avatar-inicial-chica" aria-hidden="true">
                {inicial}
              </span>
            ) : (
              <img
                className="avatar-silvi"
                src={artesano.avatar}
                alt=""
                width={36}
                height={36}
              />
            )}
            <div
              className="burbuja de-silvi"
              aria-label={`${etiqueta} está escribiendo`}
            >
              <div className="etiqueta">{etiqueta}</div>
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
          {sugerencias.map((s) => (
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

      <div className="pie">{pie}</div>
    </section>
  );
}
