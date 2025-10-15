import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { getPermissionsForRole, UserRole } from '../utils/permissions';
import { DEPRECATED_MOCK_NOTICE } from '../services/deprecatedNotice';
import { ContentItem } from '../types';
import { KnowledgeHubError } from '../types/errors';
import { KnowledgeHubStore, ALL_CATEGORIES } from './knowledgeHubTypes';
import {
  createPerformanceMonitor,
  calculatePerformanceStats,
  cleanupOldMetrics,
  detectPerformanceAlerts,
  PerformanceMetric,
} from './performanceMonitoring';
import { createBusinessActions } from './knowledgeHubActions';

// Create the store
export const useKnowledgeHubStore = create<KnowledgeHubStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      selectedCategory: '',
      validationError: null,
      currentUser: null,
      content: [],
      isLoading: false,
      error: null,
      rateLimitStats: null,
      isRateLimited: false,
      performanceMonitor: createPerformanceMonitor(),
      performanceAlerts: {
        slowOperations: [],
        highErrorRate: false,
        performanceDegraded: false,
      },
      selectedContent: [],
      categoryCounts: {},
      permissions: getPermissionsForRole('User'),

      // UI Actions
      setSelectedCategory: (category: string) => {
        set({ selectedCategory: category });
        // Update selected content when category changes
        const { content } = get();
        const selectedContent = content.filter(
          (item) => item.category === category
        );
        set({ selectedContent });
      },

      setValidationError: (error: string | null) =>
        set({ validationError: error }),
      clearValidationError: () => set({ validationError: null }),

      // Auth Actions
      setCurrentUser: (user: { id: string; role: UserRole } | null) => {
        if (user) {
          // Validate the role and fallback to 'User' if invalid
          const validRoles: UserRole[] = [
            'Administrator',
            'Physician',
            'Nurse',
            'Technician',
            'Student',
            'User',
          ];
          const validRole = validRoles.includes(user.role) ? user.role : 'User';
          const permissions = getPermissionsForRole(validRole);
          set({ currentUser: { ...user, role: validRole }, permissions });
        } else {
          const permissions = getPermissionsForRole('User');
          set({ currentUser: null, permissions });
        }
      },

      // Data Actions
      setContent: (content: ContentItem[]) => {
        const startTime = performance.now();
        const { selectedCategory } = get();
        const selectedContent = selectedCategory
          ? content.filter((item) => item.category === selectedCategory)
          : [];

        const categoryCounts = content.reduce(
          (acc, item) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        );

        ALL_CATEGORIES.forEach((cat) => {
          if (!(cat in categoryCounts)) categoryCounts[cat] = 0;
        });

        set({ content, selectedContent, categoryCounts });

        // Record performance metric for UI operation
        const duration = performance.now() - startTime;
        get().recordPerformanceMetric({
          operation: 'setContent',
          duration,
          success: true,
          metadata: {
            contentCount: content.length,
            selectedCategory,
            selectedContentCount: selectedContent.length,
          },
        });
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: KnowledgeHubError | null) => set({ error }),

      // Rate limiting actions
      updateRateLimitStats: () => {
        console.warn(DEPRECATED_MOCK_NOTICE);
        const stats = {
          currentRequests: 0,
          windowStart: Date.now(),
          requestsInWindow: 0,
        };
        set({ rateLimitStats: stats });
      },

      resetRateLimiter: () => {
        console.warn(DEPRECATED_MOCK_NOTICE);
        set({ rateLimitStats: null, isRateLimited: false });
      },

      setRateLimited: (isRateLimited: boolean) => set({ isRateLimited }),

      // Performance monitoring actions
      recordPerformanceMetric: (
        metric: Omit<PerformanceMetric, 'timestamp'>
      ) => {
        const { performanceMonitor } = get();

        if (!performanceMonitor.isEnabled) return;

        const fullMetric: PerformanceMetric = {
          ...metric,
          timestamp: Date.now(),
        };

        let updatedMetrics = [...performanceMonitor.metrics, fullMetric];

        // Clean up old metrics
        updatedMetrics = cleanupOldMetrics(updatedMetrics);

        // Limit the number of stored metrics
        if (updatedMetrics.length > performanceMonitor.maxMetrics) {
          updatedMetrics = updatedMetrics.slice(-performanceMonitor.maxMetrics);
        }

        const updatedStats = calculatePerformanceStats(updatedMetrics);
        const updatedAlerts = detectPerformanceAlerts(updatedStats);

        set({
          performanceMonitor: {
            ...performanceMonitor,
            metrics: updatedMetrics,
            stats: updatedStats,
          },
          performanceAlerts: updatedAlerts,
        });
      },

      clearPerformanceMetrics: () => {
        const resetMonitor = createPerformanceMonitor();

        set({
          performanceMonitor: resetMonitor,
          performanceAlerts: {
            slowOperations: [],
            highErrorRate: false,
            performanceDegraded: false,
          },
        });
      },

      updatePerformanceStats: () => {
        const { performanceMonitor } = get();
        const updatedStats = calculatePerformanceStats(
          performanceMonitor.metrics
        );
        const updatedAlerts = detectPerformanceAlerts(updatedStats);

        set({
          performanceMonitor: {
            ...performanceMonitor,
            stats: updatedStats,
          },
          performanceAlerts: updatedAlerts,
        });
      },

      setPerformanceMonitoring: (enabled: boolean) => {
        const { performanceMonitor } = get();

        set({
          performanceMonitor: {
            ...performanceMonitor,
            isEnabled: enabled,
          },
        });
      },

      getPerformanceReport: () => {
        const { performanceMonitor } = get();
        return performanceMonitor.stats;
      },

      // Business Logic Actions
      ...createBusinessActions(get as () => KnowledgeHubStore, set),

      // Additional required methods
      refetchContent: async () => {
        // Call the business logic initializeContent method to refresh content
        const { initializeContent } = get();
        await initializeContent();
      },

      // Permission checks
      canDeleteContent: () => {
        const { permissions } = get();
        return permissions.canDeleteContent;
      },

      canUpdateStatus: () => {
        const { permissions } = get();
        return permissions.canUpdateStatus;
      },

      canCreateContent: () => {
        const { permissions } = get();
        return permissions.canCreateContent;
      },

      canViewAllCategories: () => {
        const { permissions } = get();
        return permissions.canViewAllCategories;
      },

      canManageUsers: () => {
        const { permissions } = get();
        return permissions.canManageUsers;
      },
    }))
  )
);

// Re-export selector hooks from the dedicated selectors file
export * from './knowledgeHubSelectors';
