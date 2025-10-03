// Mock getEnv module for Jest tests
export const getEnvVar = (key: string): string => {
  const mockEnvVars: Record<string, string> = {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_API_BASE_URL: 'http://test-api.example.com',
    VITE_APP_ENV: 'test',
    VITE_ENV_CLEAN_WS_URL: 'ws://localhost:3001',
    NODE_ENV: 'test',
    DEV: 'true',
    PROD: 'false',
  };

  return mockEnvVars[key] || '';
};

export const isBrowser = (): boolean => false;
export const isDevelopment = (): boolean => true;
export const isProduction = (): boolean => false;
export const getEnvironmentConfig = () => ({
  SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_ANON_KEY: 'test-anon-key',
  NODE_ENV: 'test',
  DEV: true,
  PROD: false,
  BROWSER: false,
  NODE: true,
});
