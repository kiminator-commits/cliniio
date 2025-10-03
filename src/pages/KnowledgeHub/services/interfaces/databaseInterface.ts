// Simple database interface to reduce tight coupling
export interface Article {
  id: string;
  status: string;
  title: string;
}

export interface LearningPath {
  id: string;
  is_active: boolean;
  title: string;
}

export interface DatabaseInterface {
  // Article operations
  updateArticleStatus(id: string, status: string): Promise<{ error?: string }>;
  updateArticlesStatus(
    ids: string[],
    status: string
  ): Promise<{ error?: string; count?: number }>;
  deleteArticles(ids: string[]): Promise<{ error?: string; count?: number }>;

  // Learning path operations
  updateLearningPathStatus(
    id: string,
    isActive: boolean
  ): Promise<{ error?: string }>;
  updateLearningPathsStatus(
    ids: string[],
    isActive: boolean
  ): Promise<{ error?: string; count?: number }>;
  deleteLearningPaths(
    ids: string[]
  ): Promise<{ error?: string; count?: number }>;

  // Query operations
  getArticleById(id: string): Promise<{ data: Article | null; error?: string }>;
  getLearningPathById(
    id: string
  ): Promise<{ data: LearningPath | null; error?: string }>;
}
