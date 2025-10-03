-- Migration: Fix create_notification function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.create_notification(UUID, UUID, VARCHAR(100), VARCHAR(255), TEXT, VARCHAR(20), VARCHAR(50), TEXT, JSONB) SET search_path = public; 