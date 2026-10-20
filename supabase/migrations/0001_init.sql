-- ============================================================================
--  Fase A — Esquema inicial del SaaS monetizable (Silvi Assistants)
--  Cuentas (workspaces) · asistentes persistentes · suscripciones · uso ·
--  licencias. Con Row-Level Security (RLS) por pertenencia al workspace.
--
--  Aplicar con Supabase CLI:  supabase db push
--  o pegar en el SQL Editor del proyecto Supabase.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── Enums ───────────────────────────────────────────────────────────────────
create type plan_tier        as enum ('free','starter','growth','scale');
create type sub_status        as enum ('trialing','active','past_due','canceled','incomplete');
create type member_role       as enum ('owner','editor','viewer');
create type assistant_status  as enum ('draft','published','archived');
create type license_status    as enum ('active','revoked');

-- ── profiles (1:1 con auth.users) ───────────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  name       text,
  locale     text not null default 'es',
  created_at timestamptz not null default now()
);

-- ── workspaces (la "cuenta") ────────────────────────────────────────────────
create table public.workspaces (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  name       text not null default 'Mi espacio',
  created_at timestamptz not null default now()
);

-- ── workspace_members (base para seats de Growth/Scale) ─────────────────────
create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         member_role not null default 'owner',
  created_at   timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

-- ── assistants (el asistente persistente; config = ConfigAsistente) ─────────
create table public.assistants (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  slug         text not null unique,
  config       jsonb not null default '{}'::jsonb,
  domain       text,                       -- dominio Shopify conectado (opcional)
  status       assistant_status not null default 'draft',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index assistants_workspace_idx on public.assistants (workspace_id);

-- ── subscriptions (1 por workspace; FUENTE DE VERDAD del acceso) ────────────
create table public.subscriptions (
  workspace_id           uuid primary key references public.workspaces(id) on delete cascade,
  stripe_customer_id     text,
  stripe_subscription_id text,
  plan                   plan_tier  not null default 'free',
  status                 sub_status not null default 'active',
  current_period_end     timestamptz,
  cancel_at              timestamptz,
  updated_at             timestamptz not null default now()
);

-- ── usage_events (append-only; una fila por respuesta de IA) ────────────────
create table public.usage_events (
  id           bigint generated always as identity primary key,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  assistant_id uuid references public.assistants(id) on delete set null,
  tokens_in    int not null default 0,
  tokens_out   int not null default 0,
  created_at   timestamptz not null default now()
);
create index usage_events_ws_time_idx on public.usage_events (workspace_id, created_at);

-- ── usage_counters (rollup por período, para enforcement rápido) ────────────
create table public.usage_counters (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  period_start date not null,
  messages     int not null default 0,
  updated_at   timestamptz not null default now(),
  primary key (workspace_id, period_start)
);

-- ── licenses (reemplaza la emisión manual por script) ───────────────────────
create table public.licenses (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  assistant_id uuid references public.assistants(id) on delete cascade,
  domain       text not null,
  key          text not null,
  status       license_status not null default 'active',
  issued_at    timestamptz not null default now(),
  revoked_at   timestamptz
);
create index licenses_workspace_idx on public.licenses (workspace_id);

-- ── updated_at automático ───────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger assistants_touch    before update on public.assistants
  for each row execute function public.touch_updated_at();
create trigger subscriptions_touch before update on public.subscriptions
  for each row execute function public.touch_updated_at();

-- ── Alta de usuario: crea profile + workspace + membership + sub free ───────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare ws_id uuid;
begin
  insert into public.profiles (id, email) values (new.id, new.email);
  insert into public.workspaces (owner_id, name) values (new.id, 'Mi espacio')
    returning id into ws_id;
  insert into public.workspace_members (workspace_id, user_id, role)
    values (ws_id, new.id, 'owner');
  insert into public.subscriptions (workspace_id, plan, status)
    values (ws_id, 'free', 'active');
  return new;
end; $$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
--  Row-Level Security
-- ============================================================================
alter table public.profiles          enable row level security;
alter table public.workspaces        enable row level security;
alter table public.workspace_members enable row level security;
alter table public.assistants        enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.usage_events      enable row level security;
alter table public.usage_counters    enable row level security;
alter table public.licenses          enable row level security;

-- helper: ¿auth.uid() pertenece al workspace? (security definer = evita recursión)
create or replace function public.is_member(ws uuid)
returns boolean language sql security definer stable set search_path = public as $$
  select exists(
    select 1 from public.workspace_members m
    where m.workspace_id = ws and m.user_id = auth.uid()
  );
$$;

-- profiles: cada quien ve/edita su fila
create policy "profiles self read"   on public.profiles for select using (id = auth.uid());
create policy "profiles self update" on public.profiles for update using (id = auth.uid());

-- workspaces: los miembros leen; el dueño gestiona
create policy "workspaces member read" on public.workspaces for select using (public.is_member(id));
create policy "workspaces owner write" on public.workspaces for all
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- workspace_members: los miembros ven su equipo; el dueño gestiona
create policy "members read"  on public.workspace_members for select using (public.is_member(workspace_id));
create policy "members manage" on public.workspace_members for all
  using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()))
  with check (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));

-- assistants: lectura PÚBLICA si está publicado; gestión por miembros
create policy "assistants read" on public.assistants for select
  using (status = 'published' or public.is_member(workspace_id));
create policy "assistants write" on public.assistants for all
  using (public.is_member(workspace_id)) with check (public.is_member(workspace_id));

-- subscriptions / usage / licenses: lectura por miembros; ESCRITURA solo servidor
-- (el service_role saltea RLS; no se definen políticas de escritura para clientes).
create policy "subscriptions read" on public.subscriptions for select using (public.is_member(workspace_id));
create policy "usage_events read"  on public.usage_events  for select using (public.is_member(workspace_id));
create policy "usage_counters read" on public.usage_counters for select using (public.is_member(workspace_id));
create policy "licenses read"      on public.licenses      for select using (public.is_member(workspace_id));
