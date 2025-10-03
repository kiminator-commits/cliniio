-- Migration: Fix update_tool_status_on_cycle_change function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.update_tool_status_on_cycle_change() SET search_path = public; 