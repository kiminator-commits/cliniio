# Separation of Concerns in Inventory Hooks

## Overview

This document outlines the refactoring of inventory hooks to properly separate data operations from UI state management, addressing the mixed concerns issue identified in the code review.

## Problem Statement

The original inventory hooks had mixed concerns where data fetching and UI state management were combined in single hooks, making them:

- Hard to test in isolation
- Difficult to reuse for different UI patterns
- Complex to maintain and debug
- Tightly coupled to specific UI implementations

## Solution: Separation of Concerns

### 1. Pure Data Operations Hooks

These hooks handle only data operations without any UI state:

#### `useInventoryDataOperations`

- **Purpose**: Pure CRUD operations and data transformations
- **Responsibilities**:
  - Create, read, update, delete inventory items
  - Data validation and business logic
  - Data transformations and analytics calculations
  - Audit logging
- **No UI State**: No loading states, error states, or UI interactions

#### `useInventoryAnalyticsOperations`

- **Purpose**: Pure analytics calculations and data processing
- **Responsibilities**:
  - Statistical calculations (totals, averages, distributions)
  - Chart data generation
  - Report generation
  - Data filtering and aggregation
- **No UI State**: No time range selection, loading states, or UI interactions

#### `useInventorySearchOperations`

- **Purpose**: Pure search logic and filtering
- **Responsibilities**:
  - Text search algorithms
  - Filter application
  - Sorting logic
  - Search suggestions
  - Search statistics
- **No UI State**: No debouncing, loading states, or UI interactions

### 2. Pure UI State Management Hooks

These hooks handle only UI state without any data operations:

#### `useInventoryUIState`

- **Purpose**: Pure UI state management
- **Responsibilities**:
  - Loading states (global, per-operation, refreshing)
  - Error states and error handling
  - Operation tracking and timestamps
  - Search state (term, results, timestamps)
  - Analytics state (time range, selected metrics)
  - Abort controller management
- **No Data Operations**: No API calls, data transformations, or business logic

### 3. Combined Hooks (Refactored)

These hooks combine the separated concerns for easy consumption:

#### `useInventoryAnalyticsRefactored`

- Combines `useInventoryAnalyticsOperations` + `useInventoryUIState`
- Provides analytics operations with UI state management
- Maintains the same API as the original hook

#### `useInventoryCRUDRefactored`

- Combines `useInventoryDataOperations` + `useInventoryUIState`
- Provides CRUD operations with loading/error state management
- Maintains the same API as the original hook

#### `useInventorySearchRefactored`

- Combines `useInventorySearchOperations` + `useInventoryUIState`
- Provides search operations with debouncing and UI state
- Maintains the same API as the original hook

## Benefits of This Approach

### 1. Testability

```typescript
// Test data operations in isolation
const { createItem, getItems } = useInventoryDataOperations();
// No need to mock UI state

// Test UI state in isolation
const { setLoading, setError } = useInventoryUIState();
// No need to mock data operations
```

### 2. Reusability

```typescript
// Use data operations in different UI contexts
const dataOps = useInventoryDataOperations();
const analyticsOps = useInventoryAnalyticsOperations();

// Use UI state in different contexts
const uiState = useInventoryUIState();
```

### 3. Maintainability

- Clear separation of responsibilities
- Easier to debug issues (data vs UI)
- Simpler to add new features
- Better code organization

### 4. Flexibility

- Mix and match data operations with different UI patterns
- Use pure operations for background processing
- Use UI state for different UI implementations

## Migration Guide

### For Components Using Original Hooks

1. **Replace with refactored hooks** (easiest):

```typescript
// Before
import { useInventoryAnalytics } from './hooks/inventory';

// After
import { useInventoryAnalyticsRefactored } from './hooks/inventory';
// API remains the same
```

2. **Use separated hooks** (more control):

```typescript
// Before
const { getTotalItems, isLoading, error } = useInventoryAnalytics();

// After
const analyticsOps = useInventoryAnalyticsOperations();
const uiState = useInventoryUIState();

const totalItems = analyticsOps.getTotalItems();
const isLoading = uiState.isLoading;
const error = uiState.error;
```

### For New Components

Use the separated hooks for maximum flexibility:

```typescript
// Data operations only
const { getItems, createItem } = useInventoryDataOperations();

// UI state only
const { setLoading, setError } = useInventoryUIState();

// Combine as needed
const handleCreateItem = async (itemData) => {
  setLoading(true);
  try {
    await createItem(itemData);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
```

## Best Practices

### 1. Use Pure Operations for Background Tasks

```typescript
// Good: Pure operations for background processing
const analyticsOps = useInventoryAnalyticsOperations();
const report = await analyticsOps.generateReport(options);

// Avoid: UI state in background tasks
const analytics = useInventoryAnalyticsRefactored();
const report = await analytics.generateReport(options); // Includes unnecessary UI state
```

### 2. Use UI State for User Interactions

```typescript
// Good: UI state for user interactions
const uiState = useInventoryUIState();
const handleSearch = (term) => {
  uiState.setSearching(true);
  // ... perform search
  uiState.setSearching(false);
};
```

### 3. Combine Only When Needed

```typescript
// Good: Use refactored hooks when you need both
const { getTotalItems, isLoading, setLoading } =
  useInventoryAnalyticsRefactored();

// Better: Use separated hooks for more control
const analyticsOps = useInventoryAnalyticsOperations();
const uiState = useInventoryUIState();
```

## File Structure

```
src/hooks/inventory/
├── useInventoryDataOperations.ts          # Pure data operations
├── useInventoryUIState.ts                 # Pure UI state management
├── useInventoryAnalyticsOperations.ts     # Pure analytics operations
├── useInventorySearchOperations.ts        # Pure search operations
├── useInventoryAnalyticsRefactored.ts     # Combined analytics
├── useInventoryCRUDRefactored.ts          # Combined CRUD
├── useInventorySearchRefactored.ts        # Combined search
├── SEPARATION_OF_CONCERNS.md              # This documentation
└── index.ts                               # Exports
```

## Future Considerations

1. **Context Providers**: Consider creating context providers for the separated hooks
2. **Custom Hooks**: Create domain-specific hooks that combine operations and state
3. **Testing**: Add comprehensive tests for both pure operations and UI state
4. **Performance**: Monitor performance impact of the separation
5. **Documentation**: Keep this documentation updated as patterns evolve

## Conclusion

This separation of concerns approach provides a clean, maintainable, and flexible architecture for inventory hooks. It addresses the mixed concerns issue while maintaining backward compatibility through refactored hooks that combine the separated concerns.
