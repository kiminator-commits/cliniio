// Environment-specific CORS configuration
export const getAllowedOrigins = (): string[] => {
  const environment = Deno.env.get('ENVIRONMENT') || 'development';

  switch (environment) {
    case 'production':
      return [
        'https://cliniio.com',
        'https://www.cliniio.com',
        'https://app.cliniio.com',
      ];
    case 'staging':
      return [
        'https://staging.cliniio.com',
        'https://cliniio-staging.vercel.app',
        'http://localhost:3000', // For local testing
        'http://localhost:3001', // For local testing
      ];
    case 'development':
    default:
      return [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001',
      ];
  }
};

// Origin validation function
export const isValidOrigin = (origin: string | null): boolean => {
  if (!origin) return false;

  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
};

// Generate CORS headers based on origin
export const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = getAllowedOrigins();
  const isAllowed = isValidOrigin(origin);

  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin',
  };
};
