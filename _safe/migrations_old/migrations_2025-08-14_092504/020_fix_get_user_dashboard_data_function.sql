-- Migration: Fix get_user_dashboard_data function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.get_user_dashboard_data(UUID) SET search_path = public; 