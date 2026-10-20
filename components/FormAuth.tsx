"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Modo = "login" | "signup";

export default function FormAuth({ modo }: { modo: Modo }) {
  const esRegistro = modo === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: "error" | "ok"; texto: string } | null>(null);

  async function conEmail(e: React.FormEvent) {
    e.preventDefault();
    if (cargando) return;
    setCargando(true);
    setAviso(null);
    try {
      const supabase = createClient();
      if (esRegistro) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${location.origin}/auth/callback` },
        });
        if (error) throw error;
        if (data.session) {
          // "Confirm email" off: ya hay sesión → directo al panel
          location.href = "/dashboard";
          return;
        }
        setAviso({
          tipo: "ok",
          texto: "Te enviamos un correo para confirmar tu cuenta. Revisá tu bandeja.",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        location.href = "/dashboard";
      }
    } catch (err) {
      setAviso({ tipo: "error", texto: mensajeError(err) });
    } finally {
      setCargando(false);
    }
  }

  async function conGoogle() {
    if (cargando) return;
    setCargando(true);
    setAviso(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${location.origin}/auth/callback?next=/dashboard` },
      });
      if (error) throw error;
      // redirige a Google; no hace falta más
    } catch (err) {
      setAviso({ tipo: "error", texto: mensajeError(err) });
      setCargando(false);
    }
  }

  return (
    <main className="auth">
      <div className="auth-card">
        <a className="auth-logo" href="/">SILVI°</a>
        <h1>{esRegistro ? "Creá tu cuenta" : "Entrá a tu panel"}</h1>
        <p className="auth-sub">
          {esRegistro
            ? "Gestioná tus asistentes y tu suscripción."
            : "Bienvenido de vuelta."}
        </p>

        <button className="auth-google" onClick={conGoogle} disabled={cargando} type="button">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.6 5.1C9.6 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.3 5.3C41.5 36 44 30.6 44 24c0-1.3-.1-2.3-.4-3.5z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="auth-o"><span>o con tu correo</span></div>

        <form onSubmit={conEmail} className="auth-form">
          <label className="auth-campo">
            <span>Correo</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vos@tutienda.com"
              autoComplete="email"
              required
            />
          </label>
          <label className="auth-campo">
            <span>Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={esRegistro ? "mínimo 6 caracteres" : "tu contraseña"}
              autoComplete={esRegistro ? "new-password" : "current-password"}
              minLength={6}
              required
            />
          </label>

          {aviso && <p className={`auth-aviso auth-aviso-${aviso.tipo}`}>{aviso.texto}</p>}

          <button className="auth-btn" type="submit" disabled={cargando}>
            {cargando ? "..." : esRegistro ? "Crear cuenta" : "Entrar"}
          </button>
        </form>

        <p className="auth-cambio">
          {esRegistro ? (
            <>¿Ya tenés cuenta? <a href="/login">Entrá</a></>
          ) : (
            <>¿Sin cuenta? <a href="/signup">Creá una gratis</a></>
          )}
        </p>
      </div>
    </main>
  );
}

function mensajeError(err: unknown): string {
  const m = err instanceof Error ? err.message : String(err);
  if (/Invalid login credentials/i.test(m)) return "Correo o contraseña incorrectos.";
  if (/already registered/i.test(m)) return "Ese correo ya tiene una cuenta. Probá entrar.";
  if (/provider is not enabled|Unsupported provider/i.test(m))
    return "El acceso con Google no está habilitado todavía.";
  return m || "Algo salió mal. Probá de nuevo.";
}
