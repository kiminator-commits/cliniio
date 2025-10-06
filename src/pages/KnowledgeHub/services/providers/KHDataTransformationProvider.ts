import { ContentItem, ContentCategory, ContentStatus } from '../../types';

/**
 * Safe type conversion utilities to prevent data loss
 */
export const safeString = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

export const safeNumber = (value: unknown): number => {
  return typeof value === 'number' ? value : 0;
};

export const safeBoolean = (value: unknown): boolean => {
  return typeof value === 'boolean' ? value : false;
};

export const safeStringArray = (value: unknown): string[] => {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string')
    : [];
};

// Database types that match our new Supabase schema
export interface KnowledgeHubCourse {
  id: string;
  title: string;
  description?: string;
  domain: string;
  content_type: string;
  content: Record<string, unknown>;
  media: Record<string, unknown>[];
  tags: string[];
  status: string;
  is_repeat: boolean;
  is_active: boolean;
  estimated_duration?: number;
  difficulty_level: string;
  department?: string;
  author_id?: string;
  assigned_by?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  archived_at?: string;
}

export class KHDataTransformationProvider {
  /**
   * Transform database row to ContentItem
   */
  static transformRowToContentItem(row: KnowledgeHubCourse): ContentItem {
    return {
      id: safeString(row.id),
      title: safeString(row.title),
      category: (safeString(row.content_type) as ContentCategory) || 'Courses',
      status: (safeString(row.status) as ContentStatus) || 'draft',
      dueDate:
        safeString(row.published_at) ||
        safeString(row.created_at) ||
        new Date().toISOString(),
      progress: 0, // Default progress since it's not available
      description: safeString(row.description),
      tags: safeStringArray(row.tags) || [],
      domain: safeString(row.domain) || safeString(row.difficulty_level),
      contentType: safeString(row.content_type) || 'Article',
      type: 'article', // Default type since it's not available
      createdAt: safeString(row.created_at),
      lastUpdated: safeString(row.updated_at),
      estimatedDuration: safeNumber(row.estimated_duration) || undefined,
      difficultyLevel: safeString(row.difficulty_level),
      department: safeString(row.department) || undefined,
      isActive: safeBoolean(row.is_active),
      // content property removed - not part of ContentItem interface
    };
  }

  /**
   * Safely transform raw database row to KnowledgeHubCourse
   */
  static transformRawRowToCourse(
    row: Record<string, unknown>
  ): KnowledgeHubCourse {
    return {
      id: String(row.id || ''),
      title: String(row.title || ''),
      description: row.description ? String(row.description) : undefined,
      domain: String(row.domain || ''),
      content_type: String(row.content_type || ''),
      content: (row.content as Record<string, unknown>) || {},
      media: Array.isArray(row.media)
        ? (row.media as Record<string, unknown>[])
        : [],
      tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
      status: String(row.status || ''),
      is_repeat: Boolean(row.is_repeat),
      is_active: Boolean(row.is_active),
      estimated_duration: row.estimated_duration
        ? Number(row.estimated_duration)
        : undefined,
      difficulty_level: String(row.difficulty_level || ''),
      department: row.department ? String(row.department) : undefined,
      author_id: row.author_id ? String(row.author_id) : undefined,
      assigned_by: row.assigned_by ? String(row.assigned_by) : undefined,
      created_at: String(row.created_at || ''),
      updated_at: String(row.updated_at || ''),
      published_at: row.published_at ? String(row.published_at) : undefined,
      archived_at: row.archived_at ? String(row.archived_at) : undefined,
    };
  }

  /**
   * Transform multiple raw rows to ContentItems
   */
  static transformRawRowsToContentItems(
    rows: Record<string, unknown>[]
  ): ContentItem[] {
    return rows.map((row) => {
      const courseData = this.transformRawRowToCourse(row);
      return this.transformRowToContentItem(courseData);
    });
  }

  /**
   * Validate KnowledgeHubCourse data
   */
  static validateCourseData(data: Partial<KnowledgeHubCourse>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.title || safeString(data.title).trim() === '') {
      errors.push('Title is required');
    }

    if (!data.content_type || safeString(data.content_type).trim() === '') {
      errors.push('Content type is required');
    }

    if (!data.domain || safeString(data.domain).trim() === '') {
      errors.push('Domain is required');
    }

    if (!data.status || safeString(data.status).trim() === '') {
      errors.push('Status is required');
    }

    if (
      !data.difficulty_level ||
      safeString(data.difficulty_level).trim() === ''
    ) {
      errors.push('Difficulty level is required');
    }

    if (data.estimated_duration && safeNumber(data.estimated_duration) < 0) {
      errors.push('Estimated duration must be positive');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize course data for database insertion
   */
  static sanitizeCourseDataForInsert(
    data: Partial<KnowledgeHubCourse>
  ): Record<string, unknown> {
    return {
      title: data.title,
      description: data.description,
      domain: data.domain,
      content_type: data.content_type,
      content: data.content,
      media: data.media,
      tags: data.tags,
      status: data.status,
      is_repeat: data.is_repeat,
      is_active: data.is_active,
      estimated_duration: data.estimated_duration,
      difficulty_level: data.difficulty_level,
      department: data.department,
      author_id: data.author_id,
      assigned_by: data.assigned_by,
    };
  }

  /**
   * Transform search filters to database query format
   */
  static transformSearchFilters(filters?: {
    category?: string;
    status?: string;
    department?: string;
  }): Record<string, string> {
    const queryFilters: Record<string, string> = {};

    if (filters?.category) {
      queryFilters.content_type = filters.category.toLowerCase();
    }

    if (filters?.status) {
      queryFilters.status = filters.status;
    }

    if (filters?.department) {
      queryFilters.department = filters.department;
    }

    return queryFilters;
  }

  /**
   * Create search query string for text search
   */
  static createSearchQuery(query: string): string {
    if (!query || query.trim() === '') {
      return '';
    }

    const cleanQuery = query.trim();
    return `title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`;
  }

  /**
   * Transform user progress data for database
   */
  static transformProgressData(
    userId: string,
    contentId: string,
    progress: Partial<Record<string, unknown>>
  ): Record<string, unknown> {
    return {
      user_id: userId,
      content_id: contentId,
      ...progress,
    };
  }
}
