/**
 * Unified environment variable access for both Vite and Node.js environments
 * Uses process.env for environment variable access
 */

// Extend Window interface to include env property
interface WindowWithEnv extends Window {
  env?: Record<string, string>;
}

// Type-safe environment variable access
export const getEnvVar = (key: string, fallback = ''): string => {
  // Try process.env first (Node.js environment)
  if (typeof process !== 'undefined' && process?.env && key in process.env) {
    return process.env[key]!;
  }

  // Try window.env (custom environment setup)
  if (
    typeof window !== 'undefined' &&
    (window as WindowWithEnv).env &&
    key in (window as WindowWithEnv).env!
  ) {
    return (window as WindowWithEnv).env![key] as string;
  }

  // Return fallback if not found
  if (fallback === undefined) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return fallback;
};

// Check if we're in development mode
export const isDevelopment = (): boolean => {
  // Check NODE_ENV (Node.js)
  if (
    typeof process !== 'undefined' &&
    process?.env?.NODE_ENV === 'development'
  ) {
    return true;
  }

  return false;
};

// Check if we're in production mode
export const isProduction = (): boolean => {
  // Check NODE_ENV (Node.js)
  if (
    typeof process !== 'undefined' &&
    process?.env?.NODE_ENV === 'production'
  ) {
    return true;
  }

  return false;
};

// Check if we're in a browser environment
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};

// Check if we're in a Node.js environment
export const isNode = (): boolean => {
  return (
    typeof process !== 'undefined' &&
    process?.versions &&
    !!process.versions.node
  );
};

// Get environment variables with type safety
export const getEnvironmentConfig = () => {
  return {
    SUPABASE_URL: getEnvVar('VITE_SUPABASE_URL', ''),
    SUPABASE_ANON_KEY: getEnvVar('VITE_SUPABASE_ANON_KEY', ''),
    NODE_ENV: getEnvVar('NODE_ENV', 'development'),
    DEV: isDevelopment(),
    PROD: isProduction(),
    BROWSER: isBrowser(),
    NODE: isNode(),
  };
};
