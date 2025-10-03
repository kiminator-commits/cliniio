# Inventory Filter System

This document describes the new modular and composable filter system for the inventory page.

## Overview

The inventory filter system has been refactored to provide:

- **Separation of concerns**: Filter logic is separated from UI components
- **Composability**: Filters can be combined and composed in various ways
- **Type safety**: Full TypeScript support with proper interfaces
- **Performance**: Optimized with memoization and debouncing
- **Maintainability**: Clear, testable, and reusable code

## Architecture

### Core Hooks

#### 1. `useInventoryFilters`

**Location**: `src/hooks/inventory/useInventoryFilters.ts`

Manages filter state and provides filter actions.

```typescript
const [filters, actions] = useInventoryFilters({
  initialFilters: { category: 'tools' },
  onFiltersChange: (filters) => console.log('Filters changed:', filters),
});

// Actions available:
actions.setSearchQuery('scalpel');
actions.setCategory('surgical');
actions.setLocation('OR1');
actions.toggleTrackedOnly();
actions.resetFilters();
```

#### 2. `useInventorySearch`

**Location**: `src/hooks/inventory/useInventorySearch.ts`

Handles search functionality with debouncing and abort controllers.

```typescript
const { searchResults, isSearching, totalResults, searchError } =
  useInventorySearch({
    data: inventoryData,
    filters,
    searchOptions: {
      debounceMs: 300,
      caseSensitive: false,
      searchFields: ['item', 'category', 'location'],
    },
  });
```

#### 3. `useInventorySorting`

**Location**: `src/hooks/inventory/useInventorySorting.ts`

Provides sorting functionality with support for multi-sort.

```typescript
const { sortedData, sortBy, isFieldSorted, getNextSortDirection } =
  useInventorySorting({
    data: filteredData,
    initialSort: { field: 'item', direction: 'asc' },
    sortOptions: { multiSort: false, caseSensitive: false },
  });
```

### Filter Utilities

#### `filterUtils.ts`

**Location**: `src/utils/inventory/filterUtils.ts`

Contains composable filter functions and business logic.

```typescript
// Create individual filters
const textFilter = createTextFilter('scalpel', ['item', 'category']);
const categoryFilter = createCategoryFilter('surgical');
const priceFilter = createPriceRangeFilter(10, 100);

// Compose filters
const combinedFilter = composeFilters(textFilter, categoryFilter, priceFilter);

// Tab-specific filter composers
const toolFilters = createToolFilters(filters, favorites);
const supplyFilters = createSupplyFilters(filters, favorites);
```

### Composition Hook

#### `useInventoryFilterComposition`

**Location**: `src/hooks/inventory/useInventoryFilterComposition.ts`

Combines all filter hooks into a single, easy-to-use interface.

```typescript
const { filters, finalData, filterStats, actions } =
  useInventoryFilterComposition({
    data: inventoryData,
    activeTab: 'tools',
    favorites: new Set(['tool1', 'tool2']),
    onDataChange: (data) => setDisplayData(data),
  });

// Use actions
actions.filterByCategory('surgical');
actions.sortBy('cost', 'desc');
actions.toggleTrackedOnly();
```

## Usage Examples

### Basic Usage

```typescript
import { useInventoryFilterComposition } from '@/hooks/inventory';

function InventoryTable({ data, activeTab }) {
  const {
    filters,
    finalData,
    filterStats,
    actions
  } = useInventoryFilterComposition({
    data,
    activeTab,
    onDataChange: (data) => {
      // Handle filtered data changes
    }
  });

  return (
    <div>
      <FilterControls filters={filters} actions={actions} />
      <DataTable data={finalData} onSort={actions.sortBy} />
      <FilterStats stats={filterStats} />
    </div>
  );
}
```

### Advanced Usage with Custom Filters

```typescript
import { useInventoryFilters, useInventorySearch, useInventorySorting } from '@/hooks/inventory';
import { createCustomFilter, composeFilters } from '@/utils/inventory/filterUtils';

function AdvancedInventoryTable({ data }) {
  const [filters, filterActions] = useInventoryFilters();

  // Create custom filter
  const customFilter = createCustomFilter((item) => {
    return item.cost > 50 && item.location === 'OR1';
  });

  // Compose with existing filters
  const combinedFilter = composeFilters(
    createTextFilter(filters.searchQuery, ['item']),
    customFilter
  );

  const filteredData = data.filter(combinedFilter);

  const { searchResults } = useInventorySearch({
    data: filteredData,
    filters
  });

  const { sortedData, sortBy } = useInventorySorting({
    data: searchResults
  });

  return <DataTable data={sortedData} onSort={sortBy} />;
}
```

## Filter Composition Patterns

### 1. Sequential Filtering

Filters are applied in sequence, each reducing the dataset.

```typescript
const sequentialFilter = composeFilters(
  createTextFilter(searchTerm, ['item']),
  createCategoryFilter(category),
  createLocationFilter(location)
);
```

### 2. Conditional Filtering

Apply filters based on conditions.

```typescript
const conditionalFilter = (item) => {
  if (showTrackedOnly) {
    return createTrackedOnlyFilter(true)(item);
  }
  return true;
};
```

### 3. Tab-Specific Filtering

Different filter sets for different inventory types.

```typescript
const getTabFilter = (activeTab, filters) => {
  switch (activeTab) {
    case 'tools':
      return createToolFilters(filters);
    case 'supplies':
      return createSupplyFilters(filters);
    case 'equipment':
      return createEquipmentFilters(filters);
    default:
      return createTextFilter(filters.searchQuery, ['item']);
  }
};
```

## Performance Considerations

1. **Memoization**: All hooks use `useMemo` and `useCallback` for optimal performance
2. **Debouncing**: Search operations are debounced to prevent excessive API calls
3. **Abort Controllers**: Search operations can be cancelled when new searches start
4. **Lazy Evaluation**: Filters are only applied when data or filters change

## Testing

Each hook and utility function can be tested independently:

```typescript
// Test filter utilities
describe('filterUtils', () => {
  it('should create text filter', () => {
    const filter = createTextFilter('test', ['item']);
    expect(filter({ item: 'test item' })).toBe(true);
    expect(filter({ item: 'other item' })).toBe(false);
  });
});

// Test hooks
describe('useInventoryFilters', () => {
  it('should update filters', () => {
    const { result } = renderHook(() => useInventoryFilters());
    act(() => {
      result.current[1].setCategory('tools');
    });
    expect(result.current[0].category).toBe('tools');
  });
});
```

## Migration Guide

### From Old Filter System

1. **Replace direct state management**:

   ```typescript
   // Old
   const [searchQuery, setSearchQuery] = useState('');
   const [categoryFilter, setCategoryFilter] = useState('');

   // New
   const [filters, actions] = useInventoryFilters();
   ```

2. **Replace filter logic**:

   ```typescript
   // Old
   const filteredData = data.filter(
     (item) =>
       item.name.includes(searchQuery) && item.category === categoryFilter
   );

   // New
   const { finalData } = useInventoryFilterComposition({ data, activeTab });
   ```

3. **Replace sorting logic**:

   ```typescript
   // Old
   const sortedData = [...data].sort((a, b) => a.name.localeCompare(b.name));

   // New
   const { sortedData, sortBy } = useInventorySorting({ data });
   ```

## Benefits

1. **Maintainability**: Clear separation of concerns makes code easier to maintain
2. **Reusability**: Filter logic can be reused across different components
3. **Testability**: Each piece can be tested independently
4. **Performance**: Optimized with proper memoization and debouncing
5. **Type Safety**: Full TypeScript support prevents runtime errors
6. **Flexibility**: Easy to add new filters or modify existing ones
