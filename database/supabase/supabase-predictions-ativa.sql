-- Compatibilidade para historico: permite ativar/desativar uma analise.
-- Execute no SQL Editor do Supabase se sua tabela predictions ja existe.

alter table public.predictions
  add column if not exists ativa boolean not null default true;

alter table public.predictions
  add column if not exists latitude double precision;

alter table public.predictions
  add column if not exists longitude double precision;

create index if not exists predictions_user_created_idx
  on public.predictions (user_id, created_at desc);
