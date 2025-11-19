-- Fix security warnings

-- Move PostGIS extension to extensions schema if not already there
CREATE SCHEMA IF NOT EXISTS extensions;
DROP EXTENSION IF EXISTS postgis CASCADE;
CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- Recreate practitioners table with fixed location reference
ALTER TABLE public.practitioners DROP COLUMN IF EXISTS location_coordinates;
ALTER TABLE public.practitioners ADD COLUMN location_coordinates extensions.geography(POINT, 4326);

-- Recreate events table with fixed location reference  
ALTER TABLE public.events DROP COLUMN IF EXISTS location_coordinates;
ALTER TABLE public.events ADD COLUMN location_coordinates extensions.geography(POINT, 4326);

-- Recreate spatial indexes
DROP INDEX IF EXISTS idx_practitioners_location;
DROP INDEX IF EXISTS idx_events_location;
CREATE INDEX idx_practitioners_location ON public.practitioners USING GIST(location_coordinates);
CREATE INDEX idx_events_location ON public.events USING GIST(location_coordinates);

-- Fix search_path for handle_updated_at function (already set in handle_new_user and role functions)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;