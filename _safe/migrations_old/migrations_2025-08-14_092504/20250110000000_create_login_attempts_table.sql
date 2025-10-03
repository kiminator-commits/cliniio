-- Migration: Create login attempts table for security monitoring
-- Description: Track failed login attempts to prevent brute force attacks
-- NOTE: This migration is commented out because the login_attempts table already exists
-- It can be re-enabled if the table needs to be recreated

/*
-- Create login attempts table
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN DEFAULT FALSE,
    failure_reason TEXT
);

-- Add RLS policies
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to view their own attempts
CREATE POLICY "Users can view their own login attempts" ON public.login_attempts
    FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Create policy to allow system to insert login attempts
CREATE POLICY "System can insert login attempts" ON public.login_attempts
    FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_attempted_at ON public.login_attempts(email, attempted_at);
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempted_at ON public.login_attempts(attempted_at);
*/
