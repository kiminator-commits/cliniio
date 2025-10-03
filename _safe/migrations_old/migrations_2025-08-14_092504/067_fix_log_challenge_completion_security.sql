-- =====================================================
-- FIX LOG_CHALLENGE_COMPLETION SECURITY ISSUE
-- =====================================================

-- Fix the log_challenge_completion function to have proper security settings
CREATE OR REPLACE FUNCTION log_challenge_completion()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Log the completion in audit_logs
    INSERT INTO audit_logs (
        module,
        table_name,
        record_id,
        action,
        user_id,
        facility_id,
        old_values,
        new_values,
        ip_address
    ) VALUES (
        'home',
        'home_challenge_completions',
        NEW.id,
        'INSERT',
        NEW.user_id,
        NEW.facility_id,
        NULL,
        jsonb_build_object(
            'challenge_id', NEW.challenge_id,
            'points_earned', NEW.points_earned,
            'completed_at', NEW.completed_at
        ),
        NULL
    );
    
    RETURN NEW;
END;
$$; 