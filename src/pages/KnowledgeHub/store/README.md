# Knowledge Hub Store Architecture

This directory contains the refactored store architecture for the Knowledge Hub, using both focused stores and the slice pattern for better maintainability and performance.

## Store Architecture Approaches

### 1. Slice Pattern (Recommended) 🎯

The slice pattern provides the best organization and modularity. Each slice is a self-contained unit that can be composed into larger stores.

#### Slice Structure

**`slices/` directory:**

- **`uiSlice.ts`** - UI State Management
  - `selectedCategory` - Currently selected content category
  - `validationError` - Validation error messages
  - Actions: `setSelectedCategory`, `setValidationError`, `clearValidationError`

- **`authSlice.ts`** - Authentication & Permissions
  - `currentUser` - Current authenticated user
  - `permissions` - User permissions based on role
  - Actions: `setCurrentUser`, permission checks (`canDeleteContent`, `canUpdateStatus`, etc.)

- **`contentSlice.ts`** - Content Data Management
  - `content` - All content items
  - `selectedContent` - Content filtered by selected category
  - `isLoading` - Loading state
  - `error` - Error state
  - `categoryCounts` - Count of items per category
  - Actions: `setContent`, `setLoading`, `setError`, `updateSelectedContent`

- **`performanceSlice.ts`** - Performance Monitoring
  - `performanceMonitor` - Performance metrics and statistics
  - `performanceAlerts` - Performance alerts and warnings
  - Actions: `recordPerformanceMetric`, `clearPerformanceMetrics`, `updatePerformanceStats`

- **`rateLimitSlice.ts`** - Rate Limiting
  - `rateLimitStats` - Current rate limiting statistics
  - `isRateLimited` - Whether the app is currently rate limited
  - Actions: `updateRateLimitStats`, `resetRateLimiter`, `setRateLimited`

- **`businessLogicSlice.ts`** - Business Logic Operations
  - Pure business logic operations without state management
  - Actions: `updateContentStatus`, `deleteContent`, `refetchContent`, `updateContent`, `initializeContent`

#### Slice Composition

- **`knowledgeHubStoreWithSlices.ts`** - Main store that combines all slices
  - Uses `StateCreator` pattern for clean composition
  - Provides all selector and action hooks
  - Maintains type safety across all slices

- **`useKnowledgeHubStoresWithSlices.ts`** - Enhanced orchestration hook
  - Coordinates between slices for complex operations
  - Handles cross-slice state synchronization
  - Provides the same API as the original monolithic store

### 2. Focused Stores (Legacy) 📚

Individual stores for each concern, maintained for backward compatibility.

#### Focused Store Structure

1. **`uiStore.ts`** - UI State Management
2. **`authStore.ts`** - Authentication & Permissions
3. **`contentStore.ts`** - Content Data Management
4. **`performanceStore.ts`** - Performance Monitoring
5. **`rateLimitStore.ts`** - Rate Limiting
6. **`businessLogicStore.ts`** - Business Logic Operations

#### Orchestration

- **`useKnowledgeHubStores.ts`** - Comprehensive hook that orchestrates all stores
  - Provides a unified interface for components that need multiple stores
  - Handles cross-store coordination and state synchronization
  - Maintains the same API as the original monolithic store

### 3. Original Monolithic Store (Legacy) 🏗️

- **`knowledgeHubStore.ts`** - Original 937-line monolithic store
  - Maintained for backward compatibility
  - Will be deprecated once migration is complete

## Usage

### Recommended: Slice Pattern 🎯

#### For Simple Components (Single Slice)

```typescript
import { useSelectedCategory, useSetSelectedCategory } from '../store';

const MyComponent = () => {
  const selectedCategory = useSelectedCategory();
  const setSelectedCategory = useSetSelectedCategory();

  // Component logic
};
```

#### For Complex Components (Multiple Slices)

```typescript
import { useKnowledgeHubStoresWithSlices } from '../store';

const MyComponent = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    content,
    isLoading,
    error,
    updateContentStatus,
    canUpdateStatus,
  } = useKnowledgeHubStoresWithSlices();

  // Component logic with full store access
};
```

#### For Performance-Critical Components

```typescript
import { useContent, useSetContent } from '../store';

const MyComponent = () => {
  // Only subscribe to the specific state you need
  const content = useContent();
  const setContent = useSetContent();

  // Component logic
};
```

#### Custom Store Composition

```typescript
import { create } from 'zustand';
import { createUISlice, createAuthSlice } from '../store';

// Create a custom store with only UI and Auth slices
const useCustomStore = create((...args) => ({
  ...createUISlice(...args),
  ...createAuthSlice(...args),
}));
```

### Legacy: Focused Stores 📚

#### For Simple Components (Single Store)

```typescript
import { useSelectedCategory, useSetSelectedCategory } from '../store';

const MyComponent = () => {
  const selectedCategory = useSelectedCategory();
  const setSelectedCategory = useSetSelectedCategory();

  // Component logic
};
```

#### For Complex Components (Multiple Stores)

```typescript
import { useKnowledgeHubStores } from '../store';

const MyComponent = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    content,
    isLoading,
    error,
    updateContentStatus,
    canUpdateStatus,
  } = useKnowledgeHubStores();

  // Component logic with full store access
};
```

## Migration Guide

### From Monolithic Store

The original `knowledgeHubStore.ts` is still available for backward compatibility. To migrate:

1. **Identify store usage**: Determine which parts of the store your component uses
2. **Choose approach**:
   - **Recommended**: Use slice pattern (`useKnowledgeHubStoresWithSlices`)
   - **Legacy**: Use focused stores (`useKnowledgeHubStores`)
   - **Simple cases**: Use individual slice hooks
3. **Update imports**: Replace `useKnowledgeHubStore` with appropriate hooks
4. **Test thoroughly**: Ensure all functionality works as expected

### Example Migration

**Before (Monolithic)**:

```typescript
import { useKnowledgeHubStore } from '../store';

const MyComponent = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    content,
    isLoading,
    updateContentStatus,
  } = useKnowledgeHubStore();
};
```

**After (Slice Pattern - Recommended)**:

```typescript
import { useKnowledgeHubStoresWithSlices } from '../store';

const MyComponent = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    content,
    isLoading,
    updateContentStatus,
  } = useKnowledgeHubStoresWithSlices();
};
```

**After (Focused Stores - Legacy)**:

```typescript
import { useKnowledgeHubStores } from '../store';

const MyComponent = () => {
  const {
    selectedCategory,
    setSelectedCategory,
    content,
    isLoading,
    updateContentStatus,
  } = useKnowledgeHubStores();
};
```

## Benefits

### Slice Pattern Benefits 🎯

1. **Better Organization**: Each slice is a self-contained unit with clear boundaries
2. **Modularity**: Slices can be composed and reused in different combinations
3. **Type Safety**: Full TypeScript support with proper type inference
4. **Testability**: Each slice can be tested in isolation
5. **Flexibility**: Easy to create custom store compositions
6. **Performance**: Components only re-render when their specific slice state changes
7. **Maintainability**: Clear separation of concerns and responsibilities

### Focused Stores Benefits 📚

1. **Better Performance**: Components only re-render when their specific state changes
2. **Improved Maintainability**: Each store has a single responsibility
3. **Easier Testing**: Individual stores can be tested in isolation
4. **Better Developer Experience**: Clear separation of concerns
5. **Scalability**: Easy to add new stores or modify existing ones

## Store Dependencies

### Slice Dependencies

- **UI Slice**: Independent
- **Auth Slice**: Independent
- **Content Slice**: Independent
- **Performance Slice**: Independent
- **Rate Limit Slice**: Depends on `DEPRECATED_MOCK_NOTICE` (legacy)
- **Business Logic Slice**: Depends on `DEPRECATED_MOCK_NOTICE`, `LearningProgressService`, error types

### Focused Store Dependencies

- **UI Store**: Independent
- **Auth Store**: Independent
- **Content Store**: Independent
- **Performance Store**: Independent
- **Rate Limit Store**: Depends on `DEPRECATED_MOCK_NOTICE` (legacy)
- **Business Logic Store**: Depends on `DEPRECATED_MOCK_NOTICE`, `LearningProgressService`, error types

## Error Handling

All stores use the same error handling patterns as the original store:

- Consistent error types (`KnowledgeHubError`, `ApiError`, etc.)
- Performance monitoring for all operations
- Rate limiting detection and handling
- Validation error management

## Performance Considerations

- Each store is optimized for its specific use case
- Selector hooks prevent unnecessary re-renders
- Performance monitoring is built into the orchestration layer
- Rate limiting is handled at the store level
