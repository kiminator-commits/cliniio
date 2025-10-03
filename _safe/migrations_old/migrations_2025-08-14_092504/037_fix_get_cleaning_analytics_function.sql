-- Migration: Fix get_cleaning_analytics function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.get_cleaning_analytics(UUID, DATE, DATE) SET search_path = public; 