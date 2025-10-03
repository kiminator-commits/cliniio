# Error Boundary Standardization

## Overview

This project uses a **standardized error boundary approach** to ensure consistent error handling across the application.

## Implementation

### 1. Standard Error Boundary

- **File**: `src/components/ErrorBoundary/index.tsx`
- **Based on**: `react-error-boundary` library
- **Features**: Simple, consistent, no over-engineering

### 2. Error Reporting Service

- **File**: `src/services/errorReportingService.ts`
- **Purpose**: Centralized error reporting
- **Features**: Queue-based, batch processing, easy to extend

## Usage

### Basic Usage

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>;
```

### Custom Fallback

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

const CustomFallback = ({ error, resetErrorBoundary }) => (
  <div>Custom error UI</div>
);

<ErrorBoundary fallback={CustomFallback}>
  <YourComponent />
</ErrorBoundary>;
```

### With Error Handler

```tsx
<ErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error handling
    console.log('Custom error handler:', error);
  }}
>
  <YourComponent />
</ErrorBoundary>
```

## Guidelines

### ✅ Do

- Use the standard `ErrorBoundary` component
- Wrap major page sections or critical components
- Keep error boundaries simple and focused
- Use the error reporting service for logging

### ❌ Don't

- Create custom error boundary implementations
- Over-engineer error boundaries with complex state
- Build retry logic into error boundaries
- Use different error boundary libraries

## Migration

### From Custom Error Boundaries

Replace custom implementations with the standard `ErrorBoundary`:

```tsx
// Before
import { KnowledgeHubErrorBoundary } from './components/ErrorBoundaries/KnowledgeHubErrorBoundary';

// After
import ErrorBoundary from '@/components/ErrorBoundary';
```

### From react-error-boundary Direct Usage

Replace direct usage with the standard wrapper:

```tsx
// Before
import { ErrorBoundary } from 'react-error-boundary';

// After
import ErrorBoundary from '@/components/ErrorBoundary';
```

## Error Reporting

The error reporting service automatically:

- Queues errors for batch processing
- Logs errors in development
- Provides easy extension for external services (Sentry, LogRocket, etc.)

## Future Enhancements

When ready to implement external error reporting:

1. Update `ErrorReportingService.flushQueue()` method
2. Add configuration for external service
3. No changes needed to existing error boundaries
