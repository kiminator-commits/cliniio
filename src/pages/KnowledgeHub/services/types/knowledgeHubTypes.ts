// ============================================================================
// KNOWLEDGE HUB SERVICE TYPES - SIMPLIFIED
// ============================================================================

// ============================================================================
// CONTENT STATUS TYPES
// ============================================================================

export type ContentStatus = 'draft' | 'published' | 'archived' | 'review';
export type LearningPathStatus = 'active' | 'inactive';

// ============================================================================
// HUB CONTENT TYPES
// ============================================================================

export interface HubContentItem {
  id: string;
  title: string;
  category: string;
  status: ContentStatus;
  description?: string;
  tags?: string[];
  domain: string;
  contentType: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
  estimatedDuration?: number;
  difficultyLevel: string;
  department?: string;
  authorId?: string;
  assignedBy?: string;
  isRepeat: boolean;
  isActive: boolean;
  content: Record<string, unknown>;
  media: Record<string, unknown>[];
  dueDate?: string;
  progress?: number;
}

export interface HubLearningPath {
  id: string;
  title: string;
  description?: string;
  steps: string[];
  status: LearningPathStatus;
  createdAt: string;
  updatedAt: string;
  difficultyLevel?: string;
  author?: string;
  publicationDate?: string;
  readingTime?: number;
  difficultyScore?: number;
  completionRequirements?: string[];
  estimatedTime?: number;
  prerequisites?: string[];
  learningObjectives?: string[];
  certificationRequired?: boolean;
  lastAccessed?: string;
}

// ============================================================================
// QUIZ TYPES
// ============================================================================

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string;
  explanation?: string;
  question_order: number;
  points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  category_id: string;
  facility_id: string;
  passing_score: number;
  time_limit_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  status: 'started' | 'completed' | 'abandoned';
  score_percentage: number;
  total_questions: number;
  correct_answers: number;
  started_at: string;
  completed_at?: string;
  time_spent_seconds?: number;
  answers?: QuizAnswer[];
}

export interface QuizAnswer {
  question_id: string;
  user_answer: string;
  is_correct: boolean;
  time_spent_seconds?: number;
}

// ============================================================================
// SIMPLE RESPONSE TYPES
// ============================================================================

/**
 * Simple response for single operations
 */
export interface KnowledgeHubResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Simple response for bulk operations
 */
export interface BulkResponse {
  success: boolean;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

/**
 * Simple response for create operations
 */
export interface CreateResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Simple response for update operations
 */
export interface UpdateResponse<T> {
  data: T | null;
  error: string | null;
}

/**
 * Simple response for delete operations
 */
export interface DeleteResponse {
  success: boolean;
  error: string | null;
}

// ============================================================================
// BULK OPERATION TYPES
// ============================================================================

export interface BulkOperationProgress {
  operationId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  errors: string[];
  // Additional properties for UI components
  stage: string;
  message: string;
  percentage: number;
  current: number;
  total: number;
}

export interface BulkOperationResult {
  operationId: string;
  success: boolean;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  results: Array<{
    id: string;
    success: boolean;
    error?: string;
  }>;
}

export interface BulkOperationOptions {
  batchSize?: number;
  retryAttempts?: number;
  timeout?: number;
  validateOnly?: boolean;
}

// ============================================================================
// MISSING TYPES
// ============================================================================

export interface KnowledgeArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  status: ContentStatus;
  created_at: string;
  updated_at: string;
  // Add missing properties that the transformer needs
  published_at?: string;
  summary?: string;
  tags?: string[];
  difficulty_level?: string;
  last_modified_at?: string;
  author?: string;
  publication_date?: string;
  reading_time?: number;
  difficulty_score?: number;
  completion_requirements?: string[];
  estimated_time?: number;
  prerequisites?: string[];
  learning_objectives?: string[];
  certification_required?: boolean;
  last_accessed?: string;
}

export interface KnowledgeCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface KnowledgeLearningPath {
  id: string;
  title: string;
  description?: string;
  steps: string[];
  status: LearningPathStatus;
  // Add missing properties that the transformer needs
  created_at?: string;
  difficulty_level?: string;
  updated_at?: string;
  author?: string;
  publication_date?: string;
  reading_time?: number;
  difficulty_score?: number;
  completion_requirements?: string[];
  estimated_time?: number;
  prerequisites?: string[];
  learning_objectives?: string[];
  certification_required?: boolean;
  last_accessed?: string;
}

export interface RecentUpdate {
  id: string;
  type: string;
  title: string;
  timestamp: string;
  time: string;
}

export interface KnowledgeUserProgress {
  id: string;
  user_id: string;
  content_id: string;
  progress: number;
  status: string;
  article_id?: string;
  learning_path_id?: string;
  completion_percentage?: number;
}

export interface KnowledgeArticleView {
  id: string;
  article_id: string;
  user_id: string;
  viewed_at: string;
  created_at: string;
}

export interface KnowledgeQuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  completed_at: string;
  status: string;
  started_at: string;
  score_percentage: number;
}

export interface KnowledgeArticleRating {
  id: string;
  article_id: string;
  user_id: string;
  rating: number;
  created_at: string;
}

export interface KnowledgeBookmark {
  id: string;
  content_id: string;
  user_id: string;
  created_at: string;
  article_id: string;
}

export interface BulkUpdateResult {
  success: boolean;
  updatedCount: number;
  processedCount: number;
  errors: string[];
}

export interface BulkDeleteResult {
  success: boolean;
  deletedCount: number;
  processedCount: number;
  errors: string[];
}

export interface BulkExportResult {
  success: boolean;
  exportedCount: number;
  downloadUrl?: string;
  errors: string[];
}

// ============================================================================
// FILTER AND OPTION TYPES
// ============================================================================

/**
 * Content filters
 */
export interface ContentFilters {
  search?: string;
  category?: string;
  status?: ContentStatus;
  author?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Learning path filters
 */
export interface LearningPathFilters {
  search?: string;
  status?: LearningPathStatus;
  category?: string;
}

/**
 * Query options
 */
export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  includeArchived?: boolean;
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

/**
 * Standardized Knowledge Hub Service Interface
 */
export interface KnowledgeHubService {
  // === CONTENT OPERATIONS ===

  /**
   * Get all content items
   */
  getAllContent(
    filters?: ContentFilters,
    options?: QueryOptions
  ): Promise<KnowledgeHubResponse<HubContentItem[]>>;

  /**
   * Get content by ID
   */
  getContentById(id: string): Promise<KnowledgeHubResponse<HubContentItem>>;

  /**
   * Create content
   */
  createContent(
    content: Omit<HubContentItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CreateResponse<HubContentItem>>;

  /**
   * Update content
   */
  updateContent(
    id: string,
    updates: Partial<HubContentItem>
  ): Promise<UpdateResponse<HubContentItem>>;

  /**
   * Delete content
   */
  deleteContent(id: string): Promise<DeleteResponse>;

  /**
   * Update content status
   */
  updateContentStatus(
    id: string,
    status: ContentStatus
  ): Promise<UpdateResponse<HubContentItem>>;

  // === BULK CONTENT OPERATIONS ===

  /**
   * Bulk update content status
   */
  bulkUpdateContentStatus(
    ids: string[],
    status: ContentStatus
  ): Promise<BulkResponse>;

  /**
   * Bulk delete content
   */
  bulkDeleteContent(ids: string[]): Promise<BulkResponse>;

  // === LEARNING PATH OPERATIONS ===

  /**
   * Get all learning paths
   */
  getAllLearningPaths(
    filters?: LearningPathFilters,
    options?: QueryOptions
  ): Promise<KnowledgeHubResponse<HubLearningPath[]>>;

  /**
   * Get learning path by ID
   */
  getLearningPathById(
    id: string
  ): Promise<KnowledgeHubResponse<HubLearningPath>>;

  /**
   * Create learning path
   */
  createLearningPath(
    path: Omit<HubLearningPath, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CreateResponse<HubLearningPath>>;

  /**
   * Update learning path
   */
  updateLearningPath(
    id: string,
    updates: Partial<HubLearningPath>
  ): Promise<UpdateResponse<HubLearningPath>>;

  /**
   * Delete learning path
   */
  deleteLearningPath(id: string): Promise<DeleteResponse>;

  /**
   * Update learning path status
   */
  updateLearningPathStatus(
    id: string,
    isActive: boolean
  ): Promise<UpdateResponse<HubLearningPath>>;

  // === BULK LEARNING PATH OPERATIONS ===

  /**
   * Bulk update learning path status
   */
  bulkUpdateLearningPathStatus(
    ids: string[],
    isActive: boolean
  ): Promise<BulkResponse>;

  /**
   * Bulk delete learning paths
   */
  bulkDeleteLearningPaths(ids: string[]): Promise<BulkResponse>;

  // === CATEGORY OPERATIONS ===

  /**
   * Get all categories
   */
  getCategories(): Promise<KnowledgeHubResponse<string[]>>;

  /**
   * Add category
   */
  addCategory(category: string): Promise<CreateResponse<string>>;

  /**
   * Delete category
   */
  deleteCategory(category: string): Promise<DeleteResponse>;

  // === USER ACTIVITY ===

  /**
   * Get recent user activity
   */
  getRecentUserActivity(): Promise<
    KnowledgeHubResponse<Record<string, unknown>[]>
  >;

  // === LEGACY COMPATIBILITY ===

  /**
   * Legacy method for backward compatibility
   */
  fetchAllKnowledgeData(): Promise<Record<string, unknown>>;

  /**
   * Legacy method for backward compatibility
   */
  fetchKnowledgeArticles(): Promise<HubContentItem[]>;

  /**
   * Legacy method for backward compatibility
   */
  addKnowledgeArticle(article: HubContentItem): Promise<HubContentItem>;

  /**
   * Legacy method for backward compatibility
   */
  updateKnowledgeArticle(
    id: string,
    article: Partial<HubContentItem>
  ): Promise<HubContentItem>;

  /**
   * Legacy method for backward compatibility
   */
  deleteKnowledgeArticle(id: string): Promise<void>;
}
