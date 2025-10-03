import { TabType } from '../types';
import { inventoryErrorService } from './inventoryErrorService';

/**
 * Service for handling inventory header operations
 * Extracted from main Inventory page component
 */
export class InventoryHeaderService {
  /**
   * Handle header button clicks
   */
  static handleHeaderButtonClick(buttonType: string, callback: () => void) {
    switch (buttonType) {
      case 'add':
        callback();
        break;
      case 'scan':
        callback();
        break;
      case 'filter':
        callback();
        break;
      default:
        inventoryErrorService.handleGeneralError(
          new Error(`Unknown header button type: ${buttonType}`),
          {
            operation: 'handle_header_button_click',
            additionalInfo: { buttonType },
          }
        );
    }
  }

  /**
   * Handle header search functionality
   */
  static handleHeaderSearch(
    searchTerm: string,
    setSearchTerm: (term: string) => void,
    onSearch: (term: string) => void
  ) {
    setSearchTerm(searchTerm);
    onSearch(searchTerm);
  }

  /**
   * Handle header filter operations
   */
  static handleHeaderFilter(
    filterType: string,
    currentValue: boolean,
    setValue: (value: boolean) => void
  ) {
    switch (filterType) {
      case 'tracked':
        setValue(!currentValue);
        break;
      case 'favorites':
        setValue(!currentValue);
        break;
      default:
        inventoryErrorService.handleGeneralError(
          new Error(`Unknown filter type: ${filterType}`),
          {
            operation: 'handle_header_filter',
            additionalInfo: { filterType },
          }
        );
    }
  }

  /**
   * Get header title based on active tab
   */
  static getHeaderTitle(activeTab: TabType): string {
    const titles = {
      tools: 'Tools Inventory',
      supplies: 'Supplies Inventory',
      equipment: 'Equipment Inventory',
      officeHardware: 'Office Hardware Inventory',
    };
    return titles[activeTab] || 'Inventory';
  }
}
