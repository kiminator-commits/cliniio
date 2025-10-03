-- Create user_security_settings table
CREATE TABLE IF NOT EXISTS user_security_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_timeout INTEGER NOT NULL DEFAULT 480, -- 8 hours in minutes
  inactive_timeout INTEGER NOT NULL DEFAULT 30, -- 30 minutes in minutes
  remember_me_duration INTEGER NOT NULL DEFAULT 7, -- 7 days
  require_reauth_for_sensitive BOOLEAN NOT NULL DEFAULT true,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_security_settings_user_id ON user_security_settings(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE user_security_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own security settings" ON user_security_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own security settings" ON user_security_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own security settings" ON user_security_settings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own security settings" ON user_security_settings
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_security_settings_updated_at
  BEFORE UPDATE ON user_security_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings for existing users (optional)
-- This can be run manually if needed:
-- INSERT INTO user_security_settings (user_id, session_timeout, inactive_timeout, remember_me_duration, require_reauth_for_sensitive, two_factor_enabled)
-- SELECT id, 480, 30, 7, true, false
-- FROM auth.users
-- WHERE id NOT IN (SELECT user_id FROM user_security_settings);
