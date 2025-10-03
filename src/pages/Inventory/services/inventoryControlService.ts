import { TabType } from '../types';

/**
 * Service for handling inventory control operations
 * Extracted from main Inventory page component
 */
export class InventoryControlService {
  /**
   * Handle tab change with validation
   */
  static handleTabChange(setActiveTab: (tab: TabType) => void, tab: TabType) {
    if (
      tab &&
      ['tools', 'supplies', 'equipment', 'officeHardware'].includes(tab)
    ) {
      setActiveTab(tab);
    }
  }

  /**
   * Handle search input changes
   */
  static handleSearchChange(
    setSearchTerm: (term: string) => void,
    term: string
  ) {
    setSearchTerm(term || '');
  }

  /**
   * Handle filter toggle operations
   */
  static handleFilterToggle(
    currentState: boolean,
    setState: (value: boolean) => void
  ) {
    setState(!currentState);
  }

  /**
   * Handle modal visibility
   */
  static handleModalVisibility(
    isVisible: boolean,
    setIsVisible: (value: boolean) => void
  ) {
    setIsVisible(!isVisible);
  }
}
