import { TabType } from '../types';
import { handleCategoryChange } from '@/utils/inventoryHelpers';

/**
 * Service for handling inventory category logic
 * Extracted from main Inventory page component
 */
export class CategoryService {
  /**
   * Handle category change with memoization
   * Extracted from memoizedCategoryChange in main page
   */
  static createCategoryChangeHandler(setActiveTab: (tab: TabType) => void) {
    return (tab: TabType) => {
      handleCategoryChange(setActiveTab, tab);
    };
  }

  /**
   * Handle tracked filter toggle
   * Extracted from handleToggleTrackedFilter in main page
   */
  static createTrackedFilterHandler(
    showTrackedOnly: boolean,
    setShowTrackedOnly: (show: boolean) => void
  ) {
    return () => {
      setShowTrackedOnly(!showTrackedOnly);
    };
  }

  /**
   * Handle favorites filter toggle
   * Extracted from handleToggleFavoritesFilter in main page
   */
  static createFavoritesFilterHandler(
    showFavoritesOnly: boolean,
    setShowFavoritesOnly: (show: boolean) => void
  ) {
    return () => {
      setShowFavoritesOnly(!showFavoritesOnly);
    };
  }
}
