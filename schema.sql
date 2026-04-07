create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  nickname text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create unique index if not exists users_email_lower_idx
  on public.users (lower(email));

create table if not exists public.user_states (
  user_id uuid primary key references public.users(id) on delete cascade,
  onboarding jsonb not null default '{}'::jsonb,
  onboarding_completed boolean not null default false,
  show_generated_page boolean not null default false,
  tasks jsonb not null default '[]'::jsonb,
  records jsonb not null default '[]'::jsonb,
  checkins jsonb not null default '[]'::jsonb,
  calendar_events jsonb not null default '[]'::jsonb,
  mock_sessions jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.sharing_requests (
  id text primary key,
  from_user_id uuid not null references public.users(id) on delete cascade,
  to_email text not null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  permissions jsonb not null default '{"checkin":false,"records":false,"allModules":false,"modules":[]}'::jsonb,
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists sharing_requests_from_user_idx
  on public.sharing_requests (from_user_id);

create index if not exists sharing_requests_to_email_lower_idx
  on public.sharing_requests (lower(to_email));

create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_states_set_updated_at on public.user_states;
create trigger user_states_set_updated_at
before update on public.user_states
for each row
execute function public.set_row_updated_at();

drop trigger if exists sharing_requests_set_updated_at on public.sharing_requests;
create trigger sharing_requests_set_updated_at
before update on public.sharing_requests
for each row
execute function public.set_row_updated_at();

alter table public.users enable row level security;
alter table public.user_states enable row level security;
alter table public.sharing_requests enable row level security;
