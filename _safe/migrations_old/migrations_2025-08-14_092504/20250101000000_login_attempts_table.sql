-- Create login_attempts table for server-side rate limiting
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  success BOOLEAN NOT NULL DEFAULT false,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON login_attempts(attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_success ON login_attempts(email, success);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_attempted_at ON login_attempts(email, attempted_at);

-- Add RLS policies
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own login attempts
CREATE POLICY "Users can view their own login attempts" ON login_attempts
  FOR SELECT USING (auth.uid()::text = id::text);

-- Allow service role to insert/update/delete for rate limiting
CREATE POLICY "Service role can manage login attempts" ON login_attempts
  FOR ALL USING (auth.role() = 'service_role');

-- Allow anonymous users to insert for rate limiting (needed for login attempts)
CREATE POLICY "Anonymous users can insert login attempts" ON login_attempts
  FOR INSERT WITH CHECK (true);

-- Cleanup old attempts (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  DELETE FROM login_attempts 
  WHERE attempted_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-login-attempts', '0 2 * * *', 'SELECT cleanup_old_login_attempts();');
