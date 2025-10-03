import { ContentItem, ContentStatus, ContentCategory } from '../types';
import { UserRole, Permission } from '../utils/permissions';
import { KnowledgeHubError } from '../types/errors';
import { PerformanceMetric, PerformanceMonitor } from './performanceMonitoring';

// Helper: get all possible categories
export const ALL_CATEGORIES: ContentCategory[] = [
  'Courses',
  'Procedures',
  'Policies',
  'Learning Pathways',
  'Advanced',
];

// Store state interface
export interface KnowledgeHubState {
  // UI State
  selectedCategory: string;
  validationError: string | null;

  // Auth State
  currentUser: { id: string; role: UserRole } | null;

  // Data State
  content: ContentItem[];
  isLoading: boolean;
  error: KnowledgeHubError | null;

  // Rate limiting state
  rateLimitStats: {
    currentRequests: number;
    currentBurstRequests: number;
    maxRequests: number;
    maxBurstRequests: number;
    windowMs: number;
  } | null;
  isRateLimited: boolean;

  // Performance monitoring state
  performanceMonitor: PerformanceMonitor;
  performanceAlerts: {
    slowOperations: PerformanceMetric[];
    highErrorRate: boolean;
    performanceDegraded: boolean;
  };

  // Computed values
  selectedContent: ContentItem[];
  categoryCounts: Record<string, number>;
  permissions: Permission;
}

// Store actions interface
export interface KnowledgeHubActions {
  // UI Actions
  setSelectedCategory: (category: string) => void;
  setValidationError: (error: string | null) => void;
  clearValidationError: () => void;

  // Auth Actions
  setCurrentUser: (user: { id: string; role: UserRole } | null) => void;

  // Data Actions
  setContent: (content: ContentItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: KnowledgeHubError | null) => void;

  // Rate limiting actions
  updateRateLimitStats: () => void;
  resetRateLimiter: () => void;
  setRateLimited: (isRateLimited: boolean) => void;

  // Performance monitoring actions
  recordPerformanceMetric: (
    metric: Omit<PerformanceMetric, 'timestamp'>
  ) => void;
  clearPerformanceMetrics: () => void;
  updatePerformanceStats: () => void;
  setPerformanceMonitoring: (enabled: boolean) => void;
  getPerformanceReport: () => import('./performanceMonitoring').PerformanceStats;

  // Business Logic Actions
  updateContentStatus: (id: string, status: ContentStatus) => Promise<void>;
  deleteContent: (id: string) => Promise<void>;
  refetchContent: () => Promise<void>;
  updateContent: (id: string, updates: Partial<ContentItem>) => Promise<void>;
  initializeContent: () => Promise<void>;

  // Permission checks
  canDeleteContent: () => boolean;
  canUpdateStatus: () => boolean;
  canCreateContent: () => boolean;
  canViewAllCategories: () => boolean;
  canManageUsers: () => boolean;
}

// Combined store type
export type KnowledgeHubStore = KnowledgeHubState & KnowledgeHubActions;
