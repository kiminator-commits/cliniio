import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';

// Import all slices
import { UISlice, createUISlice } from './slices/uiSlice';
import { AuthSlice, createAuthSlice } from './slices/authSlice';
import { ContentSlice, createContentSlice } from './slices/contentSlice';
import {
  PerformanceSlice,
  createPerformanceSlice,
} from './slices/performanceSlice';
import { RateLimitSlice, createRateLimitSlice } from './slices/rateLimitSlice';
import {
  BusinessLogicSlice,
  createBusinessLogicSlice,
} from './slices/businessLogicSlice';

// Combined store type
export type KnowledgeHubStoreWithSlices = UISlice &
  AuthSlice &
  ContentSlice &
  PerformanceSlice &
  RateLimitSlice &
  BusinessLogicSlice;

// Create the store with all slices
export const useKnowledgeHubStoreWithSlices =
  create<KnowledgeHubStoreWithSlices>()(
    devtools(
      subscribeWithSelector((...args) => ({
        ...createUISlice(...args),
        ...createAuthSlice(...args),
        ...createContentSlice(...args),
        ...createPerformanceSlice(...args),
        ...createRateLimitSlice(...args),
        ...createBusinessLogicSlice(...args),
      }))
    )
  );

// Selector hooks for UI state
export const useSelectedCategory = () =>
  useKnowledgeHubStoreWithSlices((state) => state.selectedCategory);
export const useValidationError = () =>
  useKnowledgeHubStoreWithSlices((state) => state.validationError);

// Action hooks for UI
export const useSetSelectedCategory = () =>
  useKnowledgeHubStoreWithSlices((state) => state.setSelectedCategory);
export const useSetValidationError = () =>
  useKnowledgeHubStoreWithSlices((state) => state.setValidationError);
export const useClearValidationError = () =>
  useKnowledgeHubStoreWithSlices((state) => state.clearValidationError);

// Selector hooks for auth state
export const useCurrentUser = () =>
  useKnowledgeHubStoreWithSlices((state) => state.currentUser);
export const usePermissions = () =>
  useKnowledgeHubStoreWithSlices((state) => state.permissions);

// Action hooks for auth
export const useSetCurrentUser = () =>
  useKnowledgeHubStoreWithSlices((state) => state.setCurrentUser);

// Permission selector hooks
export const useCanDeleteContent = () =>
  useKnowledgeHubStoreWithSlices((state) => state.canDeleteContent());
export const useCanUpdateStatus = () =>
  useKnowledgeHubStoreWithSlices((state) => state.canUpdateStatus());
export const useCanCreateContent = () =>
  useKnowledgeHubStoreWithSlices((state) => state.canCreateContent());
export const useCanViewAllCategories = () =>
  useKnowledgeHubStoreWithSlices((state) => state.canViewAllCategories());
export const useCanManageUsers = () =>
  useKnowledgeHubStoreWithSlices((state) => state.canManageUsers());

// Selector hooks for content state
export const useContent = () =>
  useKnowledgeHubStoreWithSlices((state) => state.content);
export const useSelectedContent = () =>
  useKnowledgeHubStoreWithSlices((state) => state.selectedContent);
export const useLoading = () =>
  useKnowledgeHubStoreWithSlices((state) => state.isLoading);
export const useError = () =>
  useKnowledgeHubStoreWithSlices((state) => state.error);
export const useCategoryCounts = () =>
  useKnowledgeHubStoreWithSlices((state) => state.categoryCounts);

// Action hooks for content
export const useSetContent = () =>
  useKnowledgeHubStoreWithSlices((state) => state.setContent);
export const useSetLoading = () =>
  useKnowledgeHubStoreWithSlices((state) => state.setLoading);
export const useSetError = () =>
  useKnowledgeHubStoreWithSlices((state) => state.setError);
export const useUpdateSelectedContent = () =>
  useKnowledgeHubStoreWithSlices((state) => state.updateSelectedContent);

// Computed selectors
export const useCategoryCount = (category: string) =>
  useKnowledgeHubStoreWithSlices(
    (state) => state.categoryCounts[category] || 0
  );

// Selector hooks for performance state
export const usePerformanceMonitor = () =>
  useKnowledgeHubStoreWithSlices((state) => state.performanceMonitor);
export const usePerformanceStats = () =>
  useKnowledgeHubStoreWithSlices((state) => state.performanceMonitor.stats);
export const usePerformanceAlerts = () =>
  useKnowledgeHubStoreWithSlices((state) => state.performanceAlerts);
export const usePerformanceMetrics = () =>
  useKnowledgeHubStoreWithSlices((state) => state.performanceMonitor.metrics);

// Action hooks for performance
export const useRecordPerformanceMetric = () =>
  useKnowledgeHubStoreWithSlices((state) => state.recordPerformanceMetric);
export const useClearPerformanceMetrics = () =>
  useKnowledgeHubStoreWithSlices((state) => state.clearPerformanceMetrics);
export const useUpdatePerformanceStats = () =>
  useKnowledgeHubStoreWithSlices((state) => state.updatePerformanceStats);
export const useSetPerformanceMonitoring = () =>
  useKnowledgeHubStoreWithSlices((state) => state.setPerformanceMonitoring);
export const useGetPerformanceReport = () =>
  useKnowledgeHubStoreWithSlices((state) => state.getPerformanceReport);

// Performance monitoring computed selectors
export const useIsPerformanceMonitoringEnabled = () =>
  useKnowledgeHubStoreWithSlices((state) => state.performanceMonitor.isEnabled);
export const useSlowOperations = () =>
  useKnowledgeHubStoreWithSlices(
    (state) => state.performanceAlerts.slowOperations
  );
export const useHasHighErrorRate = () =>
  useKnowledgeHubStoreWithSlices(
    (state) => state.performanceAlerts.highErrorRate
  );
export const useIsPerformanceDegraded = () =>
  useKnowledgeHubStoreWithSlices(
    (state) => state.performanceAlerts.performanceDegraded
  );

// Selector hooks for rate limiting state
export const useRateLimitStats = () =>
  useKnowledgeHubStoreWithSlices((state) => state.rateLimitStats);
export const useIsRateLimited = () =>
  useKnowledgeHubStoreWithSlices((state) => state.isRateLimited);

// Action hooks for rate limiting
export const useUpdateRateLimitStats = () =>
  useKnowledgeHubStoreWithSlices((state) => state.updateRateLimitStats);
export const useResetRateLimiter = () =>
  useKnowledgeHubStoreWithSlices((state) => state.resetRateLimiter);
export const useSetRateLimited = () =>
  useKnowledgeHubStoreWithSlices((state) => state.setRateLimited);

// Action hooks for business logic
export const useUpdateContentStatus = () =>
  useKnowledgeHubStoreWithSlices((state) => state.updateContentStatus);
export const useDeleteContent = () =>
  useKnowledgeHubStoreWithSlices((state) => state.deleteContent);
export const useUpdateContent = () =>
  useKnowledgeHubStoreWithSlices((state) => state.updateContent);
export const useInitializeContent = () =>
  useKnowledgeHubStoreWithSlices((state) => state.initializeContent);
export const useRefetchContent = () =>
  useKnowledgeHubStoreWithSlices((state) => state.refetchContent);
