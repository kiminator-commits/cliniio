// CORS configuration for authentication endpoint
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://localhost:3000',
  'https://localhost:3001',
  'https://127.0.0.1:3000',
  'https://127.0.0.1:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
];

// Add production domains when available
const PRODUCTION_DOMAINS = [
  // Add your production domains here
  // 'https://yourdomain.com',
  // 'https://www.yourdomain.com',
];

const ALL_ORIGINS = [...ALLOWED_ORIGINS, ...PRODUCTION_DOMAINS];

export function isValidOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALL_ORIGINS.includes(origin);
}

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };

  if (origin && isValidOrigin(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else {
    // For development, allow localhost origins
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

export function getClientId(req: Request): string {
  // Generate a client identifier based on IP and User-Agent
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  // Create a simple hash-like identifier
  const identifier = `${ip}-${userAgent}`;
  return btoa(identifier).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
}
