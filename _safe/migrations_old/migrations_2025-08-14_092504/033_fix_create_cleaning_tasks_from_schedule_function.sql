-- Migration: Fix create_cleaning_tasks_from_schedule function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.create_cleaning_tasks_from_schedule() SET search_path = public; 