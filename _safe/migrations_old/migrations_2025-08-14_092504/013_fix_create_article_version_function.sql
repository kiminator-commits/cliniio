-- Migration: Fix create_article_version function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.create_article_version() SET search_path = public; 