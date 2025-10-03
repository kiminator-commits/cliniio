-- Migration: Enable Leaked Password Protection
-- Description: Enables Supabase Auth to check passwords against HaveIBeenPwned.org
-- Date: 2024-12-19

-- Enable leaked password protection for enhanced security
-- This feature checks user passwords against known data breaches
-- to prevent the use of compromised passwords

-- Note: This configuration is typically set in the Supabase dashboard
-- but can also be configured via the config.toml file
-- The setting has been added to config.toml: enable_leaked_password_protection = true

-- This migration serves as documentation and ensures the feature is enabled
-- when the database is reset or migrated

-- No SQL commands needed as this is a configuration change
-- The feature is enabled through the auth configuration in config.toml

COMMENT ON SCHEMA public IS 'Leaked password protection enabled via config.toml - enable_leaked_password_protection = true'; 