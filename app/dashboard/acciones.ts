"use server";

/**
 * Acciones del dashboard sobre asistentes (tabla `assistants`).
 * Corren en el servidor con la sesión del usuario → RLS garantiza que solo
 * tocan asistentes de SU workspace (no hace falta chequear el workspace a mano).
 */
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  sanitizarConfig,
  configValida,
  type ConfigAsistente,
} from "@/lib/config-asistente";

type Cliente = ReturnType<typeof createClient>;

/** slug legible + sufijo corto aleatorio (colisión despreciable). */
function nuevoSlug(marca: string): string {
  const base =
    (marca || "asistente")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 32) || "asistente";
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

async function workspaceId(supabase: Cliente): Promise<string | null> {
  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .limit(1)
    .maybeSingle();
  return (data as { workspace_id?: string } | null)?.workspace_id ?? null;
}

/** Crea (sin id) o actualiza (con id) un asistente. Devuelve el slug al crear. */
export async function guardarAsistente(
  configCruda: ConfigAsistente,
  id?: string
): Promise<{ ok: boolean; slug?: string; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "no-auth" };

  const config = sanitizarConfig(configCruda);
  if (!configValida(config)) return { ok: false, error: "config-invalida" };

  if (id) {
    const { error } = await supabase
      .from("assistants")
      .update({ config, domain: config.dominio || null })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };
    revalidatePath("/dashboard");
    return { ok: true };
  }

  const ws = await workspaceId(supabase);
  if (!ws) return { ok: false, error: "sin-workspace" };
  const { data, error } = await supabase
    .from("assistants")
    .insert({
      workspace_id: ws,
      slug: nuevoSlug(config.marca),
      config,
      domain: config.dominio || null,
      status: "draft",
    })
    .select("slug")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true, slug: (data as { slug: string }).slug };
}

export async function publicarAsistente(fd: FormData): Promise<void> {
  const id = String(fd.get("id") || "");
  const publicar = String(fd.get("publicar") || "") === "1";
  if (!id) return;
  const supabase = createClient();
  await supabase
    .from("assistants")
    .update({ status: publicar ? "published" : "draft" })
    .eq("id", id);
  revalidatePath("/dashboard");
}

export async function archivarAsistente(fd: FormData): Promise<void> {
  const id = String(fd.get("id") || "");
  if (!id) return;
  const supabase = createClient();
  await supabase.from("assistants").update({ status: "archived" }).eq("id", id);
  revalidatePath("/dashboard");
}

export async function duplicarAsistente(fd: FormData): Promise<void> {
  const id = String(fd.get("id") || "");
  if (!id) return;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: orig } = await supabase
    .from("assistants")
    .select("config, domain, workspace_id")
    .eq("id", id)
    .maybeSingle();
  if (!orig) return;
  const o = orig as { config: unknown; domain: string | null; workspace_id: string };
  const config = sanitizarConfig(o.config);
  await supabase.from("assistants").insert({
    workspace_id: o.workspace_id,
    slug: nuevoSlug(config.marca),
    config,
    domain: o.domain,
    status: "draft",
  });
  revalidatePath("/dashboard");
}

export async function borrarAsistente(fd: FormData): Promise<void> {
  const id = String(fd.get("id") || "");
  if (!id) return;
  const supabase = createClient();
  await supabase.from("assistants").delete().eq("id", id);
  revalidatePath("/dashboard");
}
