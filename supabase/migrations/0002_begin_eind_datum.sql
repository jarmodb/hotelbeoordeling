-- Run this in the Supabase SQL editor if you already ran the original schema.sql.
-- Replaces the single datum_geweest column with begin_datum + eind_datum.

alter table public.hotel_ratings_entries rename column datum_geweest to begin_datum;
alter table public.hotel_ratings_entries add column if not exists eind_datum date;
