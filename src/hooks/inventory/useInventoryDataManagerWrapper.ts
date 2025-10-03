import { useInventoryDataManager } from './useInventoryDataManager';
import { useCentralizedInventoryData } from '../useCentralizedInventoryData';

/**
 * Wrapper hook for inventory data manager
 * Provides the same interface as useInventoryDataManager for backward compatibility
 */
export const useInventoryDataManagerWrapper = useInventoryDataManager;

/**
 * Legacy hook for inventory data manager
 * Alias for useInventoryDataManagerWrapper
 */
export const useInventoryDataManagerLegacy = useInventoryDataManager;

/**
 * Legacy hook for centralized inventory data
 * Provides backward compatibility with older code
 */
export const useCentralizedInventoryDataLegacy = useCentralizedInventoryData;

/**
 * Legacy hook for inventory data
 * Provides backward compatibility with older code
 */
export const useInventoryDataLegacy = useCentralizedInventoryData;
