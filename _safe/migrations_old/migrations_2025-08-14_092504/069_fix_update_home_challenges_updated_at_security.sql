-- =====================================================
-- FIX UPDATE_HOME_CHALLENGES_UPDATED_AT SECURITY ISSUE
-- =====================================================

-- Fix the update_home_challenges_updated_at function to have proper security settings
CREATE OR REPLACE FUNCTION update_home_challenges_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$; 