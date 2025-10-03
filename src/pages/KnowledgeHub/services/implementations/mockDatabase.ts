import {
  DatabaseInterface,
  Article,
  LearningPath,
} from '../interfaces/databaseInterface';

// Simple mock database for testing - demonstrates reduced tight coupling
export class MockDatabase implements DatabaseInterface {
  private articles = new Map<string, Article>();
  private learningPaths = new Map<string, LearningPath>();

  constructor() {
    // Initialize with some test data
    this.articles.set('test-article-1', {
      id: 'test-article-1',
      status: 'published',
      title: 'Test Article',
    });
    this.learningPaths.set('test-path-1', {
      id: 'test-path-1',
      is_active: true,
      title: 'Test Path',
    });
  }

  async updateArticleStatus(
    id: string,
    status: string
  ): Promise<{ error?: string }> {
    const article = this.articles.get(id);
    if (!article) {
      return { error: 'Article not found' };
    }
    article.status = status;
    return {};
  }

  async updateArticlesStatus(
    ids: string[],
    status: string
  ): Promise<{ error?: string; count?: number }> {
    let count = 0;
    for (const id of ids) {
      const result = await this.updateArticleStatus(id, status);
      if (!result.error) {
        count++;
      }
    }
    return { count };
  }

  async deleteArticles(
    ids: string[]
  ): Promise<{ error?: string; count?: number }> {
    return this.updateArticlesStatus(ids, 'archived');
  }

  async updateLearningPathStatus(
    id: string,
    isActive: boolean
  ): Promise<{ error?: string }> {
    const path = this.learningPaths.get(id);
    if (!path) {
      return { error: 'Learning path not found' };
    }
    path.is_active = isActive;
    return {};
  }

  async updateLearningPathsStatus(
    ids: string[],
    isActive: boolean
  ): Promise<{ error?: string; count?: number }> {
    let count = 0;
    for (const id of ids) {
      const result = await this.updateLearningPathStatus(id, isActive);
      if (!result.error) {
        count++;
      }
    }
    return { count };
  }

  async deleteLearningPaths(
    ids: string[]
  ): Promise<{ error?: string; count?: number }> {
    return this.updateLearningPathsStatus(ids, false);
  }

  async getArticleById(
    id: string
  ): Promise<{ data: Article | null; error?: string }> {
    const article = this.articles.get(id);
    if (!article) {
      return { data: null, error: 'Article not found' };
    }
    return { data: article };
  }

  async getLearningPathById(
    id: string
  ): Promise<{ data: LearningPath | null; error?: string }> {
    const path = this.learningPaths.get(id);
    if (!path) {
      return { data: null, error: 'Learning path not found' };
    }
    return { data: path };
  }
}
