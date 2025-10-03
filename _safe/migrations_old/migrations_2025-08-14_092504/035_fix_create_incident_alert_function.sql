-- Migration: Fix create_incident_alert function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.create_incident_alert() SET search_path = public; 