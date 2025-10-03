-- Migration: Fix update_audit_date function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.update_audit_date() SET search_path = public; 