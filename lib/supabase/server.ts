/**
 * ============================================================================
 *  SUPABASE — clientes de SERVIDOR (App Router)
 * ============================================================================
 *  - createClient():      cliente ligado a la sesión del usuario (cookies).
 *                         Respeta RLS. Úsalo en Server Components / Route
 *                         Handlers / middleware para leer "como el usuario".
 *  - createAdminClient(): cliente con SERVICE ROLE. SALTEA RLS. Solo para
 *                         operaciones privilegiadas del servidor (metering,
 *                         licencias, escritura de subscriptions por webhooks).
 *                         Su llave NUNCA llega al cliente.
 *
 *  Variables (en .env.local y Vercel):
 *    NEXT_PUBLIC_SUPABASE_URL
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY
 *    SUPABASE_SERVICE_ROLE_KEY     (solo servidor)
 * ============================================================================
 */

import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** ¿Están configuradas las variables públicas de Supabase? */
export function supabaseConfigurado(): boolean {
  return Boolean(URL && ANON);
}

/**
 * Cliente de servidor ligado a la sesión (cookies). Respeta RLS.
 * Next 14: cookies() es síncrono.
 */
export function createClient(): SupabaseClient {
  if (!URL || !ANON) {
    throw new Error("Supabase no está configurado (faltan NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY).");
  }
  const cookieStore = cookies();
  return createServerClient(URL, ANON, {
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

/** Cliente con SERVICE ROLE (saltea RLS). Solo servidor. */
export function createAdminClient(): SupabaseClient {
  if (adminCache) return adminCache;
  if (!URL || !SERVICE_ROLE) {
    throw new Error("Supabase admin no está configurado (falta SUPABASE_SERVICE_ROLE_KEY).");
  }
  adminCache = createSupabaseClient(URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminCache;
}
