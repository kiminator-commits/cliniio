import { supabase } from '@/lib/supabaseClient';
import { logger } from '../logging/structuredLogger';
import { optimizedKnowledgeSearch, PaginationParams, SearchFilters } from './OptimizedKnowledgeSearchService';

export interface FullTextSearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  source: string;
  facility_id: string;
  created_at: string;
  updated_at: string;
  rank: number;
  snippet: string;
}

export interface SearchAnalytics {
  totalSearches: number;
  popularQueries: Array<{ query: string; count: number }>;
  sourceBreakdown: Record<string, number>;
  averageResultsPerSearch: number;
}

/**
 * Enhanced Search Service with Full-Text Search and Analytics
 * Uses materialized views for optimal performance
 */
export class EnhancedSearchService {
  private static instance: EnhancedSearchService;

  private constructor() {}

  static getInstance(): EnhancedSearchService {
    if (!EnhancedSearchService.instance) {
      EnhancedSearchService.instance = new EnhancedSearchService();
    }
    return EnhancedSearchService.instance;
  }

  /**
   * Perform full-text search using materialized view
   */
  async fullTextSearch(
    query: string,
    pagination: PaginationParams,
    filters?: SearchFilters
  ): Promise<{
    results: FullTextSearchResult[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrevious: boolean;
    };
  }> {
    try {
      logger.info('Performing full-text search', {
        module: 'enhanced-search',
        facilityId: filters?.facilityId || 'unknown'
      }, {
        query: query.substring(0, 100),
        page: pagination.page,
        limit: pagination.limit
      });

      // Log search for analytics
      await this.logSearch(query, filters?.facilityId);

      const offset = pagination.offset ?? (pagination.page - 1) * pagination.limit;

      // Use materialized view for full-text search
      let searchQuery = supabase
        .from('knowledge_articles_search_view')
        .select('*', { count: 'exact' });

      // Add full-text search
      if (query.trim()) {
        searchQuery = searchQuery.textSearch('search_vector', query);
      }

      // Add filters
      if (filters?.category) {
        searchQuery = searchQuery.eq('category', filters.category);
      }
      if (filters?.facilityId) {
        searchQuery = searchQuery.eq('facility_id', filters.facilityId);
      }
      if (filters?.source) {
        searchQuery = searchQuery.eq('source', filters.source);
      }

      // Add pagination and ordering
      searchQuery = searchQuery
        .range(offset, offset + pagination.limit - 1)
        .order('rank', { ascending: false })
        .order('created_at', { ascending: false });

      const { data, error, count } = await searchQuery;

      if (error) {
        // Fallback to regular search if materialized view fails
        logger.warn('Materialized view search failed, using fallback', {
          module: 'enhanced-search',
          facilityId: filters?.facilityId || 'unknown'
        }, {
          error: error.message
        });

        return await this.fallbackSearch(query, pagination, filters);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / pagination.limit);

      // Generate snippets for results
      const results: FullTextSearchResult[] = (data || []).map(item => ({
        ...item,
        category: item.category || 'Unknown',
        snippet: this.generateSnippet(item.content, query)
      }));

      logger.info('Full-text search completed', {
        module: 'enhanced-search',
        facilityId: filters?.facilityId || 'unknown'
      }, {
        query: query.substring(0, 100),
        resultsFound: results.length,
        totalResults: total
      });

      return {
        results,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          totalPages,
          hasNext: pagination.page < totalPages,
          hasPrevious: pagination.page > 1
        }
      };

    } catch (error) {
      logger.error('Full-text search failed', {
        module: 'enhanced-search',
        facilityId: filters?.facilityId || 'unknown'
      }, {
        query: query.substring(0, 100),
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Fallback search using regular optimized search
   */
  private async fallbackSearch(
    query: string,
    pagination: PaginationParams,
    filters?: SearchFilters
  ) {
    const result = await optimizedKnowledgeSearch.searchKnowledgeArticles(
      query,
      pagination,
      filters
    );

    return {
      results: result.data.map(item => ({
        ...item,
        rank: 1, // Default rank for fallback
        category: 'Unknown',
        snippet: this.generateSnippet(item.content, query)
      })),
      pagination: result.pagination
    };
  }

  /**
   * Get search analytics
   */
  async getSearchAnalytics(facilityId?: string): Promise<SearchAnalytics> {
    try {
      logger.info('Getting search analytics', {
        module: 'enhanced-search',
        facilityId: facilityId || 'unknown'
      });

      // Get total searches
      let totalQuery = supabase
        .from('knowledge_article_access_logs')
        .select('id', { count: 'exact' })
        .eq('access_method', 'search');

      if (facilityId) {
        totalQuery = totalQuery.eq('facility_id', facilityId);
      }

      const { count: totalSearches } = await totalQuery;

      // Get popular queries
      let popularQuery = supabase
        .from('knowledge_article_access_logs')
        .select('search_query')
        .eq('access_method', 'search')
        .not('search_query', 'is', null);

      if (facilityId) {
        popularQuery = popularQuery.eq('facility_id', facilityId);
      }

      const { data: searchLogs } = await popularQuery;

      // Count query frequency
      const queryCounts: Record<string, number> = {};
      searchLogs?.forEach(log => {
        if (log.search_query) {
          const normalizedQuery = log.search_query.toLowerCase().trim();
          queryCounts[normalizedQuery] = (queryCounts[normalizedQuery] || 0) + 1;
        }
      });

      const popularQueries = Object.entries(queryCounts)
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Get source breakdown
      const { data: stats } = await supabase
        .from('knowledge_articles_stats_view')
        .select('facility_id, total_articles')
        .eq('facility_id', facilityId);

      const sourceBreakdown: Record<string, number> = {};
      stats?.forEach(stat => {
        sourceBreakdown[stat.facility_id] = stat.total_articles;
      });

      // Calculate average results per search
      const averageResultsPerSearch = totalSearches ? 
        (searchLogs?.length || 0) / totalSearches : 0;

      return {
        totalSearches: totalSearches || 0,
        popularQueries,
        sourceBreakdown,
        averageResultsPerSearch: Math.round(averageResultsPerSearch * 100) / 100
      };

    } catch (error) {
      logger.error('Failed to get search analytics', {
        module: 'enhanced-search',
        facilityId: facilityId || 'unknown'
      }, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Refresh materialized views
   */
  async refreshMaterializedViews(): Promise<void> {
    try {
      logger.info('Refreshing materialized views', {
        module: 'enhanced-search'
      });

      const { error } = await supabase.rpc('refresh_knowledge_views');

      if (error) {
        throw new Error(`Failed to refresh views: ${error.message}`);
      }

      logger.info('Materialized views refreshed successfully', {
        module: 'enhanced-search'
      });

    } catch (error) {
      logger.error('Failed to refresh materialized views', {
        module: 'enhanced-search'
      }, {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Generate snippet from content highlighting search terms
   */
  private generateSnippet(content: string, query: string): string {
    const maxLength = 200;
    const queryWords = query.toLowerCase().split(/\s+/);
    
    // Find the best position to start the snippet
    let bestPosition = 0;
    let maxMatches = 0;
    
    for (let i = 0; i <= content.length - maxLength; i += 50) {
      const snippet = content.slice(i, i + maxLength).toLowerCase();
      const matches = queryWords.filter(word => snippet.includes(word)).length;
      
      if (matches > maxMatches) {
        maxMatches = matches;
        bestPosition = i;
      }
    }
    
    let snippet = content.slice(bestPosition, bestPosition + maxLength);
    
    // Add ellipsis if needed
    if (bestPosition > 0) {
      snippet = '...' + snippet;
    }
    if (bestPosition + maxLength < content.length) {
      snippet = snippet + '...';
    }
    
    // Highlight search terms
    queryWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      snippet = snippet.replace(regex, '<mark>$1</mark>');
    });
    
    return snippet;
  }

  /**
   * Log search for analytics
   */
  private async logSearch(query: string, facilityId?: string): Promise<void> {
    try {
      await supabase
        .from('knowledge_article_access_logs')
        .insert({
          search_query: query,
          facility_id: facilityId,
          access_method: 'search'
        });
    } catch (error) {
      // Log search failures silently to avoid disrupting search
      logger.debug('Failed to log search', {
        module: 'enhanced-search'
      }, {
        query: query.substring(0, 50),
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

// Export singleton instance
export const enhancedSearchService = EnhancedSearchService.getInstance();
