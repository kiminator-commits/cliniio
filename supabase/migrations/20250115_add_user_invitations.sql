-- Create user_invitations table
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  permissions JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add facility tier columns
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'professional', 'enterprise'));
ALTER TABLE facilities ADD COLUMN IF NOT EXISTS user_limit INTEGER DEFAULT 5;

-- Create indexes for performance
CREATE INDEX idx_user_invitations_email ON user_invitations(email);
CREATE INDEX idx_user_invitations_facility_id ON user_invitations(facility_id);
CREATE INDEX idx_user_invitations_status ON user_invitations(status);
CREATE INDEX idx_user_invitations_expires_at ON user_invitations(expires_at);

-- Create RLS policies
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view invitations for their facility
CREATE POLICY "Users can view invitations for their facility" ON user_invitations
  FOR SELECT USING (
    facility_id IN (
      SELECT facility_id FROM users WHERE id = auth.uid()
    )
  );

-- Policy: Admins can manage invitations for their facility
CREATE POLICY "Admins can manage invitations for their facility" ON user_invitations
  FOR ALL USING (
    facility_id IN (
      SELECT facility_id FROM users 
      WHERE id = auth.uid() AND role IN ('administrator', 'manager')
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on user_invitations
CREATE TRIGGER update_user_invitations_updated_at 
  BEFORE UPDATE ON user_invitations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired invitations
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  UPDATE user_invitations 
  SET status = 'expired' 
  WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to clean up expired invitations (run daily)
-- Note: This requires pg_cron extension to be enabled in Supabase
-- SELECT cron.schedule('cleanup-expired-invitations', '0 0 * * *', 'SELECT cleanup_expired_invitations();');
