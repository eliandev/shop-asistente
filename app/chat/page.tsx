import type { Metadata, Viewport } from "next";
import Chat from "@/components/Chat";
import { decodificarConfig } from "@/lib/config-asistente";

// El chat conserva el tema de la marca (ART-ES por defecto)
export const viewport: Viewport = {
  themeColor: "#0047AB",
  width: "device-width",
  initialScale: 1,
};

/**
 * Título y descripción según quién atiende: la demo de ART-ES (indexable) o
 * un asistente personalizado (?c= → título de su marca, sin indexar: son
 * links generados por usuarios).
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { c?: string };
}): Promise<Metadata> {
  const cfg = decodificarConfig(searchParams?.c);
  if (cfg) {
    return {
      title: { absolute: `${cfg.asistente} · ${cfg.marca} — asistente virtual` },
      description: `Chateá con ${cfg.asistente}, el asistente virtual de ${cfg.marca}${cfg.rubro ? ` — ${cfg.rubro}` : ""}. Respuestas con datos reales, nunca inventadas.`,
      robots: { index: false, follow: true },
      alternates: { canonical: "/chat" },
      openGraph: {
        title: `${cfg.asistente} · ${cfg.marca}`,
        description: `El asistente virtual de ${cfg.marca}. Preguntale por productos, precios y más.`,
      },
    };
  }
  return {
    title: { absolute: "Silvi · ART-ES — Artesanía salvadoreña hecha a mano" },
    description:
      "Preguntale a Silvi y a don José por las piezas de ART-ES: precios y disponibilidad en vivo, envíos, pagos y más. Hecho a mano en El Salvador.",
    alternates: { canonical: "/chat" },
    openGraph: {
      title: "Silvi · ART-ES — la demo con tienda real",
      description:
        "Chateá con el taller: catálogo en vivo de art-es.shop, envíos, pagos y políticas. Nunca inventa.",
    },
  };
}

export default function PaginaChat() {
  return (
    <main className="pantalla">
      <Chat />
    </main>
  );
}
