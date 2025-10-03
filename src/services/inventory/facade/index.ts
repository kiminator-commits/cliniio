// Export business logic services (implementations)
export * from './adapters';

// Export data layer
export * from './repository';
export * from './cache';

// Export types (excluding service implementations to avoid conflicts)
export type {
  InventoryServiceFacade,
  InventoryItem,
  LocalInventoryItem,
  InventoryDataResponse,
  InventoryUpdateResponse,
  InventoryDeleteResponse,
  InventoryCreateResponse,
  InventorySingleResponse,
  InventoryFilters,
  InventoryBulkResponse,
  InventoryResponse,
  OperationResult,
  SearchOptions,
  FilterOptions,
  PaginationOptions,
  SortOptions,
  AdapterType,
  AdapterMetadata,
  CacheStats,
} from './types';

// Export class implementations directly
export { InventoryCacheManager } from './cache';
export { InventoryRepository } from './repository';
export { InventoryAdapterManager } from './adapters';
