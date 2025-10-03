// Mock import.meta.env for Jest tests
export default {
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_API_BASE_URL: 'http://test-api.example.com',
  VITE_APP_ENV: 'test',
  VITE_ENV_CLEAN_WS_URL: 'ws://localhost:3001',
  NODE_ENV: 'test',
  DEV: true,
  PROD: false,
  MODE: 'test',
  BASE_URL: '/',
  SSR: false,
};
