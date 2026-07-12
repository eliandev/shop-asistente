"use client";

/**
 * Modal "Reclamar tu asistente" — captura de leads (Reto 3).
 * Intercambio de valor: la persona YA tiene su asistente funcionando; deja
 * su contacto para llevárselo (link + instalador por correo) o para pedir
 * el widget Pro. Persiste vía POST /api/lead (Firestore, dedupe por correo).
 */

import { useEffect, useRef, useState } from "react";
import type { ConfigAsistente } from "@/lib/config-asistente";
import { IconoBurbuja, IconoCheck, IconoChispas } from "@/components/Iconos";

export type TipoLead = "guardar" | "pro";

interface Props {
  open: boolean;
  onClose: () => void;
  config: ConfigAsistente;
  shareUrl: string;
  tipoInicial?: TipoLead;
}

type Estado = "form" | "enviando" | "ok" | "dupe" | "error";

export default function ReclamarAsistente({
  open,
  onClose,
  config,
  shareUrl,
  tipoInicial = "guardar",
}: Props) {
  const [tipo, setTipo] = useState<TipoLead>(tipoInicial);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [acepta, setAcepta] = useState(true);
  const [estado, setEstado] = useState<Estado>("form");
  const [copiado, setCopiado] = useState(false);
  const dialogoRef = useRef<HTMLDivElement>(null);

  // al abrir: sincronizar intención y devolver el modal al formulario
  useEffect(() => {
    if (open) {
      setTipo(tipoInicial);
      setEstado("form");
    }
  }, [open, tipoInicial]);

  // cerrar con Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!emailValido || estado === "enviando") return;
    setEstado("enviando");
    try {
      const fuente =
        new URLSearchParams(window.location.search).get("utm_source") || null;
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombre || null,
          email: email.trim(),
          whatsapp: whatsapp || null,
          negocio: config.marca || null,
          tipo,
          asistente: {
            marca: config.marca,
            asistente: config.asistente,
            rubro: config.rubro,
            dominio: config.dominio,
            color: config.color,
          },
          acepta_marketing: acepta,
          fuente,
          share_url: shareUrl, // link del asistente, para el correo
          website: "", // honeypot: siempre vacío en humanos
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setEstado(data.duplicate ? "dupe" : "ok");
      } else {
        setEstado("error");
      }
    } catch {
      setEstado("error");
    }
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {}
  }

  const exito = estado === "ok" || estado === "dupe";

  return (
    <div className="rec-overlay" onClick={onClose}>
      <div
        ref={dialogoRef}
        className="rec-dialogo"
        role="dialog"
        aria-modal="true"
        aria-label="Reclamar tu asistente"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="rec-cerrar"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>

        {!exito && estado !== "error" && (
          <>
            <h2 className="crd-h2-icono rec-titulo">
              <IconoChispas size={20} className="crd-icono-lima" />
              {config.asistente || "Tu asistente"} está listo — llevátelo
            </h2>
            <p className="rec-sub">
              Te enviamos por correo el link de {config.asistente || "tu asistente"} y
              el instalador para tu tienda, para que no lo pierdas.
            </p>

            <div className="rec-tipos" role="radiogroup" aria-label="Qué querés recibir">
              <button
                type="button"
                role="radio"
                aria-checked={tipo === "guardar"}
                className={`rec-tipo ${tipo === "guardar" ? "activo" : ""}`}
                onClick={() => setTipo("guardar")}
              >
                <strong>Guardar gratis</strong>
                <span>Link + instalador por correo</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={tipo === "pro"}
                className={`rec-tipo ${tipo === "pro" ? "activo" : ""}`}
                onClick={() => setTipo("pro")}
              >
                <strong>Quiero el widget Pro</strong>
                <span>Licencia para tu tienda</span>
              </button>
            </div>

            <form onSubmit={enviar}>
              <label className="adm-campo">
                <span>Tu nombre</span>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Elian"
                  maxLength={80}
                  autoFocus
                />
              </label>
              <label className="adm-campo">
                <span>Tu correo *</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vos@tumarca.com"
                  maxLength={120}
                  required
                />
              </label>
              <label className="adm-campo">
                <span>WhatsApp (opcional)</span>
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="+503 7777 7777"
                  maxLength={30}
                />
              </label>

              {/* honeypot: invisible para humanos, irresistible para bots */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="rec-honeypot"
                aria-hidden="true"
              />

              <label className="rec-consentimiento">
                <input
                  type="checkbox"
                  checked={acepta}
                  onChange={(e) => setAcepta(e.target.checked)}
                />
                <span>Quiero recibir novedades de Silvi Assistants</span>
              </label>

              <button
                type="submit"
                className="crd-nav-seguir rec-enviar"
                disabled={!emailValido || estado === "enviando"}
              >
                {estado === "enviando"
                  ? "Guardando…"
                  : tipo === "pro"
                    ? "Pedir mi widget Pro"
                    : "Enviarme mi asistente"}
              </button>
            </form>
          </>
        )}

        {exito && (
          <div className="rec-exito">
            <span className="rec-exito-icono" aria-hidden="true">
              <IconoCheck size={26} strokeWidth={2.4} />
            </span>
            <h2>
              {estado === "dupe"
                ? "¡Ya te teníamos! Actualizamos tus datos"
                : "¡Listo! Tu asistente quedó reclamado"}
            </h2>
            <p>
              {tipo === "pro"
                ? "Te contactamos en breve con tu licencia Pro y el instalador para tu tienda."
                : "Te llega por correo el link y el instalador. Mientras tanto, aquí lo tenés:"}
            </p>
            <div className="crd-copia">
              <input readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
              <button type="button" onClick={copiarLink}>
                {copiado ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
            <a
              className="ld-btn ld-btn-primario crd-probar"
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir mi asistente
              <IconoBurbuja size={16} strokeWidth={2.2} />
            </a>
          </div>
        )}

        {estado === "error" && (
          <div className="rec-exito">
            <h2>Algo falló al guardar</h2>
            <p>
              No pudimos registrar tus datos. Probá de nuevo en un momento —
              tu asistente sigue funcionando con su link.
            </p>
            <button
              type="button"
              className="crd-nav-seguir rec-enviar"
              onClick={() => setEstado("form")}
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
