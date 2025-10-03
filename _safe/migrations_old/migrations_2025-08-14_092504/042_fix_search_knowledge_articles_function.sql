-- Migration: Fix search_knowledge_articles function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.search_knowledge_articles(UUID, TEXT, UUID, VARCHAR(50), INTEGER) SET search_path = public; 