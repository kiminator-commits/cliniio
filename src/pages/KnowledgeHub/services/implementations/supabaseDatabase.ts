import { supabase } from '@/lib/supabase';
import {
  DatabaseInterface,
  Article,
  LearningPath,
} from '../interfaces/databaseInterface';

export class SupabaseDatabase implements DatabaseInterface {
  async updateArticleStatus(
    id: string,
    status: string
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

  async updateArticlesStatus(
    ids: string[],
    status: string
  ): Promise<{ error?: string; count?: number }> {
    const { error, count } = await supabase
      .from('knowledge_articles')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .select('id');

    return { error: error?.message, count: count || 0 };
  }

  async deleteArticles(
    ids: string[]
  ): Promise<{ error?: string; count?: number }> {
    const { error, count } = await supabase
      .from('knowledge_articles')
      .update({
        status: 'archived',
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .select('id');

    return { error: error?.message, count: count || 0 };
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

  async updateLearningPathsStatus(
    ids: string[],
    isActive: boolean
  ): Promise<{ error?: string; count?: number }> {
    const { error, count } = await supabase
      .from('knowledge_learning_paths')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .select('id');

    return { error: error?.message, count: count || 0 };
  }

  async deleteLearningPaths(
    ids: string[]
  ): Promise<{ error?: string; count?: number }> {
    const { error, count } = await supabase
      .from('knowledge_learning_paths')
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .in('id', ids)
      .select('id');

    return { error: error?.message, count: count || 0 };
  }

  async getArticleById(
    id: string
  ): Promise<{ data: Article | null; error?: string }> {
    const { data, error } = await supabase
      .from('knowledge_articles')
      .select('*')
      .eq('id', id)
      .single();

    return { data: data as Article | null, error: error?.message };
  }

  async getLearningPathById(
    id: string
  ): Promise<{ data: LearningPath | null; error?: string }> {
    const { data, error } = await supabase
      .from('knowledge_learning_paths')
      .select('*')
      .eq('id', id)
      .single();

    return { data: data as LearningPath | null, error: error?.message };
  }
}
