/**
 * Unified environment variable access for both Vite and Node.js environments
 * Uses process.env for environment variable access
 */

// Type-safe environment variable access
export const getEnvVar = (key: string, fallback = ''): string => {
  // Use import.meta.env for Vite environment variable access
  if (
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    key in import.meta.env
  ) {
    return import.meta.env[key] as string;
  }

  // Fallback to process.env for Node.js environments
  if (typeof process !== 'undefined' && process?.env && key in process.env) {
    return process.env[key]!;
  }

  // Return fallback if not found
  if (fallback === undefined) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return fallback;
};

// Check if we're in development mode
export const isDevelopment = (): boolean => {
  // Check Vite's DEV environment variable (browser)
  if (typeof import.meta !== 'undefined' && import.meta.env?.DEV === true) {
    return true;
  }

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
  // Check Vite's PROD environment variable (browser)
  if (typeof import.meta !== 'undefined' && import.meta.env?.PROD === true) {
    return true;
  }

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
