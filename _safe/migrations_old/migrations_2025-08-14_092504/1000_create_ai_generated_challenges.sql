-- Create AI-generated challenges table for intelligent, contextual improvement opportunities
-- These are "stretch goals" that staff can tackle during downtime

CREATE TABLE IF NOT EXISTS ai_generated_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('sterilization', 'inventory', 'environmental', 'knowledge', 'compliance', 'efficiency', 'innovation')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),
  estimated_duration INTEGER NOT NULL, -- in minutes
  impact TEXT NOT NULL CHECK (impact IN ('low', 'medium', 'high', 'critical')),
  effort TEXT NOT NULL CHECK (effort IN ('low', 'medium', 'high', 'extreme')),
  points INTEGER NOT NULL,
  ai_reasoning TEXT NOT NULL, -- Why AI suggested this challenge
  prerequisites TEXT[], -- Required skills/knowledge
  expected_outcomes TEXT[], -- What will be achieved
  seasonal_relevance TEXT, -- Why this matters now
  compliance_deadline DATE, -- If compliance-related
  facility_context TEXT NOT NULL, -- Why this is relevant to this facility
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- When challenge becomes stale
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track challenge completions
CREATE TABLE IF NOT EXISTS ai_challenge_completions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES ai_generated_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actual_duration INTEGER, -- Actual time spent in minutes
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5), -- 1-5 rating
  feedback TEXT, -- User feedback on challenge
  points_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_challenges_facility_id ON ai_generated_challenges(facility_id);
CREATE INDEX IF NOT EXISTS idx_ai_challenges_category ON ai_generated_challenges(category);
CREATE INDEX IF NOT EXISTS idx_ai_challenges_difficulty ON ai_generated_challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_ai_challenges_impact ON ai_generated_challenges(impact);
CREATE INDEX IF NOT EXISTS idx_ai_challenges_points ON ai_generated_challenges(points);
CREATE INDEX IF NOT EXISTS idx_ai_challenges_active ON ai_generated_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_challenges_generated_at ON ai_generated_challenges(generated_at);
CREATE INDEX IF NOT EXISTS idx_ai_challenge_completions_challenge_id ON ai_challenge_completions(challenge_id);
CREATE INDEX IF NOT EXISTS idx_ai_challenge_completions_user_id ON ai_challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_challenge_completions_facility_id ON ai_challenge_completions(facility_id);

-- Enable RLS
ALTER TABLE ai_generated_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_challenge_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view AI challenges for their facility" ON ai_generated_challenges
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_facility_roles ufr 
      WHERE ufr.user_id = auth.uid() 
      AND ufr.facility_id = ai_generated_challenges.facility_id
    )
  );

CREATE POLICY "System can manage AI challenges" ON ai_generated_challenges
  FOR ALL USING (true);

CREATE POLICY "Users can view their own challenge completions" ON ai_challenge_completions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own challenge completions" ON ai_challenge_completions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can manage challenge completions" ON ai_challenge_completions
  FOR ALL USING (true);

-- Add trigger to update updated_at
CREATE TRIGGER update_ai_generated_challenges_updated_at
  BEFORE UPDATE ON ai_generated_challenges
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically expire old challenges
CREATE OR REPLACE FUNCTION expire_old_ai_challenges()
RETURNS TRIGGER AS $$
BEGIN
  -- Expire challenges older than 30 days
  UPDATE ai_generated_challenges 
  SET is_active = false, updated_at = NOW()
  WHERE generated_at < NOW() - INTERVAL '30 days' 
  AND is_active = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to run expiration check daily
CREATE TRIGGER trigger_expire_old_challenges
  AFTER INSERT ON ai_generated_challenges
  FOR EACH ROW
  EXECUTE FUNCTION expire_old_ai_challenges();

-- Function to calculate challenge success rate
CREATE OR REPLACE FUNCTION get_challenge_success_rate(facility_uuid UUID)
RETURNS TABLE (
  category TEXT,
  total_challenges INTEGER,
  completed_challenges INTEGER,
  success_rate DECIMAL(5,2),
  avg_points_earned DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    agc.category,
    COUNT(DISTINCT agc.id)::INTEGER as total_challenges,
    COUNT(DISTINCT acc.challenge_id)::INTEGER as completed_challenges,
    ROUND(
      (COUNT(DISTINCT acc.challenge_id)::DECIMAL / COUNT(DISTINCT agc.id)::DECIMAL) * 100, 2
    ) as success_rate,
    ROUND(AVG(acc.points_earned), 2) as avg_points_earned
  FROM ai_generated_challenges agc
  LEFT JOIN ai_challenge_completions acc ON agc.id = acc.challenge_id
  WHERE agc.facility_id = facility_uuid
  GROUP BY agc.category
  ORDER BY agc.category;
END;
$$ LANGUAGE plpgsql;

