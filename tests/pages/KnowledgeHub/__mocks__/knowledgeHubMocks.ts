import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useKnowledgeHubStore } from '@/pages/KnowledgeHub/store/knowledgeHubStore';
import { knowledgeHubApiService } from '@/pages/KnowledgeHub/services/knowledgeHubApiService';
import { ContentItem, ContentStatus } from '@/pages/KnowledgeHub/types';
import { UserRole } from '@/pages/KnowledgeHub/utils/permissions';
import {
  ApiError,
  NetworkError,
  ValidationError,
  ContentNotFoundError,
} from '@/pages/KnowledgeHub/types/errors';
import { ErrorType } from '@/pages/KnowledgeHub/types/errors';
import { KnowledgeHubStore } from '@/pages/KnowledgeHub/store/knowledgeHubTypes';

// Mock the API service
vi.mock('@/pages/KnowledgeHub/services/knowledgeHubApiService', () => ({
  knowledgeHubApiService: {
    fetchContent: vi.fn(),
    updateContentStatus: vi.fn(),
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
    searchContent: vi.fn(),
    getContentStats: vi.fn(),
    getRateLimitStats: vi.fn(),
    healthCheck: vi.fn(),
  },
}));

// Also mock the relative path import
vi.mock('../../services/knowledgeHubApiService', () => ({
  knowledgeHubApiService: {
    fetchContent: vi.fn(),
    updateContentStatus: vi.fn(),
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
    searchContent: vi.fn(),
    getContentStats: vi.fn(),
    getRateLimitStats: vi.fn(),
    healthCheck: vi.fn(),
  },
}));

// Mock the store's relative path import
vi.mock('../services/knowledgeHubApiService', () => ({
  knowledgeHubApiService: {
    fetchContent: vi.fn(),
    updateContentStatus: vi.fn(),
    updateContent: vi.fn(),
    deleteContent: vi.fn(),
    searchContent: vi.fn(),
    getContentStats: vi.fn(),
    getRateLimitStats: vi.fn(),
    healthCheck: vi.fn(),
  },
}));
const mockKnowledgeHubApiService = knowledgeHubApiService as vi.Mocked<
  typeof knowledgeHubApiService
>;

// Export the mock for use in tests
export { mockKnowledgeHubApiService };

// Mock LearningProgressService
const mockUpdateItemStatus = vi.fn();
vi.mock('@/services/learningProgressService.ts', () => ({
  __esModule: true,
  default: {
    getInstance: vi.fn(() => ({
      updateItemStatus: mockUpdateItemStatus,
    })),
  },
}));

// Test data
export const mockContentItems: ContentItem[] = [
  {
    id: '1',
    title: 'Advanced Sterilization Techniques',
    category: 'Courses',
    status: 'In Progress',
    progress: 75,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Learn advanced sterilization procedures and best practices',
  },
  {
    id: '2',
    title: 'Infection Control Protocols',
    category: 'Procedures',
    status: 'Not Started',
    progress: 0,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    description:
      'Essential infection control procedures for healthcare settings',
  },
  {
    id: '3',
    title: 'Safety Guidelines 2024',
    category: 'Policies',
    status: 'Completed',
    progress: 100,
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    description: 'Updated safety guidelines and compliance requirements',
  },
];

export const mockUser = {
  id: 'test-user-123',
  role: 'Administrator' as UserRole,
};

export const mockStudentUser = {
  id: 'test-user',
  role: 'Student' as UserRole,
};

export const mockNurseUser = {
  id: 'nurse',
  role: 'Nurse' as UserRole,
};

// Test helper functions
export const renderKnowledgeHubStore = () => {
  return renderHook(() => useKnowledgeHubStore());
};

export const resetStoreState = () => {
  act(() => {
    useKnowledgeHubStore.getState().setContent([]);
    useKnowledgeHubStore.getState().setError(null);
    useKnowledgeHubStore.getState().setLoading(false);
    useKnowledgeHubStore.getState().setCurrentUser(null);
    useKnowledgeHubStore.getState().setSelectedCategory('');
    useKnowledgeHubStore.getState().setValidationError(null);
  });
};

export const setupDefaultMocks = () => {
  // Reset LearningProgressService mock
  mockUpdateItemStatus.mockClear();

  // Setup default API mocks
  mockKnowledgeHubApiService.fetchContent.mockResolvedValue(mockContentItems);
  mockKnowledgeHubApiService.updateContentStatus.mockImplementation(
    async (id: string, status: string) => {
      const item = mockContentItems.find((item) => item.id === id);
      if (!item) {
        throw new ContentNotFoundError(id);
      }
      return { ...item, status: status as ContentStatus };
    }
  );
  mockKnowledgeHubApiService.updateContent.mockImplementation(
    async (id: string, updates: Partial<ContentItem>) => {
      const item = mockContentItems.find((item) => item.id === id);
      if (!item) {
        throw new ContentNotFoundError(id);
      }
      return { ...item, ...updates };
    }
  );
  mockKnowledgeHubApiService.deleteContent.mockResolvedValue(undefined);
  mockKnowledgeHubApiService.getContentStats.mockResolvedValue({
    total: 3,
    byCategory: {
      Courses: 1,
      Procedures: 1,
      Policies: 1,
    },
    byStatus: {
      'In Progress': 1,
      'Not Started': 1,
      Completed: 1,
    },
  });
  mockKnowledgeHubApiService.getRateLimitStats.mockResolvedValue({
    remaining: 100,
    resetTime: Date.now() + 3600000,
  });
};

export const setupStoreWithContent = () => {
  act(() => {
    useKnowledgeHubStore.getState().setContent(mockContentItems);
    useKnowledgeHubStore.getState().setCurrentUser(mockUser);
  });
};

export const setupStoreWithUser = (
  user: { id: string; role: UserRole } | null
) => {
  act(() => {
    useKnowledgeHubStore.getState().setCurrentUser(user);
  });
};

// Error factories
export const createNetworkError = (
  message: string = 'Network connection failed'
) => {
  return new NetworkError(message);
};

export const createValidationError = (
  message: string = 'Invalid content data'
) => {
  return new ValidationError(message);
};

export const createApiError = (type: ErrorType, message: string) => {
  return new ApiError(type, message);
};

export const createContentNotFoundError = (id: string) => {
  return new ContentNotFoundError(id);
};

// Test expectations
export const expectDefaultStoreState = (result: {
  current: KnowledgeHubStore;
}) => {
  expect(result.current.content).toEqual([]);
  expect(result.current.isLoading).toBe(false);
  expect(result.current.error).toBeNull();
  expect(result.current.currentUser).toBeNull();
  expect(result.current.selectedCategory).toBe('');
  expect(result.current.validationError).toBeNull();
  expect(result.current.selectedContent).toEqual([]);
  expect(result.current.categoryCounts).toEqual({
    Courses: 0,
    Procedures: 0,
    Policies: 0,
    'Learning Pathways': 0,
    Advanced: 0,
  });
};

export const expectAdminPermissions = (result: {
  current: KnowledgeHubStore;
}) => {
  expect(result.current.permissions.canDeleteContent).toBe(true);
  expect(result.current.permissions.canUpdateStatus).toBe(true);
  expect(result.current.permissions.canCreateContent).toBe(true);
  expect(result.current.canDeleteContent()).toBe(true);
  expect(result.current.canUpdateStatus()).toBe(true);
  expect(result.current.canCreateContent()).toBe(true);
  expect(result.current.canViewAllCategories()).toBe(true);
  expect(result.current.canManageUsers()).toBe(true);
};

export const expectStudentPermissions = (result: {
  current: KnowledgeHubStore;
}) => {
  expect(result.current.permissions.canDeleteContent).toBe(false);
  expect(result.current.permissions.canUpdateStatus).toBe(false);
  expect(result.current.permissions.canCreateContent).toBe(false);
  expect(result.current.canDeleteContent()).toBe(false);
  expect(result.current.canUpdateStatus()).toBe(false);
  expect(result.current.canCreateContent()).toBe(false);
  expect(result.current.canViewAllCategories()).toBe(false);
  expect(result.current.canManageUsers()).toBe(false);
};

export const expectNursePermissions = (result: {
  current: KnowledgeHubStore;
}) => {
  expect(result.current.permissions.canDeleteContent).toBe(false);
  expect(result.current.permissions.canUpdateStatus).toBe(true);
  expect(result.current.permissions.canCreateContent).toBe(false);
  expect(result.current.canDeleteContent()).toBe(false);
  expect(result.current.canUpdateStatus()).toBe(true);
  expect(result.current.canCreateContent()).toBe(false);
  expect(result.current.canViewAllCategories()).toBe(true);
  expect(result.current.canManageUsers()).toBe(false);
};
