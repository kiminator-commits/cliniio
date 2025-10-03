import { create, StoreApi } from 'zustand';
import {
  createInventoryDataStoreSlice,
  InventoryDataState,
} from '../../../src/store/inventorySlices/createInventoryDataStoreSlice';
import { LocalInventoryItem } from '@/types/inventoryTypes';

describe('createInventoryDataStoreSlice', () => {
  let store: StoreApi<InventoryDataState>;

  beforeEach(() => {
    store = create<InventoryDataState>(createInventoryDataStoreSlice);
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const state = store.getState();

      expect(state.formData).toEqual({});
      expect(state.isEditMode).toBe(false);
      expect(state.expandedSections).toEqual({
        general: true,
        maintenance: false,
        purchase: false,
        usage: false,
      });
      expect(state.itemsPerPage).toBe(3);
      expect(state.currentPage).toBe(1);
      expect(state.pagination).toEqual({
        currentPage: 1,
        pageSize: 10,
      });
      expect(state.searchQuery).toBe('');
      expect(state.category).toBe('');
      expect(state.location).toBe('');
    });
  });

  describe('Form Data Management', () => {
    it('should set form data', () => {
      const formData: Partial<LocalInventoryItem> = {
        item: 'Test Item',
        category: 'Tools',
        location: 'Storage Room A',
        quantity: 10,
        unit_cost: 25.99,
      };

      store.getState().setFormData(formData);

      expect(store.getState().formData).toEqual(formData);
    });

    it('should set partial form data', () => {
      const partialData = { item: 'Test Item' };

      store.getState().setFormData(partialData);

      expect(store.getState().formData).toEqual(partialData);
    });

    it('should update existing form data', () => {
      const initialData = { item: 'Initial Item', category: 'Tools' };
      const updateData = { item: 'Updated Item', quantity: 5 };

      store.getState().setFormData(initialData);
      store.getState().setFormData(updateData);

      expect(store.getState().formData).toEqual(updateData);
    });

    it('should handle empty form data', () => {
      store.getState().setFormData({});

      expect(store.getState().formData).toEqual({});
    });

    it('should handle form data with all fields', () => {
      const completeData: Partial<LocalInventoryItem> = {
        id: 'item1',
        item: 'Complete Item',
        category: 'Equipment',
        location: 'Maintenance Room',
        quantity: 15,
        unit_cost: 199.99,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      store.getState().setFormData(completeData);

      expect(store.getState().formData).toEqual(completeData);
    });
  });

  describe('Edit Mode Management', () => {
    it('should set edit mode to true', () => {
      store.getState().setEditMode(true);

      expect(store.getState().isEditMode).toBe(true);
    });

    it('should set edit mode to false', () => {
      store.getState().setEditMode(false);

      expect(store.getState().isEditMode).toBe(false);
    });

    it('should toggle edit mode', () => {
      store.getState().setEditMode(true);
      expect(store.getState().isEditMode).toBe(true);

      store.getState().setEditMode(false);
      expect(store.getState().isEditMode).toBe(false);
    });
  });

  describe('Form Data Reset', () => {
    it('should reset form data to empty object', () => {
      const formData = { item: 'Test Item', category: 'Tools' };

      store.getState().setFormData(formData);
      expect(store.getState().formData).toEqual(formData);

      store.getState().resetFormData();
      expect(store.getState().formData).toEqual({});
    });

    it('should reset form data when already empty', () => {
      store.getState().resetFormData();

      expect(store.getState().formData).toEqual({});
    });
  });

  describe('Expanded Sections Management', () => {
    it('should set expanded sections', () => {
      const expandedSections = {
        general: true,
        purchase: false,
        maintenance: false,
        usage: false,
      };

      store.getState().setExpandedSections(expandedSections);

      expect(store.getState().expandedSections).toEqual(expandedSections);
    });

    it('should update existing expanded sections', () => {
      const initialSections = {
        general: true,
        purchase: false,
        maintenance: false,
        usage: false,
      };
      const updatedSections = {
        general: false,
        purchase: true,
        maintenance: true,
        usage: false,
      };

      store.getState().setExpandedSections(initialSections);
      store.getState().setExpandedSections(updatedSections);

      expect(store.getState().expandedSections).toEqual(updatedSections);
    });

    it('should handle empty expanded sections', () => {
      const emptySections = {
        general: false,
        purchase: false,
        maintenance: false,
        usage: false,
      };
      store.getState().setExpandedSections(emptySections);

      expect(store.getState().expandedSections).toEqual(emptySections);
    });
  });

  describe('Pagination Management', () => {
    it('should set items per page', () => {
      store.getState().setItemsPerPage(25);

      expect(store.getState().itemsPerPage).toBe(25);
    });

    it('should set current page', () => {
      store.getState().setCurrentPage(5);

      expect(store.getState().currentPage).toBe(5);
      expect(store.getState().pagination.currentPage).toBe(5);
    });

    it('should handle pagination state synchronization', () => {
      store.getState().setCurrentPage(3);
      store.getState().setItemsPerPage(20);

      const state = store.getState();
      expect(state.currentPage).toBe(3);
      expect(state.itemsPerPage).toBe(20);
      expect(state.pagination.currentPage).toBe(3);
      expect(state.pagination.pageSize).toBe(10); // This should remain unchanged
    });

    it('should handle multiple page changes', () => {
      store.getState().setCurrentPage(1);
      store.getState().setCurrentPage(2);
      store.getState().setCurrentPage(3);

      expect(store.getState().currentPage).toBe(3);
      expect(store.getState().pagination.currentPage).toBe(3);
    });

    it('should handle multiple items per page changes', () => {
      store.getState().setItemsPerPage(10);
      store.getState().setItemsPerPage(25);
      store.getState().setItemsPerPage(50);

      expect(store.getState().itemsPerPage).toBe(50);
    });
  });

  describe('Search and Filter Management', () => {
    it('should set search query', () => {
      store.getState().setSearchQuery('screwdriver');

      expect(store.getState().searchQuery).toBe('screwdriver');
    });

    it('should set category filter', () => {
      store.getState().setCategoryFilter('Tools');

      expect(store.getState().category).toBe('Tools');
    });

    it('should set location filter', () => {
      store.getState().setLocationFilter('Storage Room A');

      expect(store.getState().location).toBe('Storage Room A');
    });

    it('should handle empty search query', () => {
      store.getState().setSearchQuery('');

      expect(store.getState().searchQuery).toBe('');
    });

    it('should handle empty category filter', () => {
      store.getState().setCategoryFilter('');

      expect(store.getState().category).toBe('');
    });

    it('should handle empty location filter', () => {
      store.getState().setLocationFilter('');

      expect(store.getState().location).toBe('');
    });
  });

  describe('Complex State Operations', () => {
    it('should handle form data with edit mode', () => {
      const formData = { item: 'Test Item', category: 'Tools' };

      store.getState().setEditMode(true);
      store.getState().setFormData(formData);

      expect(store.getState().isEditMode).toBe(true);
      expect(store.getState().formData).toEqual(formData);
    });

    it('should handle pagination with filters', () => {
      store.getState().setCurrentPage(2);
      store.getState().setItemsPerPage(15);
      store.getState().setSearchQuery('test');
      store.getState().setCategoryFilter('Tools');

      const state = store.getState();
      expect(state.currentPage).toBe(2);
      expect(state.itemsPerPage).toBe(15);
      expect(state.searchQuery).toBe('test');
      expect(state.category).toBe('Tools');
      expect(state.pagination.currentPage).toBe(2);
    });

    it('should handle expanded sections with form data', () => {
      const formData = { item: 'Test Item' };
      const expandedSections = {
        general: true,
        purchase: false,
        maintenance: true,
        usage: false,
      };

      store.getState().setFormData(formData);
      store.getState().setExpandedSections(expandedSections);

      expect(store.getState().formData).toEqual(formData);
      expect(store.getState().expandedSections).toEqual(expandedSections);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null form data', () => {
      store.getState().setFormData(null as unknown as Record<string, unknown>);

      expect(store.getState().formData).toBeNull();
    });

    it('should handle undefined form data', () => {
      store
        .getState()
        .setFormData(undefined as unknown as Record<string, unknown>);

      expect(store.getState().formData).toBeUndefined();
    });

    it('should handle very large page numbers', () => {
      store.getState().setCurrentPage(999999);

      expect(store.getState().currentPage).toBe(999999);
      expect(store.getState().pagination.currentPage).toBe(999999);
    });

    it('should handle zero items per page', () => {
      store.getState().setItemsPerPage(0);

      expect(store.getState().itemsPerPage).toBe(0);
    });

    it('should handle negative page numbers', () => {
      store.getState().setCurrentPage(-1);

      expect(store.getState().currentPage).toBe(-1);
      expect(store.getState().pagination.currentPage).toBe(-1);
    });

    it('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(1000);
      store.getState().setSearchQuery(longQuery);

      expect(store.getState().searchQuery).toBe(longQuery);
    });

    it('should handle special characters in search query', () => {
      const specialQuery = 'screwdriver & hammer (set)';
      store.getState().setSearchQuery(specialQuery);

      expect(store.getState().searchQuery).toBe(specialQuery);
    });

    it('should handle special characters in category filter', () => {
      const specialCategory = 'Tools & Equipment';
      store.getState().setCategoryFilter(specialCategory);

      expect(store.getState().category).toBe(specialCategory);
    });

    it('should handle special characters in location filter', () => {
      const specialLocation = 'Storage Room A-1 (Main)';
      store.getState().setLocationFilter(specialLocation);

      expect(store.getState().location).toBe(specialLocation);
    });

    it('should handle very long category names', () => {
      const longCategory = 'a'.repeat(500);
      store.getState().setCategoryFilter(longCategory);

      expect(store.getState().category).toBe(longCategory);
    });

    it('should handle very long location names', () => {
      const longLocation = 'a'.repeat(500);
      store.getState().setLocationFilter(longLocation);

      expect(store.getState().location).toBe(longLocation);
    });
  });

  describe('State Persistence', () => {
    it('should maintain complex state across operations', () => {
      // Set up complex state
      const formData = {
        item: 'Complex Item',
        category: 'Equipment',
        quantity: 10,
      };
      const expandedSections = {
        general: true,
        purchase: false,
        maintenance: true,
        usage: true,
      };

      store.getState().setFormData(formData);
      store.getState().setEditMode(true);
      store.getState().setExpandedSections(expandedSections);
      store.getState().setCurrentPage(5);
      store.getState().setItemsPerPage(25);
      store.getState().setSearchQuery('complex');
      store.getState().setCategoryFilter('Equipment');
      store.getState().setLocationFilter('Main Room');

      // Verify all state is maintained
      const state = store.getState();
      expect(state.formData).toEqual(formData);
      expect(state.isEditMode).toBe(true);
      expect(state.expandedSections).toEqual(expandedSections);
      expect(state.currentPage).toBe(5);
      expect(state.itemsPerPage).toBe(25);
      expect(state.searchQuery).toBe('complex');
      expect(state.category).toBe('Equipment');
      expect(state.location).toBe('Main Room');
      expect(state.pagination.currentPage).toBe(5);
    });

    it('should handle rapid state changes', () => {
      // Rapidly change states
      for (let i = 0; i < 100; i++) {
        store.getState().setCurrentPage(i);
        store.getState().setItemsPerPage(i * 5);
        store.getState().setSearchQuery(`query${i}`);
        store.getState().setCategoryFilter(`category${i}`);
        store.getState().setLocationFilter(`location${i}`);
      }

      const state = store.getState();
      expect(state.currentPage).toBe(99);
      expect(state.itemsPerPage).toBe(495);
      expect(state.searchQuery).toBe('query99');
      expect(state.category).toBe('category99');
      expect(state.location).toBe('location99');
      expect(state.pagination.currentPage).toBe(99);
    });
  });
});
