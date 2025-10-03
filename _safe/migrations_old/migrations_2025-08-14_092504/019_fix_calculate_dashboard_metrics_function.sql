-- Migration: Fix calculate_dashboard_metrics function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.calculate_dashboard_metrics(UUID, VARCHAR(100), INTEGER) SET search_path = public; 