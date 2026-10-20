/**
 * ============================================================================
 *  SUPABASE — clientes de SERVIDOR (App Router)
 * ============================================================================
 *  - createClient():      cliente ligado a la sesión del usuario (cookies).
 *                         Respeta RLS. Úsalo en Server Components / Route
 *                         Handlers / middleware para leer "como el usuario".
 *  - createAdminClient(): cliente con la SECRET key. SALTEA RLS. Solo para
 *                         operaciones privilegiadas del servidor (metering,
 *                         licencias, escritura de subscriptions por webhooks).
 *                         Su llave NUNCA llega al cliente.
 *
 *  Usa las NUEVAS API keys de Supabase (sb_publishable_… / sb_secret_…), con
 *  fallback a las legacy (anon / service_role) por compatibilidad.
 *
 *  Variables (en .env.local y Vercel):
 *    NEXT_PUBLIC_SUPABASE_URL
 *    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY   (pública; o legacy _ANON_KEY)
 *    SUPABASE_SECRET_KEY                     (solo servidor; o legacy _SERVICE_ROLE_KEY)
 * ============================================================================
 */

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const PUBLISHABLE =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // fallback legacy
const SECRET =
  process.env.SUPABASE_SECRET_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY; // fallback legacy

/** ¿Están configuradas las variables públicas de Supabase? */
export function supabaseConfigurado(): boolean {
  return Boolean(URL && PUBLISHABLE);
}

/**
 * Cliente de servidor ligado a la sesión (cookies). Respeta RLS.
 * Next 14: cookies() es síncrono.
 */
export function createClient(): SupabaseClient {
  if (!URL || !PUBLISHABLE) {
    throw new Error(
      "Supabase no está configurado (faltan NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY)."
    );
  }
  const cookieStore = cookies();
  return createServerClient(URL, PUBLISHABLE, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        // En Server Components no se pueden setear cookies: se ignora con seguridad
        // (el refresh de sesión lo hace el middleware). En Route Handlers sí aplica.
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          /* llamado desde un Server Component: ignorar */
        }
      },
    },
  });
}

let adminCache: SupabaseClient | null = null;

/** Cliente con la SECRET key (saltea RLS). Solo servidor. */
export function createAdminClient(): SupabaseClient {
  if (adminCache) return adminCache;
  if (!URL || !SECRET) {
    throw new Error("Supabase admin no está configurado (falta SUPABASE_SECRET_KEY).");
  }
  adminCache = createSupabaseClient(URL, SECRET, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminCache;
}
