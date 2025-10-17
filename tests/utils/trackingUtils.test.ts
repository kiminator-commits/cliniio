import { describe, it, expect } from 'vitest';
import {
  isTrackingSupportedForTab,
  shouldShowTrackedFilter,
  shouldShowTrackingActions,
  getColumnsForTab,
  isItemCategoryTrackable,
  TRACKING_CONFIG,
} from '../../src/utils/inventory/trackingUtils';
import { TabType as _TabType } from '../../src/types/inventory';

describe('Tracking Utils', () => {
  describe('isTrackingSupportedForTab', () => {
    it('should return true for tools tab', () => {
      expect(isTrackingSupportedForTab('tools')).toBe(true);
    });

    it('should return true for supplies tab', () => {
      expect(isTrackingSupportedForTab('supplies')).toBe(true);
    });

    it('should return false for equipment tab', () => {
      expect(isTrackingSupportedForTab('equipment')).toBe(false);
    });

    it('should return false for officeHardware tab', () => {
      expect(isTrackingSupportedForTab('officeHardware')).toBe(false);
    });
  });

  describe('shouldShowTrackedFilter', () => {
    it('should show filter for tools tab', () => {
      expect(shouldShowTrackedFilter('tools')).toBe(true);
    });

    it('should show filter for supplies tab', () => {
      expect(shouldShowTrackedFilter('supplies')).toBe(true);
    });

    it('should not show filter for equipment tab', () => {
      expect(shouldShowTrackedFilter('equipment')).toBe(false);
    });

    it('should not show filter for officeHardware tab', () => {
      expect(shouldShowTrackedFilter('officeHardware')).toBe(false);
    });
  });

  describe('shouldShowTrackingActions', () => {
    it('should show actions for tools tab', () => {
      expect(shouldShowTrackingActions('tools')).toBe(true);
    });

    it('should show actions for supplies tab', () => {
      expect(shouldShowTrackingActions('supplies')).toBe(true);
    });

    it('should not show actions for equipment tab', () => {
      expect(shouldShowTrackingActions('equipment')).toBe(false);
    });

    it('should not show actions for officeHardware tab', () => {
      expect(shouldShowTrackingActions('officeHardware')).toBe(false);
    });
  });

  describe('getColumnsForTab', () => {
    it('should return correct columns for tools tab', () => {
      const columns = getColumnsForTab('tools');
      expect(columns).toEqual(['Name', 'Status', 'Price']);
    });

    it('should return correct columns for supplies tab', () => {
      const columns = getColumnsForTab('supplies');
      expect(columns).toEqual(['Name', 'Category', 'Location', 'Quantity', 'Price']);
    });

    it('should return default columns for equipment tab', () => {
      const columns = getColumnsForTab('equipment');
      expect(columns).toEqual(['Name', 'Category', 'Quantity', 'Price']);
    });

    it('should return default columns for officeHardware tab', () => {
      const columns = getColumnsForTab('officeHardware');
      expect(columns).toEqual(['Name', 'Category', 'Quantity', 'Price']);
    });
  });

  describe('isItemCategoryTrackable', () => {
    it('should return true for Tools category', () => {
      expect(isItemCategoryTrackable('Tools')).toBe(true);
    });

    it('should return true for Supplies category', () => {
      expect(isItemCategoryTrackable('Supplies')).toBe(true);
    });

    it('should return true for lowercase tools', () => {
      expect(isItemCategoryTrackable('tools')).toBe(true);
    });

    it('should return true for lowercase supplies', () => {
      expect(isItemCategoryTrackable('supplies')).toBe(true);
    });

    it('should return false for Equipment category', () => {
      expect(isItemCategoryTrackable('Equipment')).toBe(false);
    });

    it('should return false for Hardware category', () => {
      expect(isItemCategoryTrackable('Hardware')).toBe(false);
    });

    it('should return false for unknown category', () => {
      expect(isItemCategoryTrackable('Unknown')).toBe(false);
    });
  });

  describe('TRACKING_CONFIG', () => {
    it('should have correct supported tabs', () => {
      expect(TRACKING_CONFIG.SUPPORTED_TABS).toEqual(['tools', 'supplies']);
    });

    it('should have correct supported categories', () => {
      expect(TRACKING_CONFIG.SUPPORTED_CATEGORIES).toEqual(['Tools', 'Supplies', 'tools', 'supplies']);
    });

    it('should have correct default priority', () => {
      expect(TRACKING_CONFIG.DEFAULT_PRIORITY).toBe('medium');
    });

    it('should have correct notification TTL', () => {
      expect(TRACKING_CONFIG.NOTIFICATION_TTL_HOURS).toBe(24);
    });
  });
});
