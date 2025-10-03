-- Migration: Fix update_updated_at_column function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.update_updated_at_column() SET search_path = public; 