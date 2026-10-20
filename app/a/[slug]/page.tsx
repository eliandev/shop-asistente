import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import Chat from "@/components/Chat";
import { createClient, supabaseConfigurado } from "@/lib/supabase/server";
import { sanitizarConfig, type ConfigAsistente } from "@/lib/config-asistente";

export const dynamic = "force-dynamic";

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

/** Config del asistente publicado por slug (lectura pública vía RLS). */
async function obtenerConfig(slug: string): Promise<ConfigAsistente | null> {
  if (!supabaseConfigurado()) return null;
  const supabase = createClient();
  const { data } = await supabase
    .from("assistants")
    .select("config")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (!data) return null;
  return sanitizarConfig((data as { config: unknown }).config);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const cfg = await obtenerConfig(params.slug);
  if (!cfg) {
    return { title: { absolute: "Asistente no encontrado · Silvi" }, robots: { index: false } };
  }
  return {
    title: { absolute: `${cfg.asistente} · ${cfg.marca} — asistente virtual` },
    description: `Chateá con ${cfg.asistente}, el asistente de ${cfg.marca}${
      cfg.rubro ? ` — ${cfg.rubro}` : ""
    }. Respuestas con datos reales, nunca inventadas.`,
    robots: { index: false, follow: true },
    openGraph: {
      title: `${cfg.asistente} · ${cfg.marca}`,
      description: `El asistente virtual de ${cfg.marca}. Preguntale por productos, precios y más.`,
    },
  };
}

export default async function PaginaAsistente({
  params,
}: {
  params: { slug: string };
}) {
  const cfg = await obtenerConfig(params.slug);
  if (!cfg) notFound();
  return (
    <main className="pantalla">
      <Chat configInicial={cfg} />
    </main>
  );
}
