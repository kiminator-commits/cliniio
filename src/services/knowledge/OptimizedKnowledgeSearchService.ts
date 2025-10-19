import { supabase } from '@/lib/supabaseClient';
import { logger } from '../logging/structuredLogger';

export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface SearchFilters {
  facilityId?: string;
  source?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  facility_id: string;
  created_at: string;
  updated_at: string;
  relevance_score?: number;
  tags?: string[];
}

/**
 * Optimized Knowledge Search Service
 * Provides paginated search with caching and performance optimizations
 */
export class OptimizedKnowledgeSearchService {
  private static instance: OptimizedKnowledgeSearchService;
  private searchCache = new Map<string, { data: any; timestamp: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 100;

  private constructor() {}

  static getInstance(): OptimizedKnowledgeSearchService {
    if (!OptimizedKnowledgeSearchService.instance) {
      OptimizedKnowledgeSearchService.instance = new OptimizedKnowledgeSearchService();
    }
    return OptimizedKnowledgeSearchService.instance;
  }

  /**
   * Search knowledge articles with pagination and caching
   */
  async searchKnowledgeArticles(
    query: string,
    pagination: PaginationParams,
    filters?: SearchFilters
  ): Promise<PaginatedResult<SearchResult>> {
    try {
      logger.info('Searching knowledge articles', {
        module: 'optimized-search',
        facilityId: filters?.facilityId || 'unknown'
      }, {
        query: query.substring(0, 100),
        page: pagination.page,
        limit: pagination.limit,
        filters
      });

      // Check cache first
      const cacheKey = this.generateCacheKey(query, pagination, filters);
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        logger.info('Returning cached search results', {
          module: 'optimized-search',
          facilityId: filters?.facilityId || 'unknown'
        }, {
          query: query.substring(0, 100),
          cachedResults: cached.data.length
        });
        return cached.data;
      }

      // Calculate offset
      const offset = pagination.offset ?? (pagination.page - 1) * pagination.limit;

      // Build search query
      let searchQuery = supabase
        .from('knowledge_articles')
        .select('*', { count: 'exact' });

      // Add text search
      if (query.trim()) {
        searchQuery = searchQuery.or(`title.ilike.%${query}%,content.ilike.%${query}%`);
      }

      // Add filters
      if (filters?.facilityId) {
        searchQuery = searchQuery.eq('facility_id', filters.facilityId);
      }
      if (filters?.source) {
        searchQuery = searchQuery.eq('source', filters.source);
      }
      if (filters?.dateFrom) {
        searchQuery = searchQuery.gte('created_at', filters.dateFrom);
      }
      if (filters?.dateTo) {
        searchQuery = searchQuery.lte('created_at', filters.dateTo);
      }

      // Add pagination
      searchQuery = searchQuery
        .range(offset, offset + pagination.limit - 1)
        .order('created_at', { ascending: false });

      const { data, error, count } = await searchQuery;

      if (error) {
        throw new Error(`Search failed: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / pagination.limit);

      const result: PaginatedResult<SearchResult> = {
        data: data || [],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrevious: pagination.page > 1
        }
      };

      // Cache the result
      this.setCache(cacheKey, result);

      logger.info('Knowledge search completed', {
        module: 'optimized-search',
        facilityId: filters?.facilityId || 'unknown'
      }, {
        query: query.substring(0, 100),
        resultsFound: result.data.length,
        totalResults: total,
        page: pagination.page
      });

      return result;

    } catch (error) {
      logger.error('Knowledge search failed', {
        module: 'optimized-search',
        facilityId: filters?.facilityId || 'unknown'
      }, {
        query: query.substring(0, 100),
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get knowledge article by ID with caching
   */
  async getKnowledgeArticle(id: string): Promise<SearchResult | null> {
    try {
      const cacheKey = `article_${id}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached.data;
      }

      const { data, error } = await supabase
        .from('knowledge_articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Failed to fetch article: ${error.message}`);
      }

      // Cache the result
      this.setCache(cacheKey, data);

      return data;

    } catch (error) {
      logger.error('Failed to get knowledge article', {
        module: 'optimized-search'
      }, {
        articleId: id,
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get popular articles (most accessed) with caching
   */
  async getPopularArticles(
    facilityId?: string,
    limit: number = 10
  ): Promise<SearchResult[]> {
    try {
      const cacheKey = `popular_${facilityId || 'all'}_${limit}`;
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached.data;
      }

      // Use materialized view if available, otherwise fallback to regular query
      let query = supabase
        .from('knowledge_articles_popular_view')
        .select('*')
        .limit(limit);

      if (facilityId) {
        query = query.eq('facility_id', facilityId);
      }

      const { data, error } = await query;

      if (error) {
        // Fallback to regular query if materialized view doesn't exist
        logger.warn('Materialized view not available, using fallback query', {
          module: 'optimized-search',
          facilityId: facilityId || 'unknown'
        });

        let fallbackQuery = supabase
          .from('knowledge_articles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (facilityId) {
          fallbackQuery = fallbackQuery.eq('facility_id', facilityId);
        }

        const { data: fallbackData, error: fallbackError } = await fallbackQuery;
        
        if (fallbackError) {
          throw new Error(`Fallback query failed: ${fallbackError.message}`);
        }

        this.setCache(cacheKey, fallbackData || []);
        return fallbackData || [];
      }

      this.setCache(cacheKey, data || []);
      return data || [];

    } catch (error) {
      logger.error('Failed to get popular articles', {
        module: 'optimized-search',
        facilityId: facilityId || 'unknown'
      }, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Get articles by source with pagination
   */
  async getArticlesBySource(
    source: string,
    pagination: PaginationParams,
    facilityId?: string
  ): Promise<PaginatedResult<SearchResult>> {
    return this.searchKnowledgeArticles('', pagination, {
      source,
      facilityId
    });
  }

  /**
   * Clear search cache
   */
  clearCache(): void {
    this.searchCache.clear();
    logger.info('Search cache cleared', {
      module: 'optimized-search'
    });
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.searchCache.size,
      maxSize: this.MAX_CACHE_SIZE,
      hitRate: 0 // Would need to track hits/misses for accurate rate
    };
  }

  /**
   * Generate cache key for search parameters
   */
  private generateCacheKey(
    query: string,
    pagination: PaginationParams,
    filters?: SearchFilters
  ): string {
    const key = JSON.stringify({
      query: query.toLowerCase().trim(),
      page: pagination.page,
      limit: pagination.limit,
      filters: filters || {}
    });
    return `search_${Buffer.from(key).toString('base64').slice(0, 32)}`;
  }

  /**
   * Get data from cache
   */
  private getFromCache(key: string): { data: any; timestamp: number } | null {
    const cached = this.searchCache.get(key);
    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.searchCache.delete(key);
      return null;
    }

    return cached;
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: any): void {
    // Clean up old entries if cache is full
    if (this.searchCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.searchCache.keys().next().value;
      this.searchCache.delete(oldestKey);
    }

    this.searchCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

// Export singleton instance
export const optimizedKnowledgeSearch = OptimizedKnowledgeSearchService.getInstance();
