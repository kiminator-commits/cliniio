# Secure Authentication Edge Function

This Edge Function provides server-side authentication with comprehensive security features to replace the vulnerable client-side authentication system.

## Security Features

### 🔒 Server-Side Authentication

- All authentication requests are processed server-side
- No direct Supabase client usage from browser
- Secure token generation and validation

### 🛡️ Rate Limiting

- **Email-based**: 5 attempts per 15 minutes per email
- **IP-based**: 10 attempts per 15 minutes per IP
- **Progressive delays**: Exponential backoff on failures
- **Account lockout**: 30-minute lockout after 5 failed attempts
- **Redis-based**: Distributed rate limiting (with in-memory fallback)

### 🔍 Threat Detection

- **Suspicious activity detection**: Multiple patterns from same IP
- **Bot detection**: Regular timing pattern analysis
- **Geographic anomaly detection**: (Ready for IP geolocation integration)
- **Known malicious IP blocking**: (Ready for threat intelligence feeds)

### 📊 Audit Logging

- **Immutable audit trail**: All events logged server-side
- **Security event correlation**: Failed login clustering
- **Real-time monitoring**: Security dashboard integration
- **Retention policies**: Automatic cleanup of old data

### ✅ Input Validation

- **Email validation**: Format and length checks
- **Password strength**: Complexity requirements
- **CSRF protection**: Token validation
- **Input sanitization**: XSS prevention

## API Endpoint

### POST `/functions/v1/auth-login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123!",
  "csrfToken": "generated-csrf-token",
  "rememberMe": false
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

**Error Responses:**

**Rate Limit Exceeded (429):**

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "message": "Too many login attempts. Please try again later.",
  "rateLimitInfo": {
    "remainingAttempts": 0,
    "resetTime": 1642234567890
  }
}
```

**Authentication Failed (401):**

```json
{
  "success": false,
  "error": "Authentication failed",
  "message": "Invalid email or password"
}
```

**Security Violation (403):**

```json
{
  "success": false,
  "error": "Security violation detected",
  "message": "This request has been blocked due to suspicious activity."
}
```

## Configuration

### Environment Variables

```bash
# Rate limiting configuration
RATE_LIMIT_MAX_EMAIL=5
RATE_LIMIT_MAX_IP=10
RATE_LIMIT_WINDOW=15
RATE_LIMIT_LOCKOUT=30
RATE_LIMIT_DELAY=60

# Redis configuration (optional)
REDIS_URL=redis://localhost:6379

# Security settings
ENABLE_THREAT_DETECTION=true
LOG_SECURITY_EVENTS=true
```

### CORS Configuration

The function supports the following origins by default:

- `http://localhost:3000`
- `http://localhost:3001`
- `https://localhost:3000`
- `https://localhost:3001`
- `https://127.0.0.1:3000`
- `https://127.0.0.1:3001`
- `http://127.0.0.1:3000`
- `http://127.0.0.1:3001`

Add production domains to `cors.ts` as needed.

## Database Schema

### Tables Created

1. **`login_attempts_secure`**: Enhanced login attempts with security features
2. **`security_events`**: Comprehensive security event audit log
3. **`rate_limits`**: Server-side rate limiting storage

### Functions Created

1. **`record_login_attempt()`**: Securely record login attempts
2. **`record_security_event()`**: Record security events
3. **`check_rate_limit()`**: Check current rate limit status
4. **`increment_rate_limit()`**: Increment rate limit counter
5. **`cleanup_old_login_attempts()`**: Clean up old data

## Client Integration

### Replace Direct Supabase Calls

**Before (Vulnerable):**

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
});
```

**After (Secure):**

```typescript
import { secureAuthService } from '@/services/secureAuthService';

const result = await secureAuthService.secureLogin({
  email,
  password,
  csrfToken: secureAuthService.generateCSRFToken(),
});
```

### CSRF Token Management

```typescript
// Generate token
const csrfToken = secureAuthService.generateCSRFToken();

// Store securely
secureAuthService.storeCSRFToken(csrfToken);

// Validate token
const isValid = secureAuthService.validateCSRFToken(token, storedToken);
```

## Security Considerations

### ✅ What This Fixes

1. **Client-side bypass**: All authentication now server-side
2. **Rate limiting bypass**: Redis-based distributed rate limiting
3. **Audit trail tampering**: Immutable server-side logs
4. **Direct database access**: No client-side database operations
5. **CSRF attacks**: Token validation on all requests

### 🔄 Migration Strategy

1. **Deploy Edge Function**: Deploy the new authentication endpoint
2. **Update Client Code**: Replace direct Supabase calls
3. **Test Thoroughly**: Validate all authentication flows
4. **Monitor**: Watch for security events and performance
5. **Remove Old Code**: Clean up vulnerable client-side code

### 📈 Monitoring

Monitor the following metrics:

- Login success/failure rates
- Rate limiting triggers
- Security event patterns
- Response times
- Error rates

## Development

### Local Testing

```bash
# Start Supabase locally
supabase start

# Deploy the function
supabase functions deploy auth-login

# Test the endpoint
curl -X POST "http://localhost:54321/functions/v1/auth-login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123!",
    "csrfToken": "test-token"
  }'
```

### Security Testing

1. **Rate Limiting**: Test with multiple rapid requests
2. **CSRF Protection**: Test with invalid/missing tokens
3. **Input Validation**: Test with malformed inputs
4. **Threat Detection**: Test with suspicious patterns
5. **Error Handling**: Test with various error conditions

## Production Deployment

1. **Environment Setup**: Configure all environment variables
2. **Redis Setup**: Deploy Redis cluster for rate limiting
3. **Monitoring**: Set up security event monitoring
4. **Backup**: Ensure database backups include audit tables
5. **Documentation**: Update API documentation

## Support

For issues or questions:

1. Check the security event logs
2. Review rate limiting configuration
3. Validate CORS settings
4. Check Redis connectivity
5. Review Supabase configuration
