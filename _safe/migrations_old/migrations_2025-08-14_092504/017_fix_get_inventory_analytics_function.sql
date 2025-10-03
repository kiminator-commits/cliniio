-- Migration: Fix get_inventory_analytics function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.get_inventory_analytics(UUID) SET search_path = public; 