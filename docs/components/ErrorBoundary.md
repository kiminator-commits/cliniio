# Error Boundary Component

## Overview

The ErrorBoundary component provides React error boundary functionality with enhanced error detection and user-friendly error messages.

## Basic Usage

```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary componentName="MyComponent">
  <MyComponent />
</ErrorBoundary>;
```

## Props

| Prop            | Type      | Description                            |
| --------------- | --------- | -------------------------------------- |
| `componentName` | string    | Name of the component being wrapped    |
| `onError`       | function  | Optional error callback                |
| `children`      | ReactNode | Components to wrap with error boundary |

## Integration

The ErrorBoundary is currently implemented at the App level and can be used to wrap individual components or pages that may encounter errors.

## Error Handling

- Catches JavaScript errors in component trees
- Provides user-friendly error messages
- Logs errors for debugging
- Allows for graceful error recovery
