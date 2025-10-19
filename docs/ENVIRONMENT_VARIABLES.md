# Environment Variables - Unified System

## Overview

This document describes the unified environment variable system implemented in `src/lib/getEnv.ts` that resolves inconsistencies between Vite's `import.meta.env` and Node.js's `process.env`.

## Problem Solved

Previously, the codebase had inconsistent environment variable access:

- Some files used `import.meta.env` (Vite's client-side system)
- Others used `process.env` (Node.js server-side system)
- This caused different behavior in development vs production environments

## Solution: Unified Environment System

### Core Functions

#### `getEnvVar(key: string): string`

Safely retrieves environment variables with proper fallbacks:

```typescript
import { getEnvVar } from '@/lib/getEnv';

// Usage
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const apiKey = getEnvVar('VITE_API_KEY');
```

**Priority Order:**

1. Vite's `import.meta.env` (client-side)
2. Node.js `process.env` (server-side)
3. Development fallbacks (for specific keys)

#### `isDevelopment(): boolean`

Checks if the application is running in development mode:

```typescript
import { isDevelopment } from '@/lib/getEnv';

if (isDevelopment()) {
  console.log('Development mode enabled');
}
```

#### `isProduction(): boolean`

Checks if the application is running in production mode:

```typescript
import { isProduction } from '@/lib/getEnv';

if (isProduction()) {
  // Production-specific logic
}
```

#### `isBrowser(): boolean`

Checks if the code is running in a browser environment:

```typescript
import { isBrowser } from '@/lib/getEnv';

if (isBrowser()) {
  // Browser-specific code
}
```

#### `isNode(): boolean`

Checks if the code is running in a Node.js environment:

```typescript
import { isNode } from '@/lib/getEnv';

if (isNode()) {
  // Node.js-specific code
}
```

#### `getEnvironmentConfig()`

Returns a complete environment configuration object:

```typescript
import { getEnvironmentConfig } from '@/lib/getEnv';

const config = getEnvironmentConfig();
// Returns: {
//   SUPABASE_URL: string,
//   SUPABASE_ANON_KEY: string,
//   NODE_ENV: string,
//   DEV: boolean,
//   PROD: boolean,
//   BROWSER: boolean,
//   NODE: boolean
// }
```

## Migration Guide

### Before (Inconsistent)

```typescript
// ❌ Mixed usage
const url = import.meta.env.VITE_SUPABASE_URL;
const isDev = process.env.NODE_ENV === 'development';
const isDev2 = import.meta.env.DEV;
```

### After (Unified)

```typescript
// ✅ Consistent usage
import { getEnvVar, isDevelopment } from '@/lib/getEnv';

const url = getEnvVar('VITE_SUPABASE_URL');
const isDev = isDevelopment();
```

## Files Updated

The following files have been updated to use the unified system:

### Core Configuration

- `src/lib/getEnv.ts` - Main unified system
- `src/config/devAuthConfig.ts` - Development auth config
- `src/config/inventoryConfig.ts` - Inventory configuration
- `src/constants/env.ts` - Environment constants

### Services

- `src/lib/supabase.ts` - Supabase client configuration
- `src/services/taskService.ts` - Task service

### Hooks

- `src/hooks/useHomeTasksManager.ts` - Home tasks management
- `src/pages/EnvironmentalClean/hooks/useEnvironmentalCleanRealtime.ts` - Real-time hooks

## Development Fallbacks

The system includes development fallbacks for critical environment variables:

```typescript
const devFallbacks: Record<string, string> = {
  VITE_SUPABASE_URL: 'https://uuesbvbuhhrupvdhnihy.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
};
```

These fallbacks are only used when:

1. The environment variable is not set
2. The application is running in development mode

## Best Practices

### 1. Always Import from getEnv.ts

```typescript
// ✅ Correct
import { getEnvVar, isDevelopment } from '@/lib/getEnv';

// ❌ Avoid
const url = import.meta.env.VITE_SUPABASE_URL;
const isDev = process.env.NODE_ENV === 'development';
```

### 2. Use Type-Safe Functions

```typescript
// ✅ Use provided functions
if (isDevelopment()) {
  console.log('Debug info');
}

// ❌ Don't check environment manually
if (process.env.NODE_ENV === 'development') {
  console.log('Debug info');
}
```

### 3. Handle Missing Variables Gracefully

```typescript
// ✅ Provide fallbacks for optional variables
const apiKey = getEnvVar('VITE_API_KEY') || 'default-key';

// ✅ Required variables should be explicitly set
const apiBaseUrl = getEnvVar('VITE_API_BASE_URL'); // No fallback - must be set

// ❌ Don't assume variables exist without checking
const apiKey = getEnvVar('VITE_API_KEY'); // Could be empty string
```

### 4. Required Environment Variables

The following environment variables are required and must be set:

- `VITE_API_BASE_URL` - API base URL (no localhost fallback)
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key

### 4. Use Environment-Specific Logic

```typescript
// ✅ Environment-aware code
if (isBrowser()) {
  // Browser-specific logic
} else if (isNode()) {
  // Node.js-specific logic
}
```

## Testing

The unified system works correctly in all environments:

- **Development**: Uses Vite's `import.meta.env` with fallbacks
- **Production**: Uses Vite's `import.meta.env` (build-time replacement)
- **Testing**: Falls back to `process.env` when Vite is not available
- **Server-side**: Uses `process.env` for Node.js environments

## Troubleshooting

### Environment Variable Not Found

1. Check if the variable is prefixed with `VITE_` for client-side access
2. Verify the variable is set in your `.env.local` file
3. Ensure the variable is included in your build configuration

### Different Behavior in Development vs Production

1. Use `isDevelopment()` and `isProduction()` for environment-specific logic
2. Avoid hardcoded environment checks
3. Test in both environments before deploying

### Build Errors

1. Ensure all environment variables are properly typed
2. Check that server-side code doesn't access client-only variables
3. Use `isBrowser()` and `isNode()` for environment-specific code

## Future Improvements

1. **Type Safety**: Add TypeScript types for all environment variables
2. **Validation**: Add runtime validation for required environment variables
3. **Caching**: Implement caching for frequently accessed environment variables
4. **Documentation**: Auto-generate environment variable documentation

## Related Files

- `src/lib/getEnv.ts` - Main implementation
- `src/config/` - Configuration files using the system
- `src/services/` - Services using environment variables
- `src/hooks/` - Hooks using environment variables
