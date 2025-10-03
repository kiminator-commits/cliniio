-- Migration: Fix create_audit_log function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.create_audit_log() SET search_path = public; 