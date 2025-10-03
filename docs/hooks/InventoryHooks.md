# Inventory Data Management Hook

## Overview

The `useInventoryDataManager` hook provides a centralized solution for all inventory data operations, loading states, error handling, and data transformations. It serves as the single source of truth for inventory data management.

## Features

- **Centralized Data Operations**: All CRUD operations go through one hook
- **Loading State Management**: Global and per-operation loading states
- **Error Handling & Recovery**: Comprehensive error handling with retry mechanisms
- **Data Transformations**: Built-in analytics and filtering capabilities
- **Backward Compatibility**: Maintains compatibility with existing patterns
- **Audit Logging**: Automatic logging of all data operations
- **Performance Optimized**: Memoized operations and efficient caching

## Quick Start

### Basic Usage

```tsx
import { useInventoryDataManagerContext } from '@/pages/Inventory/providers/InventoryDataManagerProvider';

const MyComponent = () => {
  const dataManager = useInventoryDataManagerContext();

  if (dataManager.isLoading) {
    return <div>Loading...</div>;
  }

  if (dataManager.error) {
    return <div>Error: {dataManager.error}</div>;
  }

  const analytics = dataManager.getAnalyticsData();

  return (
    <div>
      <h2>Total Items: {analytics.totalItems}</h2>
      <button onClick={dataManager.refreshData}>Refresh</button>
    </div>
  );
};
```

### Provider Setup

The data manager is automatically provided through the inventory providers:

```tsx
// Already set up in InventoryProviders.tsx
<InventoryDataManagerProvider>
  <InventoryDataProvider>
    <InventoryUIStateProvider>
      <InventoryActionsProvider>
        {/* Your components */}
      </InventoryActionsProvider>
    </InventoryUIStateProvider>
  </InventoryDataProvider>
</InventoryDataManagerProvider>
```

## API Reference

### State Properties

| Property              | Type                            | Description                |
| --------------------- | ------------------------------- | -------------------------- |
| `data`                | `InventoryDataResponse \| null` | Raw inventory data         |
| `isLoading`           | `boolean`                       | Global loading state       |
| `isRefreshing`        | `boolean`                       | Background refresh state   |
| `error`               | `string \| null`                | Current error message      |
| `lastUpdated`         | `Date \| null`                  | Last data update timestamp |
| `operationInProgress` | `{ type, itemId? }`             | Current operation status   |

### Data Operations

#### Fetching Data

```tsx
// Fetch data (called automatically on mount)
await dataManager.fetchData();

// Refresh data in background
await dataManager.refreshData();
```

#### CRUD Operations

```tsx
// Create new item
await dataManager.createItem({
  id: 'unique-id',
  item: 'New Item',
  category: 'Tools',
  quantity: 10,
  price: 25.99,
});

// Update existing item
await dataManager.updateItem('item-id', {
  quantity: 15,
  price: 29.99,
});

// Delete item
await dataManager.deleteItem('item-id');
```

#### Category Management

```tsx
// Add new category
await dataManager.addCategory('New Category');

// Delete category
await dataManager.deleteCategory('Old Category');
```

### Data Access Methods

#### Basic Access

```tsx
// Get all items across all categories
const allItems = dataManager.getAllItems();

// Get items by category
const tools = dataManager.getItemsByCategory('Tools');

// Get all categories
const categories = dataManager.getCategories();
```

#### Filtering and Search

```tsx
// Search items
const searchResults = dataManager.getFilteredItems('screwdriver');

// Search with filters
const filteredResults = dataManager.getFilteredItems('tool', {
  category: 'Tools',
  location: 'Storage A',
  status: 'Available',
});
```

#### Analytics

```tsx
const analytics = dataManager.getAnalyticsData();
// Returns:
// {
//   totalItems: number,
//   totalValue: number,
//   lowStockItems: number,
//   outOfStockItems: number,
//   categories: string[],
// }
```

### Error Handling

```tsx
// Clear current error
dataManager.clearError();

// Retry last failed operation
await dataManager.retryLastOperation();
```

### Legacy Compatibility

The hook provides backward compatibility with existing patterns:

```tsx
// Legacy data access
const { inventoryData, suppliesData, equipmentData, officeHardwareData } =
  dataManager;
```

## Specialized Hooks

For components that only need specific functionality:

### Data-Only Access

```tsx
import { useInventoryDataManagerData } from '@/pages/Inventory/providers/InventoryDataManagerProvider';

const DataComponent = () => {
  const { data, isLoading, error, lastUpdated } = useInventoryDataManagerData();
  // Only has data-related properties
};
```

### Operations-Only Access

```tsx
import { useInventoryDataManagerOperations } from '@/pages/Inventory/providers/InventoryDataManagerProvider';

const OperationsComponent = () => {
  const { createItem, updateItem, deleteItem, refreshData } =
    useInventoryDataManagerOperations();
  // Only has operation methods
};
```

### Data Access Methods Only

```tsx
import { useInventoryDataManagerAccess } from '@/pages/Inventory/providers/InventoryDataManagerProvider';

const AnalyticsComponent = () => {
  const { getAnalyticsData, getItemsByCategory } =
    useInventoryDataManagerAccess();
  // Only has data access methods
};
```

## Migration Guide

### From useInventoryDataManager (Legacy)

```tsx
// Old
const { getTools, getSupplies, addItem, updateItem } =
  useInventoryDataManager();

// New
const { getItemsByCategory, createItem, updateItem } =
  useInventoryDataManagerContext();
// OR use backward compatibility
const { backwardCompatible } = useInventoryDataManagerWrapper();
const { getTools, getSupplies, addItem, updateItem } = backwardCompatible;
```

### From useCentralizedInventoryData

```tsx
// Old
const { inventoryData, suppliesData, getFilteredData } =
  useCentralizedInventoryData();

// New
const { inventoryData, suppliesData, getFilteredItems } =
  useInventoryDataManagerContext();
// OR use backward compatibility
const { centralizedCompatible } = useInventoryDataManagerWrapper();
const { inventoryData, suppliesData, getFilteredData } = centralizedCompatible;
```

## Best Practices

### 1. Use Specialized Hooks When Possible

```tsx
// Good: Use specialized hook for data-only access
const { data, isLoading } = useInventoryDataManagerData();

// Avoid: Using full hook when you only need data
const dataManager = useInventoryDataManagerContext();
const { data, isLoading } = dataManager;
```

### 2. Handle Loading States

```tsx
const MyComponent = () => {
  const { isLoading, isRefreshing, error } = useInventoryDataManagerData();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {isRefreshing && <RefreshIndicator />}
      {/* Your content */}
    </div>
  );
};
```

### 3. Use Error Handling

```tsx
const MyComponent = () => {
  const { error, clearError, retryLastOperation } =
    useInventoryDataManagerOperations();

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={retryLastOperation}>Retry</button>
        <button onClick={clearError}>Dismiss</button>
      </div>
    );
  }
};
```

## Testing

The hook includes comprehensive tests. See `useInventoryDataManager.test.ts` for examples.

```tsx
import { renderHook, act, waitFor } from '@testing-library/react';
import { useInventoryDataManager } from './useInventoryDataManager';

test('should fetch data on mount', async () => {
  const { result } = renderHook(() => useInventoryDataManager());

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.data).toBeTruthy();
});
```

## Performance Considerations

- The hook automatically memoizes expensive operations
- Data fetching is debounced to prevent excessive API calls
- Background refresh doesn't block the UI
- Error states are cleared automatically after successful operations

## Troubleshooting

### Common Issues

1. **Hook not found error**: Ensure component is wrapped in `InventoryDataManagerProvider`
2. **Data not updating**: Check if `refreshData()` is called after mutations
3. **Loading state stuck**: Verify error handling in async operations
4. **Performance issues**: Use specialized hooks instead of full data manager

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
REACT_APP_INVENTORY_DEBUG=true
```

This will log all data operations to the console.

## Integration

These hooks integrate with the Redux store and provide a clean API for inventory operations throughout the application.
