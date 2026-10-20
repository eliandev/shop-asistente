"use client";

import { useState } from "react";
import { codificarConfig, type ConfigAsistente } from "@/lib/config-asistente";
import type { AssistantStatus } from "@/lib/supabase/types";
import {
  publicarAsistente,
  duplicarAsistente,
  borrarAsistente,
} from "@/app/dashboard/acciones";

export interface AsistenteItem {
  id: string;
  slug: string;
  status: AssistantStatus;
  config: ConfigAsistente;
}

const ETIQUETA: Record<AssistantStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  archived: "Archivado",
};

export default function ListaAsistentes({ asistentes }: { asistentes: AsistenteItem[] }) {
  if (!asistentes.length) {
    return (
      <div className="lsa-vacio">
        <p>Todavía no tenés asistentes guardados.</p>
        <a className="dash-btn" href="/crear">Crear tu primer asistente →</a>
      </div>
    );
  }
  return (
    <div className="lsa-grid">
      {asistentes.map((a) => (
        <Tarjeta key={a.id} a={a} />
      ))}
    </div>
  );
}

function Tarjeta({ a }: { a: AsistenteItem }) {
  const [copiado, setCopiado] = useState(false);
  const c = codificarConfig(a.config);
  const publicado = a.status === "published";

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/a/${a.slug}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    } catch {
      /* sin clipboard: ignorar */
    }
  }

  return (
    <article className="lsa-card">
      <div className="lsa-head">
        <div>
          <h3>{a.config.marca || "Sin nombre"}</h3>
          <span className="lsa-asistente">
            {a.config.asistente || "asistente"}
            {a.config.rubro ? ` · ${a.config.rubro}` : ""}
          </span>
        </div>
        <span className={`lsa-estado lsa-${a.status}`}>{ETIQUETA[a.status]}</span>
      </div>

      <div className="lsa-acciones">
        <a className="lsa-btn" href={`/crear?id=${a.id}&c=${c}`}>Editar</a>
        <a className="lsa-btn" href={`/chat?c=${c}`} target="_blank" rel="noopener noreferrer">
          Vista previa
        </a>
        {publicado && (
          <button className="lsa-btn" type="button" onClick={copiarLink}>
            {copiado ? "¡Copiado!" : "Copiar link"}
          </button>
        )}
      </div>

      <div className="lsa-acciones lsa-acciones-sec">
        <form action={publicarAsistente}>
          <input type="hidden" name="id" value={a.id} />
          <input type="hidden" name="publicar" value={publicado ? "0" : "1"} />
          <button className="lsa-btn lsa-btn-primario" type="submit">
            {publicado ? "Despublicar" : "Publicar"}
          </button>
        </form>
        <form action={duplicarAsistente}>
          <input type="hidden" name="id" value={a.id} />
          <button className="lsa-btn" type="submit">Duplicar</button>
        </form>
        <form
          action={borrarAsistente}
          onSubmit={(e) => {
            if (!confirm("¿Borrar este asistente? No se puede deshacer.")) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={a.id} />
          <button className="lsa-btn lsa-btn-borrar" type="submit">Borrar</button>
        </form>
      </div>
    </article>
  );
}
