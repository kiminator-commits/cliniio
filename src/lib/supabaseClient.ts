import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';
import { getEnvVar } from './getEnv';

// Get environment variables with proper fallbacks
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://mock.supabase.co');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'mock-anon-key');

// For CI/testing environments, use service role key if available to bypass RLS
const isTestEnvironment =
  (typeof process !== 'undefined' && process?.env?.NODE_ENV === 'test') ||
  (typeof process !== 'undefined' && process?.env?.CI === 'true');
const serviceRoleKey = getEnvVar('SUPABASE_SERVICE_ROLE_KEY', '');

// Use service role key in test/CI environments to bypass RLS, otherwise use anon key
const supabaseKey =
  isTestEnvironment && serviceRoleKey ? serviceRoleKey : supabaseAnonKey;

// Create Supabase client with appropriate key
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
