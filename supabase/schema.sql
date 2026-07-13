-- Hotelbeoordelingen app schema
-- Run this once in the Supabase SQL editor (Database > SQL Editor) of the existing project.
-- All objects are prefixed with hotel_ratings_ to avoid clashing with existing tables.

create table if not exists public.hotel_ratings_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  land text not null,
  provincie text,
  stad text,
  hotelnaam text not null,
  hygiene smallint check (hygiene between 1 and 5),
  badkamer smallint check (badkamer between 1 and 5),
  ontbijt smallint check (ontbijt between 1 and 5),
  bed smallint check (bed between 1 and 5),
  datum_geweest date,
  aantal_keer_geweest integer default 1,
  werk_prive text check (werk_prive in ('werk', 'prive', 'anders')),
  opmerkingen text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hotel_ratings_entries_user_id_idx on public.hotel_ratings_entries(user_id);
create index if not exists hotel_ratings_entries_land_idx on public.hotel_ratings_entries(land);

-- keep updated_at current on every edit
create or replace function public.hotel_ratings_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists hotel_ratings_entries_set_updated_at on public.hotel_ratings_entries;
create trigger hotel_ratings_entries_set_updated_at
  before update on public.hotel_ratings_entries
  for each row execute function public.hotel_ratings_set_updated_at();

alter table public.hotel_ratings_entries enable row level security;

drop policy if exists "hotel_ratings_select_own" on public.hotel_ratings_entries;
create policy "hotel_ratings_select_own" on public.hotel_ratings_entries
  for select using (auth.uid() = user_id);

drop policy if exists "hotel_ratings_insert_own" on public.hotel_ratings_entries;
create policy "hotel_ratings_insert_own" on public.hotel_ratings_entries
  for insert with check (auth.uid() = user_id);

drop policy if exists "hotel_ratings_update_own" on public.hotel_ratings_entries;
create policy "hotel_ratings_update_own" on public.hotel_ratings_entries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "hotel_ratings_delete_own" on public.hotel_ratings_entries;
create policy "hotel_ratings_delete_own" on public.hotel_ratings_entries
  for delete using (auth.uid() = user_id);
