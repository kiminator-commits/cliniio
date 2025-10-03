-- Migration: Fix generate_incident_number function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.generate_incident_number() SET search_path = public; 