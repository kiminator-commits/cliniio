import { useKnowledgeHubStore } from './knowledgeHubStore';

// Basic state selector hooks
export const useSelectedCategory = () =>
  useKnowledgeHubStore((state) => state.selectedCategory);
export const useSelectedContent = () =>
  useKnowledgeHubStore((state) => state.selectedContent);
export const useContent = () => useKnowledgeHubStore((state) => state.content);
export const useLoading = () =>
  useKnowledgeHubStore((state) => state.isLoading);
export const useError = () => useKnowledgeHubStore((state) => state.error);
export const useValidationError = () =>
  useKnowledgeHubStore((state) => state.validationError);
export const useCurrentUser = () =>
  useKnowledgeHubStore((state) => state.currentUser);
export const usePermissions = () =>
  useKnowledgeHubStore((state) => state.permissions);

// Computed selectors
export const useCategoryCount = (category: string) =>
  useKnowledgeHubStore((state) => state.categoryCounts[category] || 0);

// Permission selector hooks
export const useCanDeleteContent = () =>
  useKnowledgeHubStore((state) => state.canDeleteContent());
export const useCanUpdateStatus = () =>
  useKnowledgeHubStore((state) => state.canUpdateStatus());
export const useCanCreateContent = () =>
  useKnowledgeHubStore((state) => state.canCreateContent());
export const useCanViewAllCategories = () =>
  useKnowledgeHubStore((state) => state.canViewAllCategories());
export const useCanManageUsers = () =>
  useKnowledgeHubStore((state) => state.canManageUsers());

// Action selector hooks
export const useUpdateContentStatus = () =>
  useKnowledgeHubStore((state) => state.updateContentStatus);
export const useDeleteContent = () =>
  useKnowledgeHubStore((state) => state.deleteContent);
export const useUpdateContent = () =>
  useKnowledgeHubStore((state) => state.updateContent);
export const useInitializeContent = () =>
  useKnowledgeHubStore((state) => state.initializeContent);
export const useRefetchContent = () =>
  useKnowledgeHubStore((state) => state.refetchContent);

// Rate limiting selector hooks
export const useRateLimitStats = () =>
  useKnowledgeHubStore((state) => state.rateLimitStats);
export const useIsRateLimited = () =>
  useKnowledgeHubStore((state) => state.isRateLimited);
export const useUpdateRateLimitStats = () =>
  useKnowledgeHubStore((state) => state.updateRateLimitStats);
export const useResetRateLimiter = () =>
  useKnowledgeHubStore((state) => state.resetRateLimiter);
export const useSetRateLimited = () =>
  useKnowledgeHubStore((state) => state.setRateLimited);

// Performance monitoring selector hooks
export const usePerformanceMonitor = () =>
  useKnowledgeHubStore((state) => state.performanceMonitor);
export const usePerformanceStats = () =>
  useKnowledgeHubStore((state) => state.performanceMonitor.stats);
export const usePerformanceAlerts = () =>
  useKnowledgeHubStore((state) => state.performanceAlerts);
export const usePerformanceMetrics = () =>
  useKnowledgeHubStore((state) => state.performanceMonitor.metrics);

// Performance monitoring action hooks
export const useRecordPerformanceMetric = () =>
  useKnowledgeHubStore((state) => state.recordPerformanceMetric);
export const useClearPerformanceMetrics = () =>
  useKnowledgeHubStore((state) => state.clearPerformanceMetrics);
export const useUpdatePerformanceStats = () =>
  useKnowledgeHubStore((state) => state.updatePerformanceStats);
export const useSetPerformanceMonitoring = () =>
  useKnowledgeHubStore((state) => state.setPerformanceMonitoring);
export const useGetPerformanceReport = () =>
  useKnowledgeHubStore((state) => state.getPerformanceReport);

// Performance monitoring computed selectors
export const useIsPerformanceMonitoringEnabled = () =>
  useKnowledgeHubStore((state) => state.performanceMonitor.isEnabled);
export const useSlowOperations = () =>
  useKnowledgeHubStore((state) => state.performanceAlerts.slowOperations);
export const useHasHighErrorRate = () =>
  useKnowledgeHubStore((state) => state.performanceAlerts.highErrorRate);
export const useIsPerformanceDegraded = () =>
  useKnowledgeHubStore((state) => state.performanceAlerts.performanceDegraded);
