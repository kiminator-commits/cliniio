# Inventory Service Architecture Patterns

## Overview

This document defines the standardized architectural patterns for inventory services to ensure consistency and avoid over-engineering.

## Pattern Rules

### 1. Static Utilities (No State)

**Use for:** Pure operations that don't maintain state
**Examples:** CRUD operations, filtering, data transformation, error handling

```typescript
export class InventoryCrudOperations {
  static async getItems(
    filters?: InventoryFilters
  ): Promise<InventoryResponse> {
    // Pure operation, no state
  }
}
```

**Current Services:**

- ✅ `InventoryCrudOperations` - CRUD operations
- ✅ `InventoryFilterOperations` - Filtering logic
- ✅ `InventoryErrorOperations` - Error handling
- ✅ `InventoryDataTransformer` - Data transformation

### 2. Regular Instances (May Have State)

**Use for:** Business logic services that may maintain state
**Examples:** Core services, facades, business logic

```typescript
export class InventoryCoreService {
  private cacheManager: InventoryCacheManager;

  constructor() {
    this.cacheManager = new InventoryCacheManager();
  }
}
```

**Current Services:**

- ✅ `InventoryCoreService` - Business logic with caching
- ✅ `InventoryServiceFacade` - Facade with adapter state
- ✅ `InventoryServiceImpl` - Main service implementation

### 3. Singletons (Shared Resources)

**Use for:** Infrastructure services that manage shared resources
**Examples:** Database connections, connection pools, global state

```typescript
export class InventorySupabaseService {
  private static instance: InventorySupabaseService;
  private isConnected = false;

  private constructor() {}

  static getInstance(): InventorySupabaseService {
    if (!InventorySupabaseService.instance) {
      InventorySupabaseService.instance = new InventorySupabaseService();
    }
    return InventorySupabaseService.instance;
  }
}
```

**Current Services:**

- ✅ `InventorySupabaseService` - Database connection
- ✅ `InventoryLoadBalancer` - Connection pooling
- ✅ `InventoryErrorService` - Global error handling

## Guidelines

### When to Use Each Pattern

**Static Utilities:**

- Pure functions with no side effects
- No state to maintain
- Stateless operations
- Utility functions

**Regular Instances:**

- Business logic that may have state
- Services that need to be instantiated with different configs
- Services that may have multiple instances
- Testable business logic

**Singletons:**

- Shared resources (database connections)
- Global state management
- Connection pools
- Infrastructure services

### Migration Rules

1. **Don't change working patterns** - Only standardize new services
2. **Keep existing functionality** - No breaking changes
3. **Document the pattern** - Clear guidelines for developers
4. **Consistent naming** - Follow established conventions

## Benefits

- ✅ **Clear guidelines** for developers
- ✅ **Consistent patterns** across services
- ✅ **No over-engineering** - Simple, practical approach
- ✅ **Easy to understand** and maintain
- ✅ **Performance optimized** - Right tool for the job
