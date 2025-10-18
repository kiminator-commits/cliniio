import { ContentItem } from '../../KnowledgeHub/types';
import { KnowledgeHubCourse } from './providers/KHDataTransformationProvider';
import { KHContentFetchProvider } from './providers/KHContentFetchProvider';
import { KHContentCrudProvider } from './providers/KHContentCrudProvider';
import { KHSearchProvider } from './providers/KHSearchProvider';
import {
  KHProgressProvider,
  UserProgress,
} from './providers/KHProgressProvider';

// Re-export interfaces for backward compatibility
export type { KnowledgeHubCourse };

interface _CRUDProvider {
  createContent(contentData: Partial<KnowledgeHubCourse>): Promise<ContentItem>;
  updateContent(id: string, updates: Partial<KnowledgeHubCourse>): Promise<ContentItem>;
  deleteContent(id: string): Promise<void>;
  test(): string;
  [key: string]: unknown;
}

interface KnowledgeHubSupabaseServiceInterface {
  fetchContent(): Promise<ContentItem[]>;
  fetchContentByCategory(category: string): Promise<ContentItem[]>;
  createContent(contentData: Partial<KnowledgeHubCourse>): Promise<ContentItem>;
  updateContent(id: string, updates: Partial<KnowledgeHubCourse>): Promise<ContentItem>;
  deleteContent(id: string): Promise<void>;
  getContentById(id: string): Promise<ContentItem>;
  getUserProgress(userId: string, contentId: string): Promise<UserProgress>;
  updateUserProgress(userId: string, contentId: string, progress: Record<string, unknown>): Promise<void>;
}

/**
 * @deprecated Use KnowledgeHubService from '@/pages/KnowledgeHub/services/knowledgeHubService' instead
 * This service is deprecated in favor of the consolidated KnowledgeHubService
 */
export class KnowledgeHubSupabaseService {
  private fetchProvider: KHContentFetchProvider;
  private crudProvider: KHContentCrudProvider;
  private searchProvider: KHSearchProvider;
  private progressProvider: KHProgressProvider;

  constructor() {
    this.fetchProvider = new KHContentFetchProvider();
    this.crudProvider = new KHContentCrudProvider() as unknown as _CRUDProvider;
    this.searchProvider = new KHSearchProvider();
    this.progressProvider = new KHProgressProvider();
  }

  // Fetch all content
  async fetchContent(): Promise<ContentItem[]> {
    console.warn(
      'KnowledgeHubSupabaseService.fetchContent() is deprecated. Use KnowledgeHubService.getAllContent() instead.'
    );
    return this.fetchProvider.fetchContent();
  }

  // Fetch content by category
  async fetchContentByCategory(category: string): Promise<ContentItem[]> {
    return this.fetchProvider.fetchContentByCategory(category);
  }

  // Fetch content by domain
  async fetchContentByDomain(domain: string): Promise<ContentItem[]> {
    return this.fetchProvider.fetchContentByDomain(domain);
  }

  // Fetch content by status
  async fetchContentByStatus(status: string): Promise<ContentItem[]> {
    return this.fetchProvider.fetchContentByStatus(status);
  }

  // Fetch content by department
  async fetchContentByDepartment(department: string): Promise<ContentItem[]> {
    return this.fetchProvider.fetchContentByDepartment(department);
  }

  // Search content
  async searchContent(
    query: string,
    filters?: {
      category?: string;
      status?: string;
      department?: string;
    }
  ): Promise<ContentItem[]> {
    const searchResult = await this.searchProvider.searchContent(
      query,
      filters
    );
    return searchResult.content;
  }

  // Create new content
  async createContent(
    contentData: Partial<KnowledgeHubCourse>
  ): Promise<ContentItem> {
    return (this.crudProvider as unknown as _CRUDProvider).createContent(contentData);
  }

  // Update content
  async updateContent(
    id: string,
    updates: Partial<KnowledgeHubCourse>
  ): Promise<ContentItem> {
    return (this.crudProvider as unknown as _CRUDProvider).updateContent(id, updates);
  }

  // Delete content
  async deleteContent(id: string): Promise<void> {
    return (this.crudProvider as unknown as _CRUDProvider).deleteContent(id);
  }

  // Get content by ID
  async getContentById(id: string): Promise<ContentItem | null> {
    return await this.fetchProvider.getContentById(id);
  }

  // Get user progress for content
  async getUserProgress(
    userId: string,
    contentId: string
  ): Promise<UserProgress | null> {
    return await this.progressProvider.getUserProgress(userId, contentId);
  }

  // Update user progress
  async updateUserProgress(
    userId: string,
    contentId: string,
    progress: Partial<Record<string, unknown>>
  ): Promise<void> {
    await (this.progressProvider as unknown as { updateUserProgress: (userId: string, contentId: string, progress: Partial<Record<string, unknown>>) => Promise<void> }).updateUserProgress(userId, contentId, progress);
  }
}

// Create singleton instance after class definition
const knowledgeHubSupabaseService = new KnowledgeHubSupabaseService();

// Export singleton instance
export { knowledgeHubSupabaseService as KnowledgeHubSupabaseServiceInterface };

// Export for backward compatibility
export const fetchContent = async (): Promise<ContentItem[]> => {
  return (knowledgeHubSupabaseService as KnowledgeHubSupabaseServiceInterface).fetchContent();
};
