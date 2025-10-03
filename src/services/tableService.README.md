# TableService

A generic, type-safe service for performing CRUD operations on any Supabase table. This service replaces the previous mock implementation with real Supabase database calls.

## Overview

The `TableService` provides a standardized interface for database operations across the Cliniio application. It supports both class-based and function-based usage patterns, maintaining backward compatibility while adding modern TypeScript features.

## Features

- ✅ **Generic CRUD Operations**: Works with any Supabase table
- ✅ **Type Safety**: Full TypeScript generics support
- ✅ **Facility Scoping**: Automatic `facility_id` filtering
- ✅ **Query Options**: Pagination, ordering, custom filters
- ✅ **Error Handling**: Consistent error response format
- ✅ **Backward Compatibility**: Legacy function exports maintained
- ✅ **Testing**: Comprehensive test coverage

## Installation

The service is already integrated into the project. Import it using:

```typescript
import { TableService } from '@/services/tableService';
// or for legacy compatibility
import {
  getAll,
  getById,
  insert,
  update,
  deleteById,
} from '@/services/tableService';
```

## Usage

### Class-based Usage (Recommended)

```typescript
import { TableService, FacilityRecord } from '@/services/tableService';

// Get all facilities
const facilities = await TableService.getAll<FacilityRecord>('facilities', {
  facilityId: 'your-facility-id',
  limit: 10,
  orderBy: 'name',
  orderDirection: 'asc',
});

// Get a specific facility
const facility = await TableService.getById<FacilityRecord>(
  'facilities',
  'facility-id'
);

// Create a new facility
const newFacility = await TableService.insert<FacilityRecord>('facilities', {
  name: 'New Facility',
  facility_code: 'NF001',
  is_active: true,
});

// Update a facility
const updatedFacility = await TableService.update<FacilityRecord>(
  'facilities',
  'facility-id',
  {
    name: 'Updated Facility Name',
  }
);

// Delete a facility
const deleted = await TableService.deleteById('facilities', 'facility-id');
```

### Legacy Function Usage

```typescript
import {
  getAll,
  getById,
  insert,
  update,
  deleteById,
} from '@/services/tableService';

// Same interface as before, but now with real Supabase calls
const facilities = await getAll('facilities');
const facility = await getById('facilities', 'facility-id');
const newFacility = await insert('facilities', { name: 'New Facility' });
const updatedFacility = await update('facilities', 'facility-id', {
  name: 'Updated',
});
const deleted = await deleteById('facilities', 'facility-id');
```

## API Reference

### TableService Class

#### `getAll<T>(tableName: string, options?: QueryOptions): Promise<TableServiceResponse<T[]>>`

Retrieves all records from a table with optional filtering and pagination.

**Parameters:**

- `tableName`: Name of the Supabase table
- `options`: Optional query configuration

**QueryOptions:**

```typescript
interface QueryOptions {
  facilityId?: string; // Filter by facility_id
  limit?: number; // Maximum number of records
  offset?: number; // Number of records to skip
  orderBy?: string; // Column to order by
  orderDirection?: 'asc' | 'desc'; // Sort direction
  filters?: Record<string, unknown>; // Custom filters
}
```

#### `getById<T>(tableName: string, id: string): Promise<TableServiceResponse<T>>`

Retrieves a single record by ID.

#### `insert<T>(tableName: string, data: Partial<T>): Promise<TableServiceResponse<T>>`

Creates a new record.

#### `update<T>(tableName: string, id: string, data: Partial<T>): Promise<TableServiceResponse<T>>`

Updates an existing record by ID.

#### `deleteById(tableName: string, id: string): Promise<TableServiceResponse<boolean>>`

Deletes a record by ID.

### Response Format

All methods return a consistent response format:

```typescript
interface TableServiceResponse<T> {
  data: T | T[] | null;
  error: string | null;
}
```

## Type Definitions

### Base Table Record

```typescript
interface BaseTableRecord {
  id: string;
  created_at: string;
  updated_at: string;
  facility_id?: string;
}
```

### Predefined Table Types

The service includes TypeScript interfaces for common tables:

- `FacilityRecord`: For facilities table
- `InventoryItemRecord`: For inventory_items table
- `UserRecord`: For users table

You can extend these or create your own:

```typescript
interface CustomRecord extends BaseTableRecord {
  custom_field: string;
  another_field: number;
}
```

## Error Handling

The service uses a consistent error handling pattern:

```typescript
const result = await TableService.getAll('facilities');

if (result.error) {
  console.error('Database error:', result.error);
  // Handle error appropriately
  return;
}

// Use result.data safely
const facilities = result.data || [];
```

## Testing

The service includes comprehensive test coverage:

- **Unit Tests**: Mock-based tests for all methods
- **Integration Tests**: Real Supabase database tests
- **Type Safety Tests**: TypeScript compilation validation

Run tests with:

```bash
npm test -- --testPathPattern=tableService
```

## Migration from Mock Service

The service maintains backward compatibility with the previous mock implementation. No code changes are required for existing usage.

### Before (Mock)

```typescript
const result = await getAll('facilities');
// Always returned { data: [], error: null }
```

### After (Real Implementation)

```typescript
const result = await getAll('facilities');
// Returns actual data from Supabase or descriptive error
```

## Performance Considerations

- **Caching**: Consider implementing caching for frequently accessed data
- **Pagination**: Use `limit` and `offset` for large datasets
- **Facility Filtering**: Always provide `facilityId` when available to improve performance
- **Error Handling**: Implement proper error boundaries in your components

## Security

- All operations respect Supabase Row Level Security (RLS) policies
- Facility-scoped queries automatically filter by `facility_id`
- Input validation should be performed at the application level

## Examples

See `src/services/tableService.example.ts` for comprehensive usage examples.

## Troubleshooting

### Common Issues

1. **Import Path Errors**: Ensure you're using the correct import path
2. **Type Errors**: Make sure to provide proper TypeScript generics
3. **Permission Errors**: Check Supabase RLS policies
4. **Network Errors**: Verify Supabase connection configuration

### Debug Mode

Enable debug logging by setting the environment variable:

```bash
DEBUG=tableService
```

## Contributing

When extending the service:

1. Maintain backward compatibility
2. Add comprehensive tests
3. Update TypeScript interfaces
4. Follow existing error handling patterns
5. Update this documentation

## Changelog

### v2.0.0 (Current)

- ✅ Replaced mock implementation with real Supabase calls
- ✅ Added comprehensive TypeScript support
- ✅ Implemented class-based architecture
- ✅ Added query options and filtering
- ✅ Maintained backward compatibility
- ✅ Added comprehensive test coverage
