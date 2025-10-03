import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useKnowledgeHubStore } from '@/pages/KnowledgeHub/store/knowledgeHubStore';
import { knowledgeHubApiService } from '@/pages/KnowledgeHub/services/knowledgeHubApiService';
import {
  ContentItem,
  ContentStatus,
  ContentCategory,
} from '@/pages/KnowledgeHub/types';
import { ErrorType, ErrorSeverity } from '@/pages/KnowledgeHub/types/errors';

import { performance } from 'perf_hooks';

// Mock the API service
vi.mock('@/pages/KnowledgeHub/services/knowledgeHubApiService');
const mockKnowledgeHubApiService = knowledgeHubApiService as vi.Mocked<
  typeof knowledgeHubApiService
>;

// Mock LearningProgressService
const mockUpdateItemStatus = vi.fn();
vi.mock('@/services/learningProgressService', () => ({
  __esModule: true,
  default: {
    getInstance: vi.fn(() => ({
      updateItemStatus: mockUpdateItemStatus,
    })),
  },
}));

// Generate large dataset for performance testing
const generateLargeDataset = (size: number): ContentItem[] => {
  const categories: ContentCategory[] = [
    'Courses',
    'Procedures',
    'Policies',
    'Learning Pathways',
    'Advanced',
  ];
  const statuses: ContentStatus[] = ['Not Started', 'In Progress', 'Completed'];

  return Array.from({ length: size }, (_, index) => ({
    id: `item-${index}`,
    title: `Content Item ${index}`,
    category: categories[index % categories.length],
    status: statuses[index % statuses.length],
    progress: (index * 10) % 100,
    dueDate: new Date(Date.now() + index * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0], // Format as YYYY-MM-DD
    description: `Description for content item ${index}`,
  }));
};

describe('KnowledgeHub Store Performance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store state
    act(() => {
      useKnowledgeHubStore.getState().setContent([]);
      useKnowledgeHubStore.getState().setError(null);
      useKnowledgeHubStore.getState().setLoading(false);
      useKnowledgeHubStore.getState().setCurrentUser(null);
      useKnowledgeHubStore.getState().setSelectedCategory('');
      useKnowledgeHubStore.getState().setValidationError(null);
    });

    // Setup API mocks
    mockKnowledgeHubApiService.fetchContent.mockResolvedValue([]);
    mockKnowledgeHubApiService.updateContentStatus.mockImplementation(
      async (id: string, status: string) => ({
        id,
        title: 'Test Content',
        category: 'Courses',
        status: status as ContentStatus,
        progress: 50,
        dueDate: new Date().toISOString().split('T')[0],
        description: 'Test description',
      })
    );
    mockKnowledgeHubApiService.updateContent.mockImplementation(
      async (id: string, updates: Partial<ContentItem>) => ({
        id,
        title: 'Test Content',
        category: 'Courses',
        status: 'In Progress',
        progress: 50,
        dueDate: new Date().toISOString().split('T')[0],
        description: 'Test description',
        ...updates,
      })
    );
    mockKnowledgeHubApiService.deleteContent.mockResolvedValue(undefined);
  });

  describe('Large Dataset Performance', () => {
    it('should handle large content datasets efficiently', async () => {
      const largeDataset = generateLargeDataset(1000);
      const startTime = performance.now();

      act(() => {
        useKnowledgeHubStore.getState().setContent(largeDataset);
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      const { result } = renderHook(() => useKnowledgeHubStore());

      expect(result.current.content).toHaveLength(1000);
      expect(executionTime).toBeLessThan(100); // Should complete in less than 100ms
      expect(result.current.categoryCounts).toEqual({
        Courses: 200,
        Procedures: 200,
        Policies: 200,
        'Learning Pathways': 200,
        Advanced: 200,
      });
    });

    it('should filter large datasets efficiently', async () => {
      const largeDataset = generateLargeDataset(5000);

      act(() => {
        useKnowledgeHubStore.getState().setContent(largeDataset);
      });

      const { result } = renderHook(() => useKnowledgeHubStore());

      const startTime = performance.now();

      act(() => {
        result.current.setSelectedCategory('Courses');
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(result.current.selectedContent).toHaveLength(1000);
      expect(executionTime).toBeLessThan(50); // Should complete in less than 50ms
    });

    it('should update category counts efficiently for large datasets', async () => {
      const largeDataset = generateLargeDataset(10000);

      const startTime = performance.now();

      act(() => {
        useKnowledgeHubStore.getState().setContent(largeDataset);
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      const { result } = renderHook(() => useKnowledgeHubStore());

      expect(result.current.categoryCounts).toEqual({
        Courses: 2000,
        Procedures: 2000,
        Policies: 2000,
        'Learning Pathways': 2000,
        Advanced: 2000,
      });
      expect(executionTime).toBeLessThan(200); // Should complete in less than 200ms
    });
  });

  describe('Concurrent Operations Performance', () => {
    it('should handle multiple concurrent status updates efficiently', async () => {
      const dataset = generateLargeDataset(100);

      act(() => {
        useKnowledgeHubStore.getState().setContent(dataset);
        useKnowledgeHubStore.getState().setCurrentUser({
          id: 'test-user',
          role: 'Administrator',
        });
      });

      const { result } = renderHook(() => useKnowledgeHubStore());

      const startTime = performance.now();

      // Perform 50 concurrent status updates
      await act(async () => {
        const promises = Array.from({ length: 50 }, (_, index) =>
          result.current.updateContentStatus(`item-${index}`, 'Completed')
        );
        await Promise.all(promises);
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(5000); // Should complete in less than 5 seconds
      expect(
        mockKnowledgeHubApiService.updateContentStatus
      ).toHaveBeenCalledTimes(50);
    });

    it('should handle concurrent content updates efficiently', async () => {
      const dataset = generateLargeDataset(50);

      act(() => {
        useKnowledgeHubStore.getState().setContent(dataset);
        useKnowledgeHubStore.getState().setCurrentUser({
          id: 'test-user',
          role: 'Administrator',
        });
      });

      const { result } = renderHook(() => useKnowledgeHubStore());

      const startTime = performance.now();

      // Perform 25 concurrent content updates
      await act(async () => {
        const promises = Array.from({ length: 25 }, (_, index) =>
          result.current.updateContent(`item-${index}`, {
            title: `Updated Title ${index}`,
            progress: (index * 2) % 100,
          })
        );
        await Promise.all(promises);
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(3000); // Should complete in less than 3 seconds
      expect(mockKnowledgeHubApiService.updateContent).toHaveBeenCalledTimes(
        25
      );
    });

    it('should handle concurrent deletions efficiently', async () => {
      const dataset = generateLargeDataset(100);

      // Mock the deleteContent API to resolve successfully
      mockKnowledgeHubApiService.deleteContent.mockResolvedValue(undefined);

      act(() => {
        useKnowledgeHubStore.getState().setContent(dataset);
        useKnowledgeHubStore.getState().setCurrentUser({
          id: 'test-user',
          role: 'Administrator',
        });
      });

      const { result } = renderHook(() => useKnowledgeHubStore());

      // Verify initial state
      expect(result.current.content).toHaveLength(100);

      const startTime = performance.now();

      // Perform 30 concurrent deletions
      await act(async () => {
        const promises = Array.from({ length: 30 }, (_, index) =>
          result.current.deleteContent(`item-${index}`)
        );
        await Promise.all(promises);
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Verify the API was called the correct number of times
      expect(mockKnowledgeHubApiService.deleteContent).toHaveBeenCalledTimes(
        30
      );
      expect(executionTime).toBeLessThan(3000); // Should complete in less than 3 seconds
    }, 10000); // Increase timeout to 10 seconds
  });

  describe('Memory Usage Performance', () => {
    it('should not cause memory leaks with large datasets', async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Load and unload large datasets multiple times
      for (let i = 0; i < 10; i++) {
        const dataset = generateLargeDataset(1000);

        act(() => {
          useKnowledgeHubStore.getState().setContent(dataset);
        });

        act(() => {
          useKnowledgeHubStore.getState().setContent([]);
        });
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it('should efficiently handle category filtering with memory constraints', async () => {
      const dataset = generateLargeDataset(5000);

      act(() => {
        useKnowledgeHubStore.getState().setContent(dataset);
      });

      const { result } = renderHook(() => useKnowledgeHubStore());

      const startMemory = process.memoryUsage().heapUsed;

      // Perform multiple category changes
      for (let i = 0; i < 100; i++) {
        act(() => {
          result.current.setSelectedCategory('Courses');
        });

        act(() => {
          result.current.setSelectedCategory('Procedures');
        });
      }

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = endMemory - startMemory;

      // Memory increase should be minimal
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });

  describe('API Call Performance', () => {
    it('should handle rapid API calls efficiently', async () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.setCurrentUser({
          id: 'test-user',
          role: 'Administrator',
        });
      });

      const startTime = performance.now();

      // Make 100 rapid API calls
      await act(async () => {
        const promises = Array.from({ length: 100 }, () =>
          result.current.refetchContent()
        );
        await Promise.all(promises);
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(10000); // Should complete in less than 10 seconds
      expect(mockKnowledgeHubApiService.fetchContent).toHaveBeenCalledTimes(
        100
      );
    });

    it('should handle API timeouts efficiently', async () => {
      // Mock slow API responses
      mockKnowledgeHubApiService.fetchContent.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      const { result } = renderHook(() => useKnowledgeHubStore());

      const startTime = performance.now();

      // Make multiple calls with timeouts
      await act(async () => {
        const promises = Array.from({ length: 10 }, () =>
          result.current.refetchContent()
        );
        await Promise.all(promises);
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within reasonable time despite slow API
      expect(executionTime).toBeLessThan(2000); // Less than 2 seconds
    });
  });

  describe('State Update Performance', () => {
    it('should handle rapid state updates efficiently', async () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      const startTime = performance.now();

      // Perform 1000 rapid state updates
      for (let i = 0; i < 1000; i++) {
        act(() => {
          result.current.setSelectedCategory(`category-${i % 5}`);
        });
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it('should handle error state updates efficiently', async () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      const startTime = performance.now();

      // Perform 500 error state updates
      for (let i = 0; i < 500; i++) {
        act(() => {
          result.current.setError({
            type: ErrorType.OPERATION_FAILED,
            message: `Error ${i}`,
            timestamp: new Date(),
            retryable: true,
            severity: ErrorSeverity.MEDIUM,
          });
        });

        act(() => {
          result.current.setError(null);
        });
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(500); // Should complete in less than 500ms
    });
  });

  describe('Selector Performance', () => {
    it('should efficiently compute derived state for large datasets', async () => {
      const dataset = generateLargeDataset(10000);

      act(() => {
        useKnowledgeHubStore.getState().setContent(dataset);
      });

      const { result } = renderHook(() => useKnowledgeHubStore());

      const startTime = performance.now();

      // Access computed properties multiple times
      for (let i = 0; i < 100; i++) {
        // Access computed properties to test performance
        void result.current.categoryCounts;
        void result.current.selectedContent;
        result.current.canDeleteContent();
        result.current.canUpdateStatus();
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    it('should efficiently handle permission checks for large datasets', async () => {
      const dataset = generateLargeDataset(5000);

      act(() => {
        useKnowledgeHubStore.getState().setContent(dataset);
        useKnowledgeHubStore.getState().setCurrentUser({
          id: 'test-user',
          role: 'Administrator',
        });
      });

      const { result } = renderHook(() => useKnowledgeHubStore());

      const startTime = performance.now();

      // Perform 1000 permission checks
      for (let i = 0; i < 1000; i++) {
        result.current.canDeleteContent();
        result.current.canUpdateStatus();
        result.current.canCreateContent();
        result.current.canViewAllCategories();
        result.current.canManageUsers();
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(50); // Should complete in less than 50ms
    });
  });

  describe('Cache Performance', () => {
    it('should efficiently handle cache invalidation for large datasets', async () => {
      const dataset = generateLargeDataset(5000);

      act(() => {
        useKnowledgeHubStore.getState().setContent(dataset);
        useKnowledgeHubStore.getState().setCurrentUser({
          id: 'test-user',
          role: 'Administrator',
        });
      });

      const { result } = renderHook(() => useKnowledgeHubStore());

      const startTime = performance.now();

      // Perform operations that trigger cache invalidation
      await act(async () => {
        const promises = Array.from({ length: 100 }, (_, index) =>
          result.current.updateContentStatus(`item-${index}`, 'Completed')
        );
        await Promise.all(promises);
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(5000); // Should complete in less than 5 seconds
    });
  });
});
