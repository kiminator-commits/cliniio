# Inventory Data Management - Centralized Solution

## Overview

This document outlines the centralized data management solution implemented to address the scattered data fetching issues in the inventory page. The solution provides a single source of truth for all inventory data operations.

## Problem Statement

### Issues Identified

1. **Scattered Data Fetching**: Static data was imported directly in components
2. **Inconsistent Service Usage**: Service layer existed but wasn't fully utilized
3. **No Centralized Management**: Multiple components were managing their own data state
4. **Poor Error Handling**: No consistent error handling across data operations
5. **No Caching**: Data was fetched repeatedly without caching

### Impact

- Code duplication across components
- Inconsistent data state management
- Poor performance due to repeated data fetching
- Difficult to maintain and debug
- No centralized error handling

## Solution Architecture

### 1. Centralized Data Service (`inventoryDataService.ts`)

The `InventoryDataService` provides a single interface for all inventory data operations:

```typescript
interface InventoryDataService {
  // Core data fetching methods
  fetchAllInventoryData(): Promise<InventoryDataResponse>;
  fetchInventoryItems(): Promise<InventoryItem[]>;
  fetchCategories(): Promise<string[]>;

  // CRUD operations
  addInventoryItem(item: InventoryItem): Promise<InventoryItem>;
  updateInventoryItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem>;
  deleteInventoryItem(id: string): Promise<void>;
  addCategory(category: string): Promise<string>;
  deleteCategory(category: string): Promise<void>;

  // Data transformation and filtering
  getFilteredData(
    data: LocalInventoryItem[],
    searchQuery: string,
    filters?: any
  ): LocalInventoryItem[];
  transformDataForModal(items: LocalInventoryItem[]): any[];

  // Cache management
  clearCache(): void;
  refreshData(): Promise<InventoryDataResponse>;
}
```

#### Key Features

- **Caching**: 5-minute TTL cache to reduce API calls
- **Error Handling**: Graceful fallback to static data on errors
- **Data Transformation**: Consistent data transformation across the app
- **Filtering**: Centralized filtering logic
- **CRUD Operations**: Complete CRUD operations with cache invalidation

### 2. Data Manager Hook (`useInventoryDataManager.ts`)

The `useInventoryDataManager` hook provides React components with a clean interface to the data service:

```typescript
interface UseInventoryDataManagerReturn {
  // Data state
  data: InventoryDataResponse | null;
  isLoading: boolean;
  error: string | null;

  // Data access methods
  getTools: () => LocalInventoryItem[];
  getSupplies: () => LocalInventoryItem[];
  getEquipment: () => LocalInventoryItem[];
  getOfficeHardware: () => LocalInventoryItem[];
  getCategories: () => string[];

  // Filtered data methods
  getFilteredTools: (searchQuery: string, filters?: any) => LocalInventoryItem[];
  getFilteredSupplies: (searchQuery: string, filters?: any) => LocalInventoryItem[];
  getFilteredEquipment: (searchQuery: string, filters?: any) => LocalInventoryItem[];
  getFilteredOfficeHardware: (searchQuery: string, filters?: any) => LocalInventoryItem[];

  // CRUD operations
  addItem: (item: InventoryItem) => Promise<void>;
  updateItem: (id: string, item: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  addCategory: (category: string) => Promise<void>;
  deleteCategory: (category: string) => Promise<void>;

  // Data management
  refreshData: () => Promise<void>;
  clearError: () => void;

  // Modal data transformation
  getModalData: () => any[];
}
```

#### Key Features

- **Loading States**: Automatic loading state management
- **Error Handling**: Centralized error handling with user-friendly messages
- **Data Refresh**: Automatic data refresh after CRUD operations
- **Type Safety**: Full TypeScript support with proper typing

## Implementation Details

### Data Flow

1. **Component Initialization**: Component calls `useInventoryDataManager()`
2. **Data Fetching**: Hook automatically fetches data on mount
3. **Caching**: Data is cached for 5 minutes to reduce API calls
4. **Error Handling**: Graceful fallback to static data on errors
5. **State Updates**: Components receive updated data through hook

### Cache Strategy

```typescript
private cache: {
  data: InventoryDataResponse | null;
  timestamp: number;
  ttl: number;
} = {
  data: null,
  timestamp: 0,
  ttl: 5 * 60 * 1000, // 5 minutes
};
```

- **TTL**: 5-minute cache lifetime
- **Invalidation**: Cache cleared after CRUD operations
- **Fallback**: Static data used when cache is invalid or errors occur

### Error Handling

```typescript
try {
  const response = await inventoryDataService.fetchAllInventoryData();
  setData(response);
  setError(response.error);
} catch (err) {
  const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory data';
  setError(errorMessage);

  // Return cached data if available, otherwise return static data
  if (this.cache.data) {
    return { ...this.cache.data, error: this.error };
  }
}
```

## Migration Guide

### Before (Scattered Data Fetching)

```typescript
// Component directly importing static data
import { inventoryData } from '@/utils/Inventory/inventoryData';

const Component = () => {
  const filteredData = useMemo(() => {
    return inventoryData.map(item => ({
      id: item.toolId || '',
      name: item.item || '',
      // ... more transformations
    }));
  }, []);

  return <div>{/* component JSX */}</div>;
};
```

### After (Centralized Data Management)

```typescript
// Component using centralized data manager
import { useInventoryDataManager } from '@/hooks/useInventoryDataManager';

const Component = () => {
  const { getTools, getFilteredTools, isLoading, error } = useInventoryDataManager();

  const filteredData = useMemo(() => {
    return getFilteredTools(searchQuery, filters);
  }, [getFilteredTools, searchQuery, filters]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{/* component JSX */}</div>;
};
```

## Benefits

### 1. **Consistency**

- Single source of truth for all inventory data
- Consistent data transformation across components
- Uniform error handling

### 2. **Performance**

- Caching reduces API calls
- Automatic data refresh after operations
- Optimized re-renders with proper memoization

### 3. **Maintainability**

- Centralized data logic
- Easy to add new data sources
- Simplified testing and debugging

### 4. **User Experience**

- Loading states for better UX
- Error handling with fallback data
- Consistent data across all components

### 5. **Developer Experience**

- Type-safe data access
- Clear separation of concerns
- Easy to extend and modify

## Usage Examples

### Basic Data Access

```typescript
const { getTools, getSupplies, isLoading } = useInventoryDataManager();

const tools = getTools();
const supplies = getSupplies();
```

### Filtered Data

```typescript
const { getFilteredTools } = useInventoryDataManager();

const filteredTools = getFilteredTools('scalpel', { category: 'Surgical' });
```

### CRUD Operations

```typescript
const { addItem, updateItem, deleteItem } = useInventoryDataManager();

// Add new item
await addItem({
  name: 'New Tool',
  category: 'Surgical',
  location: 'OR 1',
});

// Update item
await updateItem('tool-123', { location: 'OR 2' });

// Delete item
await deleteItem('tool-123');
```

### Error Handling

```typescript
const { error, clearError, refreshData } = useInventoryDataManager();

if (error) {
  return (
    <div>
      <p>Error: {error}</p>
      <button onClick={clearError}>Clear Error</button>
      <button onClick={refreshData}>Retry</button>
    </div>
  );
}
```

## Testing

### Service Testing

```typescript
describe('inventoryDataService', () => {
  it('should fetch all inventory data', async () => {
    const data = await inventoryDataService.fetchAllInventoryData();
    expect(data.tools).toBeDefined();
    expect(data.supplies).toBeDefined();
    expect(data.equipment).toBeDefined();
    expect(data.officeHardware).toBeDefined();
  });
});
```

### Hook Testing

```typescript
describe('useInventoryDataManager', () => {
  it('should provide data access methods', () => {
    const { getTools, getSupplies } = useInventoryDataManager();
    expect(getTools).toBeDefined();
    expect(getSupplies).toBeDefined();
  });
});
```

## Future Enhancements

### 1. **Real-time Updates**

- WebSocket integration for real-time data updates
- Optimistic updates for better UX

### 2. **Advanced Caching**

- Redis integration for distributed caching
- Cache warming strategies

### 3. **Data Synchronization**

- Offline support with local storage
- Conflict resolution for concurrent updates

### 4. **Performance Monitoring**

- Data fetching metrics
- Cache hit/miss ratios
- Performance alerts

## Conclusion

The centralized data management solution successfully addresses the scattered data fetching issues by providing:

- **Single Source of Truth**: All data operations go through one service
- **Consistent Interface**: Uniform API across all components
- **Better Performance**: Caching and optimized data flow
- **Improved Maintainability**: Centralized logic and error handling
- **Enhanced Developer Experience**: Type-safe, easy-to-use hooks

This solution provides a solid foundation for future enhancements while maintaining backward compatibility with existing components.
