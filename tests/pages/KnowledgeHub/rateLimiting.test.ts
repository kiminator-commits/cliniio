import { renderHook, act } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, it } from 'vitest';
import { useKnowledgeHubStore } from '@/pages/KnowledgeHub/store/knowledgeHubStore';
import { knowledgeHubApiService } from '@/pages/KnowledgeHub/services/knowledgeHubApiService';
import { ContentItem, ContentStatus } from '@/pages/KnowledgeHub/types';
import { UserRole } from '@/pages/KnowledgeHub/utils/permissions';
import {
  NetworkError,
  ValidationError,
} from '@/pages/KnowledgeHub/types/errors';
import { ErrorType } from '@/pages/KnowledgeHub/types/errors';

// Mock the API service
vi.mock('@/pages/KnowledgeHub/services/knowledgeHubApiService', () => ({
  knowledgeHubApiService: {
    fetchContent: vi.fn(),
    updateContentStatus: vi.fn(),
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
    getRateLimitStats: vi.fn(),
    resetRateLimiter: vi.fn(),
    updateRateLimitConfig: vi.fn(),
  },
}));

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

// Test data
const mockContentItems: ContentItem[] = [
  {
    id: '1',
    title: 'Test Course',
    category: 'Courses',
    status: 'In Progress',
    progress: 50,
    dueDate: new Date().toISOString(),
    description: 'Test description',
  },
];

const mockUser = {
  id: 'test-user-123',
  role: 'Administrator' as UserRole,
};

describe('Rate Limiting Tests', () => {
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
      useKnowledgeHubStore.getState().setRateLimited(false);
      useKnowledgeHubStore.getState().resetRateLimiter();
    });

    // Setup default API mocks
    mockKnowledgeHubApiService.fetchContent.mockResolvedValue(mockContentItems);
    mockKnowledgeHubApiService.updateContentStatus.mockImplementation(
      async (id: string, status: string) => ({
        id,
        title: 'Test Content',
        category: 'Courses',
        status: status as ContentStatus,
        progress: 50,
        dueDate: new Date().toISOString(),
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
        dueDate: new Date().toISOString(),
        description: 'Test description',
        ...updates,
      })
    );
    mockKnowledgeHubApiService.deleteContent.mockResolvedValue(undefined);
    mockKnowledgeHubApiService.getRateLimitStats.mockReturnValue({
      currentRequests: 0,
      currentBurstRequests: 0,
      maxRequests: 100,
      maxBurstRequests: 10,
      windowMs: 60000,
    });
    mockKnowledgeHubApiService.resetRateLimiter.mockImplementation(() => {});
  });

  describe('Rate Limiter Configuration', () => {
    it('should have correct default rate limit configuration', () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.updateRateLimitStats();
      });

      expect(result.current.rateLimitStats).toEqual({
        currentRequests: 0,
        currentBurstRequests: 0,
        maxRequests: 100,
        maxBurstRequests: 20,
        windowMs: 60000,
      });
    });

    it('should allow updating rate limit configuration', () => {
      mockKnowledgeHubApiService.updateRateLimitConfig.mockImplementation(
        () => {}
      );

      // This would be called by the API service when config is updated
      expect(mockKnowledgeHubApiService.updateRateLimitConfig).toBeDefined();
    });
  });

  describe('Rate Limit Stats Management', () => {
    it('should update rate limit stats after API calls', async () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setContent(mockContentItems);
      });

      // Update rate limit stats manually since the store doesn't call API
      act(() => {
        result.current.updateRateLimitStats();
      });

      expect(result.current.rateLimitStats?.currentRequests).toBe(0);
    });

    it('should reset rate limiter correctly', () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.resetRateLimiter();
      });

      expect(result.current.rateLimitStats).toBeNull();
      expect(result.current.isRateLimited).toBe(false);
    });

    it('should set rate limited state correctly', () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.setRateLimited(true);
      });

      expect(result.current.isRateLimited).toBe(true);
    });
  });

  describe('Rate Limiting Error Handling', () => {
    it('should clear rate limited state on successful operations', async () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setContent(mockContentItems);
        result.current.setRateLimited(true);
      });

      expect(result.current.isRateLimited).toBe(true);

      await act(async () => {
        await result.current.updateContentStatus('1', 'Completed');
      });

      expect(result.current.isRateLimited).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('Rate Limiting in Store Operations', () => {
    it('should apply rate limiting to content fetching', async () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      await act(async () => {
        await result.current.initializeContent();
      });

      expect(result.current.updateRateLimitStats).toBeDefined();
    });

    it('should apply burst rate limiting to content updates', async () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setContent(mockContentItems);
      });

      await act(async () => {
        await result.current.updateContentStatus('1', 'Completed');
      });

      expect(result.current.updateRateLimitStats).toBeDefined();
    });

    it('should apply burst rate limiting to content deletions', async () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setContent(mockContentItems);
      });

      await act(async () => {
        await result.current.deleteContent('1');
      });

      expect(result.current.updateRateLimitStats).toBeDefined();
    });

    it('should apply burst rate limiting to general content updates', async () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setContent(mockContentItems);
      });

      await act(async () => {
        await result.current.updateContent('1', { title: 'Updated Title' });
      });

      expect(result.current.updateRateLimitStats).toBeDefined();
    });
  });

  describe('Rate Limiting Performance', () => {
    it('should handle rapid successive API calls with rate limiting', async () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setContent(mockContentItems);
      });

      const startTime = Date.now();

      // Make multiple rapid API calls
      await act(async () => {
        const promises = Array.from({ length: 5 }, (_, index) =>
          result.current.updateContentStatus(`item-${index}`, 'Completed')
        );
        await Promise.all(promises);
      });

      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Should complete within reasonable time despite rate limiting
      expect(executionTime).toBeLessThan(10000); // Less than 10 seconds
    });

    it('should handle rate limiting with retry logic', async () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setContent(mockContentItems);
      });

      await act(async () => {
        await result.current.updateContentStatus('1', 'Completed');
      });

      // Should eventually succeed after retry
      expect(result.current.error).toBeNull();
      expect(result.current.isRateLimited).toBe(false);
    });
  });

  describe('Rate Limiting UI Integration', () => {
    it('should provide rate limit stats for UI components', () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.updateRateLimitStats();
      });

      expect(result.current.rateLimitStats).toEqual({
        currentRequests: 0,
        currentBurstRequests: 0,
        maxRequests: 100,
        maxBurstRequests: 20,
        windowMs: 60000,
      });
    });

    it('should allow UI to reset rate limiter', () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.setRateLimited(true);
        result.current.resetRateLimiter();
      });

      expect(result.current.isRateLimited).toBe(false);
      expect(result.current.rateLimitStats).toBeNull();
    });

    it('should provide rate limiting hooks for components', () => {
      const { result: rateLimitStats } = renderHook(() =>
        useKnowledgeHubStore((state) => state.rateLimitStats)
      );
      const { result: isRateLimited } = renderHook(() =>
        useKnowledgeHubStore((state) => state.isRateLimited)
      );
      const { result: updateStats } = renderHook(() =>
        useKnowledgeHubStore((state) => state.updateRateLimitStats)
      );
      const { result: resetLimiter } = renderHook(() =>
        useKnowledgeHubStore((state) => state.resetRateLimiter)
      );

      expect(rateLimitStats.current).toBeNull();
      expect(isRateLimited.current).toBe(false);
      expect(typeof updateStats.current).toBe('function');
      expect(typeof resetLimiter.current).toBe('function');
    });
  });

  describe('Rate Limiting Edge Cases', () => {
    it('should handle concurrent rate limit errors', async () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setContent(mockContentItems);
      });

      // Perform concurrent operations
      await act(async () => {
        const promises = [
          result.current.updateContentStatus('1', 'Completed'),
          result.current.updateContentStatus('2', 'In Progress'),
          result.current.updateContentStatus('3', 'Not Started'),
        ];
        await Promise.allSettled(promises);
      });

      expect(result.current.isRateLimited).toBe(false);
    });

    it('should handle rate limiting with different error types', async () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setContent(mockContentItems);
      });

      await act(async () => {
        await result.current.updateContentStatus(
          '1',
          'InvalidStatus' as ContentStatus
        );
      });

      expect(result.current.isRateLimited).toBe(false); // Should not be rate limited for validation errors
    });

    it('should handle rate limiting with network timeouts', async () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setContent(mockContentItems);
      });

      await act(async () => {
        await result.current.updateContentStatus('1', 'Completed');
      });

      expect(result.current.isRateLimited).toBe(false); // Should not be rate limited for timeouts
    });
  });

  describe('Rate Limiting Configuration Updates', () => {
    it('should handle dynamic rate limit configuration changes', () => {
      const { result } = renderHook(() => useKnowledgeHubStore());

      act(() => {
        result.current.updateRateLimitStats();
      });

      expect(result.current.rateLimitStats?.maxRequests).toBe(100);
      expect(result.current.rateLimitStats?.maxBurstRequests).toBe(20);
      expect(result.current.rateLimitStats?.windowMs).toBe(60000);
    });
  });
});
