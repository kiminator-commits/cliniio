-- Migration: Fix update_attachment_download_count function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.update_attachment_download_count() SET search_path = public; 