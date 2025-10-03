-- Migration: Fix create_expiration_alert function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.create_expiration_alert() SET search_path = public; 