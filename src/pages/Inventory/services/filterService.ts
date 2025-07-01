import { inventoryData } from '@/utils/Inventory/inventoryData';

/**
 * Service for handling inventory filtering logic
 * Extracted from main Inventory page component
 */
export class FilterService {
  /**
   * Transform inventory data for modal display
   * Extracted from filteredTools useMemo in main page
   */
  static getFilteredTools() {
    return inventoryData.map(item => ({
      id: item.toolId || '',
      name: item.item || '',
      barcode: item.toolId || '',
      currentPhase: item.p2Status || '',
      category: item.category || '',
    }));
  }
}
