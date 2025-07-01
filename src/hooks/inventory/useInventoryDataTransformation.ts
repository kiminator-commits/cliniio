import { useInventoryDataContextCentralized } from '@/hooks/useInventoryDataContextCentralized';
import { useInventoryDataContext } from '@/pages/Inventory/providers/InventoryDataProvider';
import { useScanModalManagement } from '@/hooks/inventory/useScanModalManagement';
import { transformFormDataForModal } from '@/utils/Inventory/formDataUtils';

/**
 * Hook to handle inventory data transformation logic
 * Extracted from InventoryDashboard to separate data transformation concerns
 */
export const useInventoryDataTransformation = () => {
  // Use the centralized data context with fallback to existing context
  const centralizedData = useInventoryDataContextCentralized();
  const fallbackData = useInventoryDataContext();

  // Use centralized data if available, otherwise fall back to existing pattern
  const inventoryData = centralizedData.inventoryData
    ? centralizedData.inventoryData
    : fallbackData.inventoryData;

  // Use the scan modal management hook
  const { handleScanClick, storeFormData, isEditMode, getProgressInfo } = useScanModalManagement();

  // Transform form data using the utility
  const transformedFormData = transformFormDataForModal(storeFormData);

  return {
    inventoryData,
    handleScanClick,
    isEditMode,
    transformedFormData,
    getProgressInfo,
  };
};
