import { NextRequest, NextResponse } from 'next/server';
import { validateToken } from '@/services/authService';
import { logger } from '@/utils/_core/logger';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export interface AuthMiddlewareOptions {
  requiredRole?: string;
  allowDevMode?: boolean;
}

/**
 * Authentication middleware for API routes
 * Validates JWT tokens and enforces role-based access control
 */
export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: AuthMiddlewareOptions = {}
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      // Allow dev mode if configured and in development
      if (options.allowDevMode && process.env.NODE_ENV === 'development') {
        const devToken = req.headers.get('x-dev-token');
        if (devToken === process.env.DEV_API_TOKEN) {
          (req as AuthenticatedRequest).user = {
            id: 'dev-user',
            email: 'dev@cliniio.com',
            role: 'Administrator',
          };
          return handler(req as AuthenticatedRequest);
        }
      }

      // Extract token from Authorization header
      const authHeader = req.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.warn('API: Missing or invalid authorization header', {
          endpoint: req.url,
          ip:
            req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        });
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);

      // Validate token
      const authResult = await validateToken(token);
      if (!authResult.valid) {
        logger.warn('API: Invalid token provided', {
          endpoint: req.url,
          ip:
            req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
        });
        return NextResponse.json(
          { error: 'Invalid authentication token' },
          { status: 401 }
        );
      }

      // Check role-based access if required
      if (
        options.requiredRole &&
        authResult.user?.role !== options.requiredRole
      ) {
        logger.warn('API: Insufficient permissions', {
          endpoint: req.url,
          userRole: authResult.user?.role,
          requiredRole: options.requiredRole,
          userId: authResult.user?.id,
        });
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      // Add user to request object
      (req as AuthenticatedRequest).user = authResult.user;

      // Log successful authentication
      logger.info('API: Authentication successful', {
        endpoint: req.url,
        userId: authResult.user?.id,
        userRole: authResult.user?.role,
      });

      return handler(req as AuthenticatedRequest);
    } catch (error) {
      logger.error('API: Authentication error', {
        endpoint: req.url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
}
