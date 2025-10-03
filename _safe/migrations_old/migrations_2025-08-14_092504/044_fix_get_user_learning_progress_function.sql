-- Migration: Fix get_user_learning_progress function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.get_user_learning_progress(UUID) SET search_path = public; 