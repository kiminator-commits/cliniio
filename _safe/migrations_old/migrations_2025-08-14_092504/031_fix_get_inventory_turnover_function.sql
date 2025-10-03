-- Migration: Fix get_inventory_turnover function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.get_inventory_turnover(UUID, INTEGER) SET search_path = public; 