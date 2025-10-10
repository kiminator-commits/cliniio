import { supabase } from '../lib/supabaseClient';

export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  category: string;
  subcategory: string | null;
  priority: number;
  is_published: boolean;
  is_featured: boolean;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

export interface HelpArticlePreview {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  subcategory: string | null;
  priority: number;
  is_featured: boolean;
  view_count: number;
  is_published: boolean;
}

class HelpArticlesService {
  /**
   * Get all published articles for a specific category
   */
  async getArticlesByCategory(category: string): Promise<HelpArticlePreview[]> {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select(
          'id, slug, title, excerpt, category, subcategory, priority, is_featured, view_count'
        )
        .eq('category', category)
        .eq('is_published', true)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching help articles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching help articles:', error);
      return [];
    }
  }

  /**
   * Get a single article by slug
   */
  async getArticleBySlug(slug: string): Promise<HelpArticle | null> {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        console.error('Error fetching help article:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching help article:', error);
      return null;
    }
  }

  /**
   * Increment view count for an article
   */
  async incrementViewCount(slug: string): Promise<void> {
    try {
      // First get the current view count
      const { data: article } = await supabase
        .from('help_articles')
        .select('view_count')
        .eq('slug', slug)
        .single();

      if (article) {
        await supabase
          .from('help_articles')
          .update({
            view_count: article.view_count + 1,
            last_viewed_at: new Date().toISOString(),
          })
          .eq('slug', slug);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  /**
   * Get featured articles
   */
  async getFeaturedArticles(limit: number = 3): Promise<HelpArticlePreview[]> {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select(
          'id, slug, title, excerpt, category, subcategory, priority, is_featured, view_count'
        )
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('priority', { ascending: true })
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching featured articles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching featured articles:', error);
      return [];
    }
  }

  /**
   * Search articles by title or content
   */
  async searchArticles(
    query: string,
    category?: string
  ): Promise<HelpArticlePreview[]> {
    try {
      let supabaseQuery = supabase
        .from('help_articles')
        .select(
          'id, slug, title, excerpt, category, subcategory, priority, is_featured, view_count'
        )
        .eq('is_published', true)
        .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`);

      if (category) {
        supabaseQuery = supabaseQuery.eq('category', category);
      }

      const { data, error } = await supabaseQuery
        .order('priority', { ascending: true })
        .order('view_count', { ascending: false });

      if (error) {
        console.error('Error searching help articles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching help articles:', error);
      return [];
    }
  }
}

export const helpArticlesService = new HelpArticlesService();
