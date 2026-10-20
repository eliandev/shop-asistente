/**
 * SUPABASE — cliente de NAVEGADOR (componentes "use client").
 * Usa la URL pública y la PUBLISHABLE key (ambas NEXT_PUBLIC_). Respeta RLS.
 * Fallback a la legacy anon key por compatibilidad.
 */
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishable =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !publishable) {
    throw new Error(
      "Supabase no está configurado (faltan NEXT_PUBLIC_SUPABASE_URL / _PUBLISHABLE_KEY)."
    );
  }
  return createBrowserClient(url, publishable);
}
