-- Migration: Fix get_sterilization_analytics function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.get_sterilization_analytics(UUID, DATE, DATE) SET search_path = public; 