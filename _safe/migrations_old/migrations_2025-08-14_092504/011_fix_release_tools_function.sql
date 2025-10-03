-- Migration: Fix release_tools_from_quarantine function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.release_tools_from_quarantine(UUID, UUID[], UUID, TEXT) SET search_path = public; 