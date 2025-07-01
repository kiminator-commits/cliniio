// Modal management hooks
export { useModalState } from './useModalState';
export { useInventoryModals } from './useInventoryModals';

// Existing inventory hooks
export { useInventoryAnalytics } from './useInventoryAnalytics';
export { useInventoryCRUD } from './useInventoryCRUD';
export { useInventoryDashboardContext } from './useInventoryDashboardContext';
export { useInventoryData } from './useInventoryData';
export { useInventoryFilters } from './useInventoryFilters';

export { useInventorySearch } from './useInventorySearch';
export { useInventorySorting } from './useInventorySorting';

// New filter composition hook
export { useInventoryFilterComposition } from './useInventoryFilterComposition';

// Page logic and context hooks
export { useInventoryPageLogic } from './useInventoryPageLogic';
export { useInventoryContext } from './useInventoryContext';

// Data hooks
export { useInventoryTableData } from './useInventoryTableData';

// Centralized data management hooks
export { useInventoryDataManager } from './useInventoryDataManager';
export {
  useInventoryDataManagerWrapper,
  useInventoryDataManagerLegacy,
  useCentralizedInventoryDataLegacy,
  useInventoryDataLegacy,
} from './useInventoryDataManagerWrapper';
export { useInventoryHeaderData } from './useInventoryHeaderData';
export { useInventoryTableSectionData } from './useInventoryTableSectionData';
export { useInventoryFooterData } from './useInventoryFooterData';
