import {
  validateSingleContentItem,
  validateContentItems,
  validateSingleRecentUpdate,
  validateRecentUpdates,
  sanitizeContentItem,
  sanitizeRecentUpdate,
  isContentItem,
  isRecentUpdate,
} from '@/pages/KnowledgeHub/utils/validation';
import { describe, test, expect, it } from 'vitest';
import { ContentItem, RecentUpdate } from '@/pages/KnowledgeHub/types';

describe('Validation Utilities', () => {
  describe('validateSingleContentItem', () => {
    it('validates a valid content item', () => {
      const validItem = {
        id: '1',
        title: 'Test Course',
        category: 'Courses',
        status: 'draft',
        dueDate: '2025-01-01',
        progress: 0,
      };

      const result = validateSingleContentItem(validItem);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('returns errors for invalid content item', () => {
      const invalidItem = {
        id: '',
        title: '',
        category: 'InvalidCategory',
        status: 'InvalidStatus',
        dueDate: 'invalid-date',
        progress: 150,
      };

      const result = validateSingleContentItem(invalidItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });

    it('validates required fields', () => {
      const incompleteItem = {
        id: '1',
        title: 'Test Course',
        // Missing required fields
      };

      const result = validateSingleContentItem(incompleteItem);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category is required');
      expect(result.errors).toContain('Status is required');
      expect(result.errors).toContain('Due date is required');
      expect(result.errors).toContain('Progress is required');
    });
  });

  describe('validateContentItems', () => {
    it('validates an array of valid content items', () => {
      const validItems = [
        {
          id: '1',
          title: 'Course 1',
          category: 'Courses',
          status: 'draft',
          dueDate: '2025-01-01',
          progress: 0,
        },
        {
          id: '2',
          title: 'Course 2',
          category: 'Procedures',
          status: 'published',
          dueDate: '2025-02-01',
          progress: 100,
        },
      ];

      const result = validateContentItems(validItems);
      expect(result.isValid).toBe(true);
      expect(result.validItems).toHaveLength(2);
      expect(result.invalidItems).toHaveLength(0);
    });

    it('handles mixed valid and invalid items', () => {
      const mixedItems = [
        {
          id: '1',
          title: 'Valid Course',
          category: 'Courses',
          status: 'draft',
          dueDate: '2025-01-01',
          progress: 0,
        },
        {
          id: '',
          title: '',
          category: 'InvalidCategory',
          status: 'InvalidStatus',
          dueDate: 'invalid-date',
          progress: 150,
        },
      ];

      const result = validateContentItems(mixedItems);
      expect(result.isValid).toBe(false);
      expect(result.validItems).toHaveLength(1);
      expect(result.invalidItems).toHaveLength(1);
      expect(result.invalidItems[0].index).toBe(1);
    });
  });

  describe('validateSingleRecentUpdate', () => {
    it('validates a valid recent update', () => {
      const validUpdate = {
        type: 'new',
        title: 'New Course Added',
        icon: () => null,
        time: '2 hours ago',
      };

      const result = validateSingleRecentUpdate(validUpdate);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('returns errors for invalid recent update', () => {
      const invalidUpdate = {
        type: 'invalid-type',
        title: '',
        icon: null,
        time: '',
      };

      const result = validateSingleRecentUpdate(invalidUpdate);
      expect(result.isValid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('validateRecentUpdates', () => {
    it('validates an array of valid recent updates', () => {
      const validUpdates = [
        {
          type: 'new',
          title: 'New Course Added',
          icon: () => null,
          time: '2 hours ago',
        },
        {
          type: 'completed',
          title: 'Course Completed',
          icon: () => null,
          time: '1 hour ago',
        },
      ];

      const result = validateRecentUpdates(validUpdates);
      expect(result.isValid).toBe(true);
      expect(result.validItems).toHaveLength(2);
      expect(result.invalidItems).toHaveLength(0);
    });
  });

  describe('sanitizeContentItem', () => {
    it('sanitizes and validates valid data', () => {
      const rawData = {
        id: '  1  ',
        title: '  Test Course  ',
        category: 'Courses',
        status: 'draft',
        dueDate: '2025-01-01',
        progress: '0',
        department: '  IT  ',
      };

      const result = sanitizeContentItem(rawData);
      expect(result).toBeDefined();
      expect(result!.id).toBe('1');
      expect(result!.title).toBe('Test Course');
      expect(result!.department).toBe('IT');
      expect(result!.progress).toBe(0);
    });

    it('returns null for invalid data', () => {
      const invalidData = {
        id: '',
        title: '',
        category: 'InvalidCategory',
        status: 'InvalidStatus',
        dueDate: 'invalid-date',
        progress: 'invalid',
      };

      const result = sanitizeContentItem(invalidData);
      expect(result).toBeNull();
    });

    it('handles missing optional fields', () => {
      const minimalData = {
        id: '1',
        title: 'Test Course',
        category: 'Courses',
        status: 'draft',
        dueDate: '2025-01-01',
        progress: 0,
      };

      const result = sanitizeContentItem(minimalData);
      expect(result).toBeDefined();
      expect(result!.department).toBeUndefined();
      expect(result!.lastUpdated).toBeUndefined();
    });
  });

  describe('sanitizeRecentUpdate', () => {
    it('sanitizes and validates valid data', () => {
      const rawData = {
        type: 'new',
        title: '  New Course Added  ',
        icon: () => null,
        time: '2 hours ago',
      };

      const result = sanitizeRecentUpdate(rawData);
      expect(result).toBeDefined();
      expect(result!.title).toBe('New Course Added');
    });

    it('returns null for invalid data', () => {
      const invalidData = {
        type: 'invalid-type',
        title: '',
        icon: null,
        time: '',
      };

      const result = sanitizeRecentUpdate(invalidData);
      expect(result).toBeNull();
    });
  });

  describe('Type Guards', () => {
    it('isContentItem returns true for valid content item', () => {
      const validItem: ContentItem = {
        id: '1',
        title: 'Test Course',
        category: 'Courses',
        status: 'draft',
        dueDate: '2025-01-01',
        progress: 0,
      };

      expect(isContentItem(validItem)).toBe(true);
    });

    it('isContentItem returns false for invalid content item', () => {
      const invalidItem = {
        id: '',
        title: '',
        category: 'InvalidCategory',
        status: 'InvalidStatus',
        dueDate: 'invalid-date',
        progress: 150,
      };

      expect(isContentItem(invalidItem)).toBe(false);
    });

    it('isRecentUpdate returns true for valid recent update', () => {
      const validUpdate: RecentUpdate = {
        type: 'new',
        title: 'New Course Added',
        icon: () => null,
        time: '2 hours ago',
      };

      expect(isRecentUpdate(validUpdate)).toBe(true);
    });

    it('isRecentUpdate returns false for invalid recent update', () => {
      const invalidUpdate = {
        type: 'invalid-type',
        title: '',
        icon: null,
        time: '',
      };

      expect(isRecentUpdate(invalidUpdate)).toBe(false);
    });
  });
});
