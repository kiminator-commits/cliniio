-- Migration: Fix get_facility_performance_metrics function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.get_facility_performance_metrics(UUID, INTEGER) SET search_path = public; 