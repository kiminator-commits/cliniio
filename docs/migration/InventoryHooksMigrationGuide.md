# Inventory Hooks Migration Guide

## Overview

This guide helps you migrate from the deprecated large hooks to the new focused hooks. The migration improves code maintainability, testability, and separation of concerns.

## Migration Status

### ✅ Phase 1: Complete

- All focused hooks created
- Backward compatibility maintained
- Deprecation warnings added

### 🔄 Phase 2: In Progress

- Component refactoring (this guide)
- Gradual migration of existing components

### 🔄 Phase 3: Planned

- Complete removal of deprecated hooks

## Quick Migration Examples

### Before (Deprecated)

```typescript
import { useInventoryDataManager } from '@/hooks/inventory/useInventoryDataManager';

const MyComponent = () => {
  const {
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    getItemsByCategory,
    getAnalyticsData,
    isLoading,
    error,
  } = useInventoryDataManager();

  // Component logic...
};
```

### After (Recommended)

```typescript
import { useInventoryDataFetching } from '@/hooks/inventory/useInventoryDataFetching';
import { useInventoryCreate } from '@/hooks/inventory/useInventoryCreate';
import { useInventoryUpdate } from '@/hooks/inventory/useInventoryUpdate';
import { useInventoryDelete } from '@/hooks/inventory/useInventoryDelete';
import { useInventoryDataAccess } from '@/hooks/inventory/useInventoryDataAccess';
import { useInventoryMetrics } from '@/hooks/inventory/useInventoryMetrics';
import { useInventoryUIState } from '@/hooks/inventory/useInventoryUIState';

const MyComponent = () => {
  // Data operations
  const { fetchData } = useInventoryDataFetching();
  const { createItem } = useInventoryCreate();
  const { updateItem } = useInventoryUpdate();
  const { deleteItem } = useInventoryDelete();
  const { getItemsByCategory } = useInventoryDataAccess();
  const { getAnalyticsData } = useInventoryMetrics();

  // UI state
  const { isLoading, error } = useInventoryUIState();

  // Component logic...
};
```

## Detailed Migration by Hook Type

### 1. Data Manager Hook Migration

#### `useInventoryDataManager` → Focused Hooks

**Before:**

```typescript
const {
  // Data fetching
  fetchData,
  refreshData,

  // CRUD operations
  createItem,
  updateItem,
  deleteItem,

  // Category management
  addCategory,
  deleteCategory,

  // Data access
  getItemsByCategory,
  getFilteredItems,
  getAllItems,
  getCategories,

  // Analytics
  getAnalyticsData,

  // Error handling
  resetError,
  retryLastOperation,

  // State
  isLoading,
  error,
  data,
} = useInventoryDataManager();
```

**After:**

```typescript
// Data fetching
const { fetchData, refreshData } = useInventoryDataFetching();

// CRUD operations
const { createItem } = useInventoryCreate();
const { updateItem } = useInventoryUpdate();
const { deleteItem } = useInventoryDelete();

// Category management
const { addCategory, deleteCategory } = useInventoryCategoryManagement();

// Data access
const { getItemsByCategory, getFilteredItems, getAllItems, getCategories } =
  useInventoryDataAccess();

// Analytics
const { getAnalyticsData } = useInventoryMetrics();

// Error handling
const { resetError, retryLastOperation } = useInventoryErrorHandling();

// UI state
const { isLoading, error } = useInventoryUIState();
```

### 2. Analytics Operations Hook Migration

#### `useInventoryAnalyticsOperations` → Focused Hooks

**Before:**

```typescript
const {
  // Basic metrics
  getTotalItems,
  getTotalValue,
  getAveragePrice,
  getLowStockItems,

  // Charts
  getCategoryDistribution,
  getStatusDistribution,
  getTimeBasedAnalytics,

  // Reports
  generateReport,
  exportAnalytics,

  // Stock alerts
  getStockLevelAlerts,

  // Location analytics
  getLocationDistribution,
  getItemsByLocation,
} = useInventoryAnalyticsOperations();
```

**After:**

```typescript
// Basic metrics
const { getTotalItems, getTotalValue, getAveragePrice, getLowStockItems } =
  useInventoryMetrics();

// Charts
const {
  getCategoryDistribution,
  getStatusDistribution,
  getTimeBasedAnalytics,
} = useInventoryCharts();

// Reports
const { generateReport, exportAnalytics } = useInventoryReports();

// Stock alerts
const { getStockLevelAlerts } = useInventoryStockAlerts();

// Location analytics
const { getLocationDistribution, getItemsByLocation } =
  useInventoryLocationAnalytics();
```

### 3. CRUD Operations Hook Migration

#### `useInventoryCRUD` → Focused Hooks

**Before:**

```typescript
const {
  // Create operations
  createItem,
  createBulkItems,

  // Read operations
  getItem,
  getItems,
  getItemsByCategory,
  getItemsByStatus,

  // Update operations
  updateItem,
  updateBulkItems,
  updateItemStatus,

  // Delete operations
  deleteItem,
  deleteBulkItems,
  softDeleteItem,

  // Utility operations
  duplicateItem,
  archiveItem,
  restoreItem,

  // State
  isLoading,
  error,
  lastOperation,
} = useInventoryCRUD();
```

**After:**

```typescript
// Create operations
const { createItem, createBulkItems } = useInventoryCreate();

// Read operations
const { getItem, getItems, getItemsByCategory, getItemsByStatus } =
  useInventoryRead();

// Update operations
const { updateItem, updateBulkItems, updateItemStatus } = useInventoryUpdate();

// Delete operations
const { deleteItem, deleteBulkItems, softDeleteItem } = useInventoryDelete();

// Bulk operations
const { duplicateItem, archiveItem, restoreItem } =
  useInventoryBulkOperations();

// UI state
const { isLoading, error, lastOperation } = useInventoryUIState();
```

## Component Migration Examples

### Example 1: Inventory Table Component

**Before:**

```typescript
const InventoryTable = () => {
  const {
    inventoryData,
    isLoading,
    error,
    fetchData,
    updateItem,
    deleteItem,
    getItemsByCategory,
  } = useInventoryDataManager();

  const handleUpdate = async (id: string, updates: Partial<InventoryItem>) => {
    await updateItem(id, updates);
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
  };

  // Component JSX...
};
```

**After:**

```typescript
const InventoryTable = () => {
  // Data access
  const { inventoryData } = useInventoryDataAccess();

  // Operations
  const { fetchData } = useInventoryDataFetching();
  const { updateItem } = useInventoryUpdate();
  const { deleteItem } = useInventoryDelete();

  // UI state
  const { isLoading, error } = useInventoryUIState();

  const handleUpdate = async (id: string, updates: Partial<InventoryItem>) => {
    await updateItem(id, updates);
  };

  const handleDelete = async (id: string) => {
    await deleteItem(id);
  };

  // Component JSX...
};
```

### Example 2: Analytics Dashboard Component

**Before:**

```typescript
const AnalyticsDashboard = () => {
  const {
    getTotalItems,
    getCategoryDistribution,
    getStockLevelAlerts,
    generateReport,
    isLoading,
    error,
  } = useInventoryAnalyticsOperations();

  const handleExport = async () => {
    const report = await generateReport({ includeCharts: true });
    // Handle download...
  };

  // Component JSX...
};
```

**After:**

```typescript
const AnalyticsDashboard = () => {
  // Metrics
  const { getTotalItems } = useInventoryMetrics();

  // Charts
  const { getCategoryDistribution } = useInventoryCharts();

  // Alerts
  const { getStockLevelAlerts } = useInventoryStockAlerts();

  // Reports
  const { generateReport } = useInventoryReports();

  // UI state
  const { isLoading, error } = useInventoryUIState();

  const handleExport = async () => {
    const report = await generateReport({ includeCharts: true });
    // Handle download...
  };

  // Component JSX...
};
```

## Migration Checklist

### For Each Component:

1. **Identify used functionality**
   - List all methods and properties from the deprecated hook
   - Categorize by functionality (CRUD, analytics, UI state, etc.)

2. **Import focused hooks**
   - Import only the hooks you need
   - Use destructuring to get specific methods

3. **Update method calls**
   - Replace deprecated hook calls with focused hook calls
   - Ensure method signatures match

4. **Test functionality**
   - Verify all features still work
   - Check error handling
   - Test loading states

5. **Remove deprecated imports**
   - Remove the old hook import
   - Clean up unused imports

### Common Patterns:

#### State Management

```typescript
// Before
const { isLoading, error, data } = useInventoryDataManager();

// After
const { isLoading, error } = useInventoryUIState();
const { data } = useInventoryDataAccess();
```

#### CRUD Operations

```typescript
// Before
const { createItem, updateItem, deleteItem } = useInventoryDataManager();

// After
const { createItem } = useInventoryCreate();
const { updateItem } = useInventoryUpdate();
const { deleteItem } = useInventoryDelete();
```

#### Analytics

```typescript
// Before
const { getTotalItems, getCategoryDistribution } =
  useInventoryAnalyticsOperations();

// After
const { getTotalItems } = useInventoryMetrics();
const { getCategoryDistribution } = useInventoryCharts();
```

## Benefits of Migration

### 1. **Better Performance**

- Only load the functionality you need
- Smaller bundle size
- Reduced re-renders

### 2. **Improved Testability**

- Test individual functionality in isolation
- Mock specific hooks instead of large ones
- Easier to write focused unit tests

### 3. **Enhanced Maintainability**

- Clear separation of concerns
- Easier to find and fix bugs
- Simpler to add new features

### 4. **Better Developer Experience**

- IntelliSense shows only relevant methods
- Clearer API surface
- Easier to understand component dependencies

## Troubleshooting

### Common Issues:

1. **Method not found**
   - Check if you're importing the correct focused hook
   - Verify the method exists in the focused hook

2. **State not updating**
   - Ensure you're using the correct UI state hook
   - Check if operations are properly connected to state

3. **Performance issues**
   - Make sure you're not importing unnecessary hooks
   - Use React.memo for components that don't need frequent updates

### Getting Help:

- Check the individual hook documentation
- Review the test files for usage examples
- Look at the refactored components in the codebase

## Next Steps

1. **Start with simple components** - Begin migration with components that use few methods
2. **Migrate incrementally** - Don't try to migrate everything at once
3. **Test thoroughly** - Ensure functionality works after each migration
4. **Update tests** - Modify test files to use focused hooks
5. **Document changes** - Update component documentation

## Timeline

- **Week 1-2**: Migrate simple components (read-only, basic CRUD)
- **Week 3-4**: Migrate complex components (analytics, bulk operations)
- **Week 5-6**: Update tests and documentation
- **Week 7-8**: Final cleanup and removal of deprecated hooks

Remember: The deprecated hooks will continue to work during migration, so you can migrate at your own pace without breaking existing functionality.
