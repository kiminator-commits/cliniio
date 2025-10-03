-- Migration: Reapply update_inventory_quantity function search path fix
-- This migration ensures the search_path is properly set to fix the security warning

ALTER FUNCTION public.update_inventory_quantity() SET search_path = public; 