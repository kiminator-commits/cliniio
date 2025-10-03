import { getEnvVar } from '@/lib/getEnv';

export const ENV = {
  APP_ENV: getEnvVar('VITE_APP_ENV') || 'development',
  API_BASE_URL: getEnvVar('VITE_API_BASE_URL'),
};
