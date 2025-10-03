-- Migration: Fix check_environmental_alerts function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.check_environmental_alerts() SET search_path = public; 