import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, supabaseConfigurado } from "@/lib/supabase/server";
import { LIMITE_MENSAJES, type PlanTier } from "@/lib/supabase/types";
import ListaAsistentes, { type AsistenteItem } from "@/components/ListaAsistentes";

export const metadata: Metadata = {
  title: { absolute: "Panel · Silvi Assistants" },
  robots: { index: false, follow: false },
};

// Siempre dinámico (usa cookies/sesión): nunca se prerenderiza en build.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  if (!supabaseConfigurado()) {
    return (
      <main className="dash">
        <div className="dash-card">
          <h1>Panel</h1>
          <p>Supabase todavía no está configurado en este entorno.</p>
        </div>
      </main>
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membresia } = await supabase
    .from("workspace_members")
    .select("workspace_id, workspaces(name)")
    .limit(1)
    .maybeSingle();
  const m = membresia as { workspace_id?: string; workspaces?: { name?: string } } | null;
  const workspaceId = m?.workspace_id ?? null;
  const workspace = m?.workspaces?.name ?? "Mi espacio";

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .maybeSingle();
  const plan = ((sub as { plan?: PlanTier } | null)?.plan ?? "free") as PlanTier;
  const limite = LIMITE_MENSAJES[plan];

  const { data: filas } = workspaceId
    ? await supabase
        .from("assistants")
        .select("id, slug, status, config")
        .eq("workspace_id", workspaceId)
        .neq("status", "archived")
        .order("updated_at", { ascending: false })
    : { data: [] };
  const asistentes = (filas ?? []) as unknown as AsistenteItem[];

  return (
    <main className="dash">
      <header className="dash-top">
        <a className="dash-logo" href="/">SILVI°</a>
        <form action="/auth/signout" method="post">
          <button className="dash-salir" type="submit">Cerrar sesión</button>
        </form>
      </header>

      <div className="dash-card">
        <span className="dash-etiqueta">[ tu panel ]</span>
        <h1>Hola 👋</h1>
        <p className="dash-sub">
          Sesión de <strong>{user.email}</strong> · espacio <strong>{workspace}</strong>
        </p>

        <div className="dash-grid">
          <div className="dash-stat">
            <span>Plan</span>
            <strong>{plan.toUpperCase()}</strong>
          </div>
          <div className="dash-stat">
            <span>Mensajes de IA / mes</span>
            <strong>{limite.toLocaleString()}</strong>
          </div>
          <div className="dash-stat">
            <span>Asistentes</span>
            <strong>{asistentes.length}</strong>
          </div>
        </div>

        <div className="dash-proximo">
          <div className="dash-asist-top">
            <h2>Tus asistentes</h2>
            <a className="dash-btn" href="/crear">+ Crear asistente</a>
          </div>
          <ListaAsistentes asistentes={asistentes} />
        </div>
      </div>
    </main>
  );
}
