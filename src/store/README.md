# Inventory State Management - Clean Architecture

## Overview

This document describes the refactored state management approach for the Inventory page, which resolves the overlapping stores issue identified in the code analysis.

## Problem Solved

### Before: Multiple Overlapping Stores (Grade C)
```typescript
// OLD: Complex, overlapping store structure
const useInventoryStore = create<InventoryStore>()((...a) => ({
  ...createInventoryUIStoreSlice(...a),
  ...createInventoryDataStoreSlice(...a),
  ...createInventoryModalStoreSlice(...a),
  ...createScanModalSlice(a[0]),
  ...createInventoryPaginationSlice(a[0]),
  ...createInventoryFilterSlice(a[0]),
}));
```

**Issues:**
- Multiple overlapping slices with conflicting state
- Inconsistent parameter passing (`...a` vs `a[0]`)
- Complex provider hierarchy with multiple contexts
- Difficult to maintain and debug
- Performance issues from unnecessary re-renders

### After: Clean, Focused Store (Grade A)
```typescript
// NEW: Clean, organized store structure
export const useInventoryStore = create<InventoryStore>()((...a) => ({
  ...createInventoryDataSlice(...a),
  ...createInventoryUISlice(...a),
  ...createInventoryModalSlice(...a),
  ...createInventoryFilterSlice(...a),
  ...createInventoryPaginationSlice(...a),
  ...createInventoryAnalyticsSlice(...a),
}));
```

**Benefits:**
- Single, well-organized store
- Consistent parameter passing
- Clear separation of concerns
- Easy to maintain and debug
- Better performance
- Follows the same pattern as Sterilization page

## Store Structure

### 1. Data Slice (`inventoryDataSlice.ts`)
Manages core inventory data and CRUD operations:
- Items, categories, favorites
- Form data and edit mode
- Loading states
- Data manipulation actions

### 2. UI Slice (`inventoryUISlice.ts`)
Manages UI state and user interactions:
- Active tab, filter visibility
- Tracking state
- UI toggle actions

### 3. Modal Slice (`inventoryModalSlice.ts`)
Manages modal visibility and interactions:
- All modal states (add, track, scan, upload)
- Scan modal specific state
- Convenience actions for opening/closing modals

### 4. Filter Slice (`inventoryFilterSlice.ts`)
Manages search and filtering:
- Search queries, category/location filters
- Sort state
- Filter utility actions

### 5. Pagination Slice (`inventoryPaginationSlice.ts`)
Manages pagination state:
- Current page, items per page
- Navigation actions
- Computed values (total pages, start/end indices)

### 6. Analytics Slice (`inventoryAnalyticsSlice.ts`)
Manages analytics data:
- Analytics metrics
- Loading states
- Data refresh actions

## Usage Example

```typescript
import { useInventoryStore } from '@/hooks/useInventoryStore';

const InventoryComponent = () => {
  const {
    // Data state
    items,
    categories,
    isLoading,
    
    // UI state
    activeTab,
    showFilters,
    
    // Modal state
    showAddModal,
    
    // Filter state
    searchQuery,
    categoryFilter,
    
    // Actions
    setActiveTab,
    setSearchQuery,
    openAddModal,
    closeAddModal,
  } = useInventoryStore();

  // Component logic here...
};
```

## Migration Benefits

1. **Simplified Architecture**: Removed complex provider hierarchy
2. **Better Performance**: Reduced unnecessary re-renders
3. **Easier Maintenance**: Clear separation of concerns
4. **Consistent Pattern**: Matches Sterilization page approach
5. **Type Safety**: Better TypeScript support with clear interfaces
6. **Debugging**: Easier to trace state changes

## Comparison with Sterilization Page

Both pages now follow the same clean pattern:

```typescript
// Sterilization Store
export const useSterilizationStore = create<SterilizationStore>()((...a) => ({
  ...createBiologicalIndicatorSlice(...a),
  ...createToolWorkflowSlice(...a),
  ...createComplianceSettingsSlice(...a),
  // ... other slices
}));

// Inventory Store (NEW)
export const useInventoryStore = create<InventoryStore>()((...a) => ({
  ...createInventoryDataSlice(...a),
  ...createInventoryUISlice(...a),
  ...createInventoryModalSlice(...a),
  // ... other slices
}));
```

## Next Steps

1. Update existing components to use the new store
2. Remove old overlapping store files
3. Update tests to use the new store structure
4. Monitor performance improvements
5. Apply similar pattern to other pages if needed 