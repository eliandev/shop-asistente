# Supabase — base de datos del SaaS (Fase A)

Esquema multi-tenant: cuentas (`workspaces`), asistentes persistentes,
suscripciones, uso y licencias, con **RLS** por pertenencia al workspace.
Ver el plan en [../docs/FASE-A-plan.md](../docs/FASE-A-plan.md).

## Cómo aplicar la migración

**Opción A — SQL Editor (lo más rápido):**
1. Creá un proyecto en https://supabase.com.
2. Abrí **SQL Editor** → pegá el contenido de `migrations/0001_init.sql` → **Run**.

**Opción B — Supabase CLI:**
```bash
npm i -g supabase
supabase login
supabase link --project-ref <TU_PROJECT_REF>
supabase db push
```

## Variables de entorno (ver `.env.example`)

Project Settings → API Keys ("Publishable and secret"):
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (`sb_publishable_…`, públicas)
- `SUPABASE_SECRET_KEY` (`sb_secret_…`, **secreta** — solo servidor/Vercel, saltea RLS)

> Las keys legacy JWT (`anon` / `service_role`) siguen aceptándose como fallback,
> pero las nuevas son las recomendadas.

Cargalas en `.env.local` (local) y en Vercel. **No** commitees valores reales.

## Notas de diseño

- Al registrarse un usuario, un trigger (`handle_new_user`) crea su `profile`,
  su `workspace`, la membresía `owner` y una suscripción `free`.
- **Escrituras** de `subscriptions`, `usage_*` y `licenses` son **solo del
  servidor** (service role); los clientes solo pueden **leer** lo suyo (RLS).
- Los asistentes **publicados** son de lectura pública (para servir el chat a
  los shoppers); los borradores solo los ve su workspace.
