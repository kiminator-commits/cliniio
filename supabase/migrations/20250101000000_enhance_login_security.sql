-- Migration: Enhance login security
-- This migration improves the security of the login system

-- Create enhanced login_attempts table with better security features
CREATE TABLE IF NOT EXISTS login_attempts_secure (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT FALSE,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_id VARCHAR(255),
  csrf_token VARCHAR(255),
  threat_level VARCHAR(20) DEFAULT 'low' CHECK (threat_level IN ('low', 'medium', 'high', 'critical')),
  suspicious_patterns TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_secure_email ON login_attempts_secure(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_secure_ip ON login_attempts_secure(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_secure_attempted_at ON login_attempts_secure(attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_secure_success ON login_attempts_secure(success);
CREATE INDEX IF NOT EXISTS idx_login_attempts_secure_threat_level ON login_attempts_secure(threat_level);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_secure_email_time ON login_attempts_secure(email, attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_secure_ip_time ON login_attempts_secure(ip_address, attempted_at);

-- Create security events table for audit logging
CREATE TABLE IF NOT EXISTS security_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  client_id VARCHAR(100),
  email VARCHAR(255),
  ip_address INET,
  user_agent TEXT,
  event_details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for security events
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_email ON security_events(email);
CREATE INDEX IF NOT EXISTS idx_security_events_ip ON security_events(ip_address);

-- Create rate limiting table for server-side rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL, -- email or IP address
  identifier_type VARCHAR(20) NOT NULL CHECK (identifier_type IN ('email', 'ip', 'client')),
  attempt_count INTEGER NOT NULL DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  lockout_until TIMESTAMP WITH TIME ZONE,
  last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create unique index for rate limiting
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier, identifier_type);

-- Create indexes for rate limiting queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_rate_limits_lockout_until ON rate_limits(lockout_until);
CREATE INDEX IF NOT EXISTS idx_rate_limits_last_attempt ON rate_limits(last_attempt);

-- Create function to clean up old login attempts (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_login_attempts()
RETURNS void AS $$
BEGIN
  -- Delete login attempts older than 30 days
  DELETE FROM login_attempts_secure 
  WHERE attempted_at < NOW() - INTERVAL '30 days';
  
  -- Delete security events older than 90 days
  DELETE FROM security_events 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Clean up expired rate limits
  DELETE FROM rate_limits 
  WHERE window_start < NOW() - INTERVAL '1 day' 
    AND lockout_until IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_login_attempts_secure_updated_at
  BEFORE UPDATE ON login_attempts_secure
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for security
ALTER TABLE login_attempts_secure ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Policy: Only service role can access login attempts
CREATE POLICY "Service role only for login_attempts_secure" ON login_attempts_secure
  FOR ALL USING (auth.role() = 'service_role');

-- Policy: Only service role can access security events
CREATE POLICY "Service role only for security_events" ON security_events
  FOR ALL USING (auth.role() = 'service_role');

-- Policy: Only service role can access rate limits
CREATE POLICY "Service role only for rate_limits" ON rate_limits
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to record login attempt securely
CREATE OR REPLACE FUNCTION record_login_attempt(
  p_email VARCHAR(255),
  p_ip_address INET,
  p_user_agent TEXT DEFAULT NULL,
  p_success BOOLEAN DEFAULT FALSE,
  p_session_id VARCHAR(255) DEFAULT NULL,
  p_csrf_token VARCHAR(255) DEFAULT NULL,
  p_threat_level VARCHAR(20) DEFAULT 'low',
  p_suspicious_patterns TEXT[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  attempt_id UUID;
BEGIN
  INSERT INTO login_attempts_secure (
    email, ip_address, user_agent, success, session_id, csrf_token, threat_level, suspicious_patterns
  ) VALUES (
    p_email, p_ip_address, p_user_agent, p_success, p_session_id, p_csrf_token, p_threat_level, p_suspicious_patterns
  ) RETURNING id INTO attempt_id;
  
  RETURN attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to record security event
CREATE OR REPLACE FUNCTION record_security_event(
  p_event_type VARCHAR(100),
  p_severity VARCHAR(20),
  p_client_id VARCHAR(100) DEFAULT NULL,
  p_email VARCHAR(255) DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_event_details JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO security_events (
    event_type, severity, client_id, email, ip_address, user_agent, event_details
  ) VALUES (
    p_event_type, p_severity, p_client_id, p_email, p_ip_address, p_user_agent, p_event_details
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier VARCHAR(255),
  p_identifier_type VARCHAR(20),
  p_max_attempts INTEGER DEFAULT 5,
  p_window_minutes INTEGER DEFAULT 15,
  p_lockout_minutes INTEGER DEFAULT 30
)
RETURNS TABLE(
  allowed BOOLEAN,
  remaining_attempts INTEGER,
  reset_time TIMESTAMP WITH TIME ZONE,
  lockout_until TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  current_record RECORD;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  window_start := NOW() - INTERVAL '1 minute' * p_window_minutes;
  
  -- Get current rate limit record
  SELECT * INTO current_record
  FROM rate_limits
  WHERE identifier = p_identifier 
    AND identifier_type = p_identifier_type;
  
  -- If no record exists, create one
  IF current_record IS NULL THEN
    INSERT INTO rate_limits (identifier, identifier_type, attempt_count, window_start)
    VALUES (p_identifier, p_identifier_type, 0, NOW())
    RETURNING * INTO current_record;
  END IF;
  
  -- Check if currently locked out
  IF current_record.lockout_until IS NOT NULL AND current_record.lockout_until > NOW() THEN
    RETURN QUERY SELECT 
      FALSE as allowed,
      0 as remaining_attempts,
      current_record.lockout_until as reset_time,
      current_record.lockout_until as lockout_until;
    RETURN;
  END IF;
  
  -- Check if window has expired
  IF current_record.window_start < window_start THEN
    UPDATE rate_limits 
    SET attempt_count = 0, window_start = NOW(), lockout_until = NULL
    WHERE identifier = p_identifier AND identifier_type = p_identifier_type;
    
    current_record.attempt_count := 0;
    current_record.window_start := NOW();
    current_record.lockout_until := NULL;
  END IF;
  
  -- Return current status
  RETURN QUERY SELECT 
    (current_record.attempt_count < p_max_attempts) as allowed,
    GREATEST(0, p_max_attempts - current_record.attempt_count) as remaining_attempts,
    (current_record.window_start + INTERVAL '1 minute' * p_window_minutes) as reset_time,
    current_record.lockout_until as lockout_until;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment rate limit
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_identifier VARCHAR(255),
  p_identifier_type VARCHAR(20),
  p_max_attempts INTEGER DEFAULT 5,
  p_lockout_minutes INTEGER DEFAULT 30
)
RETURNS BOOLEAN AS $$
DECLARE
  current_record RECORD;
BEGIN
  -- Get current record
  SELECT * INTO current_record
  FROM rate_limits
  WHERE identifier = p_identifier AND identifier_type = p_identifier_type;
  
  -- Increment attempt count
  UPDATE rate_limits 
  SET attempt_count = attempt_count + 1, last_attempt = NOW()
  WHERE identifier = p_identifier AND identifier_type = p_identifier_type;
  
  -- Check if should be locked out
  IF current_record.attempt_count + 1 >= p_max_attempts THEN
    UPDATE rate_limits 
    SET lockout_until = NOW() + INTERVAL '1 minute' * p_lockout_minutes
    WHERE identifier = p_identifier AND identifier_type = p_identifier_type;
    
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- Create scheduled job to clean up old data (if pg_cron is available)
-- SELECT cron.schedule('cleanup-login-attempts', '0 2 * * *', 'SELECT cleanup_old_login_attempts();');

COMMENT ON TABLE login_attempts_secure IS 'Enhanced login attempts table with security features';
COMMENT ON TABLE security_events IS 'Security events audit log';
COMMENT ON TABLE rate_limits IS 'Server-side rate limiting storage';
COMMENT ON FUNCTION record_login_attempt IS 'Securely record a login attempt';
COMMENT ON FUNCTION record_security_event IS 'Record a security event';
COMMENT ON FUNCTION check_rate_limit IS 'Check current rate limit status';
COMMENT ON FUNCTION increment_rate_limit IS 'Increment rate limit counter';
COMMENT ON FUNCTION cleanup_old_login_attempts IS 'Clean up old data for retention policy';
