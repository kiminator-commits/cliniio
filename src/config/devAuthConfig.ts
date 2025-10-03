import { isDevelopment, getEnvVar } from '@/lib/getEnv';

// Development authentication configuration
export const DEV_AUTH_CONFIG = {
  // Mock user for development when Supabase is not configured
  mockUser: {
    id: 'dev-user-id',
    name: 'Development User',
    email: 'dev@cliniio.com',
    role: 'Administrator',
  },

  // Skip authentication in development mode
  skipAuth: isDevelopment() && !getEnvVar('VITE_SUPABASE_URL', ''),

  // Development credentials - use real Supabase credentials for auto-login
  devCredentials: {
    email: 'test@cliniio.com', // Use your actual test user
    password: 'test123', // Use your actual test password
  },

  // Auto-login for development
  autoLogin: isDevelopment(),

  // Mock token for development
  mockToken: 'dev-mock-token-' + Date.now(),
};

// Check if we're in development mode without proper Supabase config
export const isDevModeWithoutSupabase = (): boolean => {
  return isDevelopment() && !getEnvVar('VITE_SUPABASE_URL', '');
};

// Get development user data
export const getDevUser = () => {
  return DEV_AUTH_CONFIG.mockUser;
};

// Create a development session
export const createDevSession = () => {
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return {
    token: DEV_AUTH_CONFIG.mockToken,
    expiry,
    user: DEV_AUTH_CONFIG.mockUser,
  };
};
