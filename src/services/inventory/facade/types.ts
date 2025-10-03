import {
  InventoryItem,
  LocalInventoryItem,
} from '../../../types/inventoryTypes';
import {
  InventoryServiceFacade as IInventoryServiceFacade,
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
} from '../../../types/inventoryServiceTypes';

// Import the actual class implementations
import { InventoryCacheManager } from './cache';
import { InventoryRepository } from './repository';
import { InventoryAdapterManager } from './adapters';

// Export the main facade interface
export type InventoryServiceFacade = IInventoryServiceFacade;

// Export business logic service interfaces (these are implemented in adapters.ts)
// export type InventoryCategoryService = IInventoryCategoryService;
// export type InventoryFilterService = IInventoryFilterService;
// export type InventoryStatusService = IInventoryStatusService;

// Export inventory types
export type { InventoryItem, LocalInventoryItem };

// Export response types
export type {
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
  InventoryCacheManager,
  InventoryRepository,
  InventoryAdapterManager,
};
