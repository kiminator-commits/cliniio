-- Migration: Fix update_task_completion function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.update_task_completion() SET search_path = public; 