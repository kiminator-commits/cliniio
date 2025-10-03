-- Migration: Fix update_inventory_quantity function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.update_inventory_quantity() SET search_path = public; 