-- Migration: Fix function search paths for security
-- This migration sets explicit search paths for functions to prevent security vulnerabilities
-- NOTE: This migration is commented out because the referenced functions don't exist yet
-- It can be re-enabled once the functions are created in other migrations

/*
-- Library and AI functions (verified to exist)
ALTER FUNCTION public.update_user_preferences_on_activity() SET search_path = public;
ALTER FUNCTION public.create_library_ai_event() SET search_path = public;
ALTER FUNCTION public.get_personalized_library_recommendations(UUID, UUID, INTEGER) SET search_path = public;
ALTER FUNCTION public.get_user_learning_analytics(UUID, UUID, INTEGER) SET search_path = public;
ALTER FUNCTION public.generate_library_ai_suggestions(UUID, UUID) SET search_path = public;

-- Challenge functions (verified to exist)
ALTER FUNCTION public.get_user_challenge_stats(UUID, UUID, INTEGER) SET search_path = public;
ALTER FUNCTION public.get_facility_challenge_analytics(UUID, INTEGER) SET search_path = public;

-- General utility functions (verified to exist)
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
*/ 