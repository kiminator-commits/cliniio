// Re-export InventoryServiceFacade from the main services directory
export {
  InventoryServiceFacade,
  inventoryServiceFacade,
  InventoryServiceFacadeImpl,
} from '@/services/inventory/InventoryServiceFacade';

// Re-export related types
export type {
  InventoryResponse,
  FilterOptions,
  SearchOptions,
  PaginationOptions,
  SortOptions,
  OperationResult,
  DeleteItemOptions,
  CacheStats,
  AdapterType,
  AdapterMetadata,
  InventoryErrorCode,
} from '@/services/inventory/InventoryServiceFacade';
