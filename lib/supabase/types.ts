/**
 * Tipos de las filas del esquema (ver supabase/migrations/0001_init.sql).
 * Hechos a mano para la Fase A; si luego usamos `supabase gen types`, este
 * archivo se puede reemplazar por el generado.
 */
import type { ConfigAsistente } from "@/lib/config-asistente";

export type PlanTier = "free" | "starter" | "growth" | "scale";
export type SubStatus = "trialing" | "active" | "past_due" | "canceled" | "incomplete";
export type MemberRole = "owner" | "editor" | "viewer";
export type AssistantStatus = "draft" | "published" | "archived";
export type LicenseStatus = "active" | "revoked";

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  locale: string;
  created_at: string;
}

export interface Workspace {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
}

export interface WorkspaceMember {
  workspace_id: string;
  user_id: string;
  role: MemberRole;
  created_at: string;
}

export interface Assistant {
  id: string;
  workspace_id: string;
  slug: string;
  config: ConfigAsistente;
  domain: string | null;
  status: AssistantStatus;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  workspace_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: PlanTier;
  status: SubStatus;
  current_period_end: string | null;
  cancel_at: string | null;
  updated_at: string;
}

export interface UsageCounter {
  workspace_id: string;
  period_start: string;
  messages: number;
  updated_at: string;
}

export interface License {
  id: string;
  workspace_id: string;
  assistant_id: string | null;
  domain: string;
  key: string;
  status: LicenseStatus;
  issued_at: string;
  revoked_at: string | null;
}

/** Topes de mensajes de IA por mes, por plan (fuente de verdad del enforcement). */
export const LIMITE_MENSAJES: Record<PlanTier, number> = {
  free: 100,
  starter: 1000,
  growth: 5000,
  scale: 20000,
};
