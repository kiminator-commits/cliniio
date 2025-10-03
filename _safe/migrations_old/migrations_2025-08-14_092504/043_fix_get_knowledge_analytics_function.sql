-- Migration: Fix get_knowledge_analytics function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.get_knowledge_analytics(UUID, INTEGER) SET search_path = public; 