-- Migration: Fix update_article_view_count function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.update_article_view_count() SET search_path = public; 