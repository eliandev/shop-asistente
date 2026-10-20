import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, supabaseConfigurado } from "@/lib/supabase/server";
import { LIMITE_MENSAJES, type PlanTier } from "@/lib/supabase/types";

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
    .select("role, workspaces(name)")
    .limit(1)
    .maybeSingle();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .maybeSingle();

  const workspace = (membresia as any)?.workspaces?.name ?? "Mi espacio";
  const plan = ((sub as any)?.plan ?? "free") as PlanTier;
  const limite = LIMITE_MENSAJES[plan];

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
            <span>Uso del período</span>
            <strong>— <small>(pronto)</small></strong>
          </div>
        </div>

        <div className="dash-proximo">
          <h2>Tus asistentes</h2>
          <p>
            El dashboard de asistentes (crear, editar, publicar) llega en el
            próximo paso. Por ahora, tu cuenta y tu espacio ya están listos ✅
          </p>
          <a className="dash-btn" href="/crear">Crear un asistente →</a>
        </div>
      </div>
    </main>
  );
}
