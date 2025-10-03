-- Migration: Fix get_inventory_movement_summary function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.get_inventory_movement_summary(UUID, DATE, DATE) SET search_path = public; 