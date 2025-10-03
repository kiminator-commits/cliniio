import { ContentItem, ContentCategory, ContentStatus } from '../../types';
import {
  KnowledgeArticle,
  KnowledgeLearningPath,
} from '../types/knowledgeHubTypes';

// Unified data transformer - single point for all data transformations
export class UnifiedDataTransformer {
  /**
   * Convert knowledge articles to ContentItem format for the UI
   */
  static convertArticlesToContentItems(
    articles: KnowledgeArticle[]
  ): ContentItem[] {
    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      category: 'Courses' as const,
      status: this.mapArticleStatusToContentStatus(article.status),
      dueDate: article.published_at || article.created_at,
      progress: 0, // Default progress
      description: article.summary,
      tags: article.tags || [],
      domain: article.difficulty_level,
      contentType: 'Article',
      type: 'article',
      createdAt: article.created_at,
      lastUpdated: article.last_modified_at,
      // ✅ Added missing field mappings
      author: article.author || '',
      publicationDate: article.publication_date || article.created_at,
      readingTime: article.reading_time || 0,
      difficultyScore: article.difficulty_score || 0,
      completionRequirements: article.completion_requirements || [],
      estimatedTime: article.estimated_time || 0,
      prerequisites: article.prerequisites || [],
      learningObjectives: article.learning_objectives || [],
      certificationRequired: article.certification_required || false,
      lastAccessed: article.last_accessed || article.created_at,
    }));
  }

  /**
   * Convert learning pathways to ContentItem format
   */
  static convertLearningPathwaysToContentItems(
    pathways: KnowledgeLearningPath[]
  ): ContentItem[] {
    return pathways.map((pathway) => ({
      id: pathway.id,
      title: pathway.title,
      category: 'Learning Pathways' as const,
      status: 'draft' as const,
      dueDate: pathway.created_at || new Date().toISOString(),
      progress: 0, // Default progress
      description: pathway.description,
      domain: pathway.difficulty_level,
      contentType: 'Learning Path',
      type: 'learning_path',
      createdAt: pathway.created_at,
      lastUpdated: pathway.updated_at,
      // ✅ Added missing field mappings
      author: pathway.author || '',
      publicationDate: pathway.publication_date || pathway.created_at,
      readingTime: pathway.reading_time || 0,
      difficultyScore: pathway.difficulty_score || 0,
      completionRequirements: pathway.completion_requirements || [],
      estimatedTime: pathway.estimated_time || 0,
      prerequisites: pathway.prerequisites || [],
      learningObjectives: pathway.learning_objectives || [],
      certificationRequired: pathway.certification_required || false,
      lastAccessed: pathway.last_accessed || pathway.created_at,
    }));
  }

  /**
   * Convert any database row to ContentItem (legacy support)
   */
  static convertDatabaseRowToContentItem(
    row: Record<string, unknown>
  ): ContentItem {
    return {
      id: String(row.id || ''),
      title: String(row.title || ''),
      category: ((row.category as string) || 'Courses') as ContentCategory,
      status: this.mapDatabaseStatusToContentStatus(String(row.status || '')),
      dueDate: String(
        row.due_date ||
          row.published_at ||
          row.created_at ||
          new Date().toISOString()
      ),
      progress: Number(row.progress) || 0,
      description: row.description as string | undefined,
      tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
      domain: String(row.domain || row.difficulty_level || ''),
      contentType: String(row.content_type || 'Article'),
      type: String(row.type || 'article'),
      createdAt: String(row.created_at || ''),
      lastUpdated: String(row.updated_at || row.last_modified_at || ''),
    };
  }

  /**
   * Map article status to content status
   */
  private static mapArticleStatusToContentStatus(
    articleStatus: string
  ): ContentStatus {
    switch (articleStatus) {
      case 'published':
        return 'published';
      case 'draft':
        return 'draft';
      case 'review':
        return 'review';
      case 'archived':
        return 'archived';
      default:
        return 'draft';
    }
  }

  /**
   * Map database status to content status (legacy support)
   */
  private static mapDatabaseStatusToContentStatus(
    dbStatus: string
  ): ContentStatus {
    switch (dbStatus.toLowerCase()) {
      case 'completed':
      case 'published':
        return 'published';
      case 'in_progress':
      case 'review':
        return 'review';
      case 'not_started':
      case 'draft':
        return 'draft';
      case 'archived':
        return 'archived';
      default:
        return 'draft';
    }
  }

  /**
   * Convert ContentItem back to database format (for updates)
   */
  static convertContentItemToDatabaseFormat(
    contentItem: ContentItem
  ): Record<string, unknown> {
    return {
      title: contentItem.title,
      description: contentItem.data?.description,
      status: this.mapContentStatusToDatabaseStatus(contentItem.status),
      tags: contentItem.data?.tags,
      difficulty_level: contentItem.domain,
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Map content status to database status
   */
  private static mapContentStatusToDatabaseStatus(
    contentStatus: ContentStatus
  ): string {
    switch (contentStatus) {
      case 'draft':
        return 'draft';
      case 'review':
        return 'review';
      case 'published':
        return 'published';
      case 'archived':
        return 'archived';
      default:
        return 'draft';
    }
  }
}
