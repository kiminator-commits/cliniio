-- Migration: Optimize home challenges performance
-- This migration adds composite indexes and optimizes queries for better performance

-- Add composite index for challenge completions lookup
-- This will significantly improve the performance of user-specific completion queries
CREATE INDEX IF NOT EXISTS idx_home_challenge_completions_challenge_user 
ON home_challenge_completions(challenge_id, user_id);

-- Add composite index for facility-based challenge queries with active status
-- This optimizes the main query that filters by facility and active status
CREATE INDEX IF NOT EXISTS idx_home_challenges_facility_active_created 
ON home_challenges(facility_id, is_active, created_at DESC);

-- Add partial index for active challenges only
-- This reduces the index size and improves query performance
CREATE INDEX IF NOT EXISTS idx_home_challenges_active_only 
ON home_challenges(facility_id, created_at DESC) 
WHERE is_active = true;

-- Add index for the completion status subquery
-- This optimizes the user-specific completion lookup
CREATE INDEX IF NOT EXISTS idx_home_challenge_completions_user_challenge 
ON home_challenge_completions(user_id, challenge_id);

-- Analyze tables to update statistics for better query planning
ANALYZE home_challenges;
ANALYZE home_challenge_completions;

-- Add comment explaining the performance improvements
COMMENT ON INDEX idx_home_challenge_completions_challenge_user IS 
'Composite index for efficient challenge completion lookups by challenge_id and user_id';

COMMENT ON INDEX idx_home_challenges_facility_active_created IS 
'Composite index for facility-based queries with active status and creation date ordering';

COMMENT ON INDEX idx_home_challenges_active_only IS 
'Partial index for active challenges only, reducing index size and improving performance';

COMMENT ON INDEX idx_home_challenge_completions_user_challenge IS 
'Index for user-specific challenge completion queries';
