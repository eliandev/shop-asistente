/**
 * SUPABASE — cliente de NAVEGADOR (componentes "use client").
 * Usa solo la URL pública y la anon key (ambas NEXT_PUBLIC_). Respeta RLS.
 */
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export function createClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error("Supabase no está configurado (faltan NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY).");
  }
  return createBrowserClient(url, anon);
}
