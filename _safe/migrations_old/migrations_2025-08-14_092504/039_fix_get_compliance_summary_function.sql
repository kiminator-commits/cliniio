-- Migration: Fix get_compliance_summary function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.get_compliance_summary(UUID) SET search_path = public; 