-- Migration: Fix challenge completion audit logging
-- This migration fixes the log_challenge_completion function to include the required module field

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS trigger_log_challenge_completion ON home_challenge_completions;
DROP FUNCTION IF EXISTS log_challenge_completion();

-- Recreate the function with the correct module field
CREATE OR REPLACE FUNCTION log_challenge_completion()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_log_challenge_completion
    AFTER INSERT ON home_challenge_completions
    FOR EACH ROW
    EXECUTE FUNCTION log_challenge_completion(); 