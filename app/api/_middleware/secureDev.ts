import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from './auth';
import {
  validateSeedRequest,
  createValidationErrorResponse,
} from './validation';
import { createRateLimit, getUserKeyGenerator } from './rateLimit';
import {
  addSecurityHeaders,
  logApiRequest,
  logSecurityEvent,
  validateRequest,
} from './security';
import { logger } from '@/utils/_core/logger';

/**
 * Comprehensive security middleware for dev operations
 * Combines authentication, validation, rate limiting, and security headers
 */
export function withSecureDev(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  options: {
    requiredRole?: string;
    rateLimitConfig?: {
      windowMs: number;
      maxRequests: number;
    };
  } = {}
) {
  return withAuth(
    async (req: AuthenticatedRequest): Promise<NextResponse> => {
      try {
        // 1. Basic request validation
        const requestValidation = validateRequest(req);
        if (!requestValidation.isValid) {
          logSecurityEvent('invalid_request', req, {
            reason: requestValidation.reason,
          });
          return NextResponse.json(
            { error: 'Invalid request', details: requestValidation.reason },
            { status: 400 }
          );
        }

        // 2. Rate limiting
        const rateLimitConfig = options.rateLimitConfig || {
          windowMs: 15 * 60 * 1000, // 15 minutes
          maxRequests: 5, // 5 requests per 15 minutes for dev operations
        };

        const rateLimit = createRateLimit({
          ...rateLimitConfig,
          keyGenerator: getUserKeyGenerator,
        });

        const rateLimitResponse = rateLimit(req);
        if (rateLimitResponse) {
          return addSecurityHeaders(rateLimitResponse);
        }

        // 3. Input validation for POST requests
        if (req.method === 'POST') {
          let body: unknown = {};
          try {
            body = await req.json();
          } catch {
            logSecurityEvent('invalid_json', req, {
              error: 'Invalid JSON body',
            });
            return addSecurityHeaders(
              NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
              )
            );
          }

          const validation = validateSeedRequest(body);
          if (!validation.isValid) {
            return addSecurityHeaders(
              createValidationErrorResponse(validation.errors, req.url)
            );
          }

          // Add sanitized data to request for handler use
          (
            req as AuthenticatedRequest & { validatedData: unknown }
          ).validatedData = validation.sanitizedData;
        }

        // 4. Role-based access control
        if (options.requiredRole && req.user?.role !== options.requiredRole) {
          logSecurityEvent('insufficient_permissions', req, {
            userRole: req.user?.role,
            requiredRole: options.requiredRole,
          });
          return addSecurityHeaders(
            NextResponse.json(
              { error: 'Insufficient permissions for this operation' },
              { status: 403 }
            )
          );
        }

        // 5. Environment validation (additional layer)
        if (process.env.NODE_ENV === 'production') {
          logSecurityEvent('production_access_attempt', req);
          return addSecurityHeaders(
            NextResponse.json(
              { error: 'Dev operations are disabled in production' },
              { status: 403 }
            )
          );
        }

        // 6. Execute handler
        const response = await handler(req);

        // 7. Add security headers to response
        const securedResponse = addSecurityHeaders(response);

        // 8. Log request completion
        logApiRequest(req, securedResponse, {
          userId: req.user?.id,
          userRole: req.user?.role,
        });

        return securedResponse;
      } catch (error) {
        logger.error('API: Secure dev middleware error', {
          endpoint: req.url,
          error: error instanceof Error ? error.message : 'Unknown error',
          userId: req.user?.id,
        });

        return addSecurityHeaders(
          NextResponse.json({ error: 'Internal server error' }, { status: 500 })
        );
      }
    },
    {
      requiredRole: options.requiredRole || 'Administrator',
      allowDevMode: true,
    }
  );
}

/**
 * Validates that the operation is safe for the current environment
 */
export function validateEnvironmentSafety(): {
  isSafe: boolean;
  reason?: string;
} {
  // Check if we're in a safe environment
  const nodeEnv = process.env.NODE_ENV;
  const isProduction = nodeEnv === 'production';
  const isStaging = nodeEnv === 'staging';

  if (isProduction) {
    return { isSafe: false, reason: 'Production environment detected' };
  }

  // Additional safety checks
  const hasDevToken = !!process.env.DEV_API_TOKEN;
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!hasServiceKey) {
    return { isSafe: false, reason: 'Missing required service key' };
  }

  // In staging, require dev token
  if (isStaging && !hasDevToken) {
    return { isSafe: false, reason: 'Staging environment requires dev token' };
  }

  return { isSafe: true };
}
