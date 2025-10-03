-- Migration: Fix get_cycle_timeline function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.get_cycle_timeline(UUID) SET search_path = public; 