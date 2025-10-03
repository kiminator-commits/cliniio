import { supabase } from '@/lib/supabaseClient';
import {
  KnowledgeArticle,
  KnowledgeLearningPath,
  ContentStatus,
  LearningPathStatus,
} from '../types/knowledgeHubTypes';

// Define the database types that match Supabase schema
interface DatabaseKnowledgeArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  category_id: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  published_at?: string;
}

interface DatabaseKnowledgeLearningPath {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  estimated_time: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface KnowledgeCategory {
  id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface BulkUpdateResult {
  success: boolean;
  updatedCount: number;
  processedCount: number;
  errors: string[];
}

interface BulkDeleteResult {
  success: boolean;
  deletedCount: number;
  processedCount: number;
  errors: string[];
}

// Use the ContentStatus from knowledgeHubTypes

// Unified database adapter - single point for all Supabase operations
export class UnifiedDatabaseAdapter {
  // === KNOWLEDGE ARTICLES ===

  async getKnowledgeArticles(): Promise<KnowledgeArticle[]> {
    const { data, error } = await supabase
      .from('knowledge_articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching knowledge articles:', error);
      throw new Error(`Failed to fetch knowledge articles: ${error.message}`);
    }

    // Transform database types to expected types
    const dbArticles = (data as unknown as DatabaseKnowledgeArticle[]) || [];
    return dbArticles.map((dbArticle) => ({
      id: dbArticle.id,
      title: dbArticle.title,
      content: dbArticle.content,
      category: dbArticle.category_id, // Map category_id to category
      status: dbArticle.status as ContentStatus,
      created_at: dbArticle.created_at,
      updated_at: dbArticle.updated_at,
      published_at: dbArticle.published_at,
      summary: dbArticle.summary,
      tags: dbArticle.tags,
    }));
  }

  async updateArticleStatus(
    id: string,
    status: ContentStatus
  ): Promise<{ error?: string }> {
    const { error } = await supabase
      .from('knowledge_articles')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return { error: error?.message };
  }

  async bulkUpdateArticlesStatus(
    ids: string[],
    status: ContentStatus
  ): Promise<BulkUpdateResult> {
    if (!ids || ids.length === 0) {
      return {
        success: false,
        updatedCount: 0,
        processedCount: 0,
        errors: ['No articles provided'],
      };
    }

    const { error, count } = await supabase
      .from('knowledge_articles')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .select('id');

    if (error) {
      return {
        success: false,
        updatedCount: 0,
        processedCount: ids.length,
        errors: [error.message],
      };
    }

    return {
      success: true,
      updatedCount: count || 0,
      processedCount: ids.length,
      errors: [],
    };
  }

  async deleteArticles(ids: string[]): Promise<BulkDeleteResult> {
    if (!ids || ids.length === 0) {
      return {
        success: false,
        deletedCount: 0,
        processedCount: 0,
        errors: ['No articles provided'],
      };
    }

    const { error, count } = await supabase
      .from('knowledge_articles')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .select('id');

    if (error) {
      return {
        success: false,
        deletedCount: 0,
        processedCount: ids.length,
        errors: [error.message],
      };
    }

    return {
      success: true,
      deletedCount: count || 0,
      processedCount: ids.length,
      errors: [],
    };
  }

  // === LEARNING PATHS ===

  async getLearningPathways(): Promise<KnowledgeLearningPath[]> {
    const { data, error } = await supabase
      .from('knowledge_learning_paths')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching learning pathways:', error);
      throw new Error(`Failed to fetch learning pathways: ${error.message}`);
    }

    // Transform database types to expected types
    const dbPathways =
      (data as unknown as DatabaseKnowledgeLearningPath[]) || [];
    return dbPathways.map((dbPathway) => ({
      id: dbPathway.id,
      title: dbPathway.title,
      description: dbPathway.description,
      steps: [], // Default empty steps array
      status: dbPathway.is_active
        ? 'active'
        : ('inactive' as LearningPathStatus),
      created_at: dbPathway.created_at,
      updated_at: dbPathway.updated_at,
      difficulty_level: dbPathway.difficulty,
      estimated_time: parseInt(dbPathway.estimated_time) || 0,
    }));
  }

  async updateLearningPathStatus(
    id: string,
    isActive: boolean
  ): Promise<{ error?: string }> {
    const { error } = await supabase
      .from('knowledge_learning_paths')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return { error: error?.message };
  }

  async bulkUpdateLearningPathsStatus(
    ids: string[],
    isActive: boolean
  ): Promise<BulkUpdateResult> {
    if (!ids || ids.length === 0) {
      return {
        success: false,
        updatedCount: 0,
        processedCount: 0,
        errors: ['No pathways provided'],
      };
    }

    const { error, count } = await supabase
      .from('knowledge_learning_paths')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .select('id');

    if (error) {
      return {
        success: false,
        updatedCount: 0,
        processedCount: ids.length,
        errors: [error.message],
      };
    }

    return {
      success: true,
      updatedCount: count || 0,
      processedCount: ids.length,
      errors: [],
    };
  }

  async deleteLearningPaths(ids: string[]): Promise<BulkDeleteResult> {
    if (!ids || ids.length === 0) {
      return {
        success: false,
        deletedCount: 0,
        processedCount: 0,
        errors: ['No pathways provided'],
      };
    }

    const { error, count } = await supabase
      .from('knowledge_learning_paths')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .select('id');

    if (error) {
      return {
        success: false,
        deletedCount: 0,
        processedCount: ids.length,
        errors: [error.message],
      };
    }

    return {
      success: true,
      deletedCount: count || 0,
      processedCount: ids.length,
      errors: [],
    };
  }

  // === INDIVIDUAL CONTENT ITEMS ===

  async getArticleById(
    id: string
  ): Promise<{ data?: KnowledgeArticle; error?: string }> {
    const { data, error } = await supabase
      .from('knowledge_articles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Article not found' };
    }

    // Transform database type to expected type
    const dbArticle = data as unknown as DatabaseKnowledgeArticle;
    return {
      data: {
        id: dbArticle.id,
        title: dbArticle.title,
        content: dbArticle.content,
        category: dbArticle.category_id,
        status: dbArticle.status as ContentStatus,
        created_at: dbArticle.created_at,
        updated_at: dbArticle.updated_at,
        published_at: dbArticle.published_at,
        summary: dbArticle.summary,
        tags: dbArticle.tags,
      },
    };
  }

  async getLearningPathById(
    id: string
  ): Promise<{ data?: KnowledgeLearningPath; error?: string }> {
    const { data, error } = await supabase
      .from('knowledge_learning_paths')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { error: 'Learning path not found' };
    }

    // Transform database type to expected type
    const dbPathway = data as unknown as DatabaseKnowledgeLearningPath;
    return {
      data: {
        id: dbPathway.id,
        title: dbPathway.title,
        description: dbPathway.description,
        steps: [], // Default empty steps array
        status: dbPathway.is_active
          ? 'active'
          : ('inactive' as LearningPathStatus),
        created_at: dbPathway.created_at,
        updated_at: dbPathway.updated_at,
        difficulty_level: dbPathway.difficulty,
        estimated_time: parseInt(dbPathway.estimated_time) || 0,
      },
    };
  }

  // === CATEGORIES ===

  async getKnowledgeCategories(): Promise<KnowledgeCategory[]> {
    const { data, error } = await supabase
      .from('knowledge_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching knowledge categories:', error);
      throw new Error(`Failed to fetch knowledge categories: ${error.message}`);
    }

    return (data as unknown as KnowledgeCategory[]) || [];
  }

  // === LEGACY SUPPORT (for existing code) ===

  async createArticle(articleData: {
    title: string;
    content: string;
    summary: string;
    category: string;
    tags: string[];
    status: ContentStatus;
  }): Promise<{ article?: KnowledgeArticle; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .insert([
          {
            title: articleData.title,
            content: articleData.content,
            summary: articleData.summary,
            category_id: articleData.category,
            tags: articleData.tags,
            status: articleData.status,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { article: data as unknown as KnowledgeArticle };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to create article',
      };
    }
  }

  // === MISSING METHODS FOR KNOWLEDGEHUB SERVICE ===

  async updateArticle(
    id: string,
    updates: Partial<KnowledgeArticle>
  ): Promise<{ article?: KnowledgeArticle; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('knowledge_articles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { article: data as unknown as KnowledgeArticle };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to update article',
      };
    }
  }

  async deleteArticle(id: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('knowledge_articles')
        .update({
          status: 'archived',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      return { error: error?.message };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to delete article',
      };
    }
  }

  async createLearningPath(pathwayData: {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    estimated_time: string;
    is_active: boolean;
  }): Promise<{ pathway?: DatabaseKnowledgeLearningPath; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('knowledge_learning_paths')
        .insert([
          {
            title: pathwayData.title,
            description: pathwayData.description,
            category: pathwayData.category,
            difficulty: pathwayData.difficulty,
            estimated_time: pathwayData.estimated_time,
            is_active: pathwayData.is_active,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { pathway: data as unknown as DatabaseKnowledgeLearningPath };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create learning path',
      };
    }
  }

  async updateLearningPath(
    id: string,
    updates: Partial<DatabaseKnowledgeLearningPath>
  ): Promise<{ pathway?: DatabaseKnowledgeLearningPath; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('knowledge_learning_paths')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { pathway: data as unknown as DatabaseKnowledgeLearningPath };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update learning path',
      };
    }
  }

  async deleteLearningPath(id: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('knowledge_learning_paths')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      return { error: error?.message };
    } catch (error) {
      return {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete learning path',
      };
    }
  }

  async addCategory(
    categoryName: string
  ): Promise<{ category?: KnowledgeCategory; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('knowledge_categories')
        .insert([
          {
            name: categoryName,
            is_active: true,
            sort_order: 999, // Default sort order
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        return { error: error.message };
      }

      return { category: data as unknown as KnowledgeCategory };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to add category',
      };
    }
  }

  async deleteCategory(categoryName: string): Promise<{ error?: string }> {
    try {
      const { error } = await supabase
        .from('knowledge_categories')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('name', categoryName);

      return { error: error?.message };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : 'Failed to delete category',
      };
    }
  }

  async getRecentUserActivity(userId?: string, limit?: number): Promise<Record<string, unknown>[]> {
    try {
      let query = supabase
        .from('activity_feed')
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (limit) {
        query = query.limit(limit);
      } else {
        query = query.limit(50); // Default limit
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching recent user activity:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Failed to get recent user activity:', error);
      return [];
    }
  }
}
