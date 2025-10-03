-- Migration: Fix update_asset_download_count function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.update_asset_download_count() SET search_path = public; 