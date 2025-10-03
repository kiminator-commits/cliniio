-- =====================================================
-- FIX GET_USER_COMPLETED_CHALLENGES SECURITY ISSUE
-- =====================================================

-- Fix the get_user_completed_challenges function to have proper security settings
CREATE OR REPLACE FUNCTION get_user_completed_challenges(user_uuid UUID)
RETURNS TABLE (
    challenge_id UUID,
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(50),
    difficulty VARCHAR(20),
    points INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    points_earned INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hc.id as challenge_id,
        hc.title,
        hc.description,
        hc.category,
        hc.difficulty,
        hc.points,
        hcc.completed_at,
        hcc.points_earned
    FROM home_challenges hc
    INNER JOIN home_challenge_completions hcc ON hc.id = hcc.challenge_id
    WHERE hcc.user_id = user_uuid
    ORDER BY hcc.completed_at DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_user_completed_challenges(UUID) TO authenticated; 