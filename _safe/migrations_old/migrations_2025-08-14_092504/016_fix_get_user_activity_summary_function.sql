-- Migration: Fix get_user_activity_summary function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.get_user_activity_summary(UUID, INTEGER) SET search_path = public; 