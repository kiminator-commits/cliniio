-- Migration: Fix create_low_stock_alert function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.create_low_stock_alert() SET search_path = public; 