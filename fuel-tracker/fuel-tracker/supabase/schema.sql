-- =============================================================================
-- Fuel Tracker — Supabase schema
-- Run this once in the Supabase SQL Editor (or via `supabase db push`).
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- vehicles: lets a user track more than one car; a default one is created
-- automatically for every new user via a trigger further down.
-- -----------------------------------------------------------------------------
create table if not exists public.vehicles (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  name         text not null default 'My Car',
  distance_unit text not null default 'km' check (distance_unit in ('km', 'mi')),
  volume_unit  text not null default 'gal' check (volume_unit in ('L', 'gal')),
  currency     text not null default 'COP',
  tank_bars    smallint not null default 8, -- how many bars the fuel gauge has

  -- Vehicle spec, filled in by the onboarding flow's cascading dropdowns.
  make         text,
  model        text,
  model_year   integer,
  trim         text,
  color_hex    text not null default '#F5A623', -- 3D visualizer paint color
  onboarded    boolean not null default false,   -- false until onboarding is completed

  created_at   timestamptz not null default now()
);

alter table public.vehicles enable row level security;

create policy "Users manage their own vehicles"
  on public.vehicles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- refuel_records: one row per fill-up
-- -----------------------------------------------------------------------------
create table if not exists public.refuel_records (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  vehicle_id        uuid not null references public.vehicles (id) on delete cascade,

  refuel_at         timestamptz not null default now(),

  volume            numeric not null check (volume > 0),          -- liters or gallons
  total_cost        numeric not null check (total_cost >= 0),

  odometer          numeric,                                       -- total odometer reading (optional)
  trip_distance     numeric check (trip_distance is null or trip_distance >= 0),
                                                                     -- distance since last fill-up

  gauge_bars_before smallint,                                       -- bars showing BEFORE this refuel
  is_full_tank      boolean not null default true,                  -- full-to-full method for accurate L/100km

  notes             text,
  created_at        timestamptz not null default now()
);

create index if not exists refuel_records_user_idx on public.refuel_records (user_id, refuel_at desc);
create index if not exists refuel_records_vehicle_idx on public.refuel_records (vehicle_id, refuel_at desc);

alter table public.refuel_records enable row level security;

create policy "Users manage their own refuel records"
  on public.refuel_records for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Auto-create a default vehicle whenever a new auth user signs up
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.vehicles (user_id, name)
  values (new.id, 'My Car');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Convenience view: derives km/L (or mi/gal) and cost-per-distance per record.
-- Efficiency is only meaningful for full-tank fill-ups (is_full_tank = true).
-- -----------------------------------------------------------------------------
create or replace view public.refuel_records_enriched as
select
  r.*,
  case
    when r.is_full_tank and r.trip_distance is not null and r.trip_distance > 0
      then round((r.trip_distance / r.volume)::numeric, 2)
    else null
  end as distance_per_volume,
  case
    when r.trip_distance is not null and r.trip_distance > 0
      then round((r.total_cost / r.trip_distance)::numeric, 4)
    else null
  end as cost_per_distance,
  case
    when r.is_full_tank and r.trip_distance is not null and r.trip_distance > 0
      then round((r.volume / r.trip_distance * 100)::numeric, 2)
    else null
  end as volume_per_100
from public.refuel_records r;
