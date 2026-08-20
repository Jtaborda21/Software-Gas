-- =============================================================================
-- Migration: localization defaults + vehicle spec columns for onboarding/3D
-- Safe to run on a database that already has the original schema.sql applied.
-- Run once in the Supabase SQL Editor.
-- =============================================================================

-- New vehicle-spec columns (nullable / defaulted so existing rows stay valid)
alter table public.vehicles add column if not exists make text;
alter table public.vehicles add column if not exists model text;
alter table public.vehicles add column if not exists model_year integer;
alter table public.vehicles add column if not exists trim text;
alter table public.vehicles add column if not exists color_hex text not null default '#F5A623';
alter table public.vehicles add column if not exists onboarded boolean not null default false;

-- Flip localization defaults to Colombian Pesos + Gallons for any NEW rows.
-- (Existing rows are left untouched below so this migration is non-destructive;
-- uncomment the UPDATE if you want to convert your existing vehicle too.)
alter table public.vehicles alter column currency set default 'COP';
alter table public.vehicles alter column volume_unit set default 'gal';

-- Uncomment to switch your existing vehicle(s) to COP/gallons as well:
-- update public.vehicles set currency = 'COP', volume_unit = 'gal';

-- Existing users won't have onboarded = true, so the onboarding modal will
-- correctly show for them on next login until they complete vehicle setup.
