-- Migration: Fix create_bi_failure_on_fail function search path
-- This migration adds SET search_path = public to fix the security warning

ALTER FUNCTION public.create_bi_failure_on_fail() SET search_path = public; 