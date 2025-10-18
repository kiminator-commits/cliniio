import { supabase } from '../../../../lib/supabase';
import { ContentItem } from '../../types';
import { ApiError, ErrorType, ErrorSeverity } from '../../types/errors';
import { KHDataTransformationProvider } from './KHDataTransformationProvider';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export interface SearchFilters {
  category?: string;
  status?: string;
  department?: string;
  domain?: string;
  difficultyLevel?: string;
  tags?: string[];
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'published_at';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
  content: ContentItem[];
  total: number;
  query: string;
  filters: SearchFilters;
  options: SearchOptions;
}


export class KHSearchProvider {
  private tableName = 'knowledge_hub_courses';

  /**
   * Search content with text query and filters
   */
  async searchContent(
    query: string,
    filters?: SearchFilters,
    options?: SearchOptions
  ): Promise<SearchResult> {
    try {
      let queryBuilder: PostgrestFilterBuilder<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, Record<string, unknown>> = supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Add text search
      if (query && query.trim() !== '') {
        const searchQuery =
          KHDataTransformationProvider.createSearchQuery(query);
        queryBuilder = queryBuilder.or(searchQuery);
      }

      // Add filters
      if (filters) {
        queryBuilder = this.applyFilters(queryBuilder, filters);
      }

      // Apply options
      if (options) {
        queryBuilder = this.applyOptions(queryBuilder, options);
      } else {
        // Default ordering
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }

      const { data, error, count } = await queryBuilder;

      if (error) throw error;

      const content =
        KHDataTransformationProvider.transformRawRowsToContentItems((data as Record<string, unknown>[]) || []);

      return {
        content,
        total: (count as number) || 0,
        query,
        filters: filters || {},
        options: options || {},
      };
    } catch (error) {
      console.error('Error searching content:', error);
      throw new ApiError(ErrorType.NETWORK_ERROR, 'Failed to search content', {
        severity: ErrorSeverity.HIGH,
        context: { originalError: error },
      });
    }
  }

  /**
   * Search content by tags
   */
  async searchByTags(
    tags: string[],
    options?: SearchOptions
  ): Promise<SearchResult> {
    try {
      let queryBuilder: PostgrestFilterBuilder<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, Record<string, unknown>> = supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Search for content that contains any of the specified tags
      if (tags.length > 0) {
        queryBuilder = queryBuilder.overlaps('tags', tags);
      }

      // Apply options
      if (options) {
        queryBuilder = this.applyOptions(queryBuilder, options);
      } else {
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }

      const { data, error, count } = await queryBuilder;

      if (error) throw error;

      const content =
        KHDataTransformationProvider.transformRawRowsToContentItems((data as Record<string, unknown>[]) || []);

      return {
        content,
        total: (count as number) || 0,
        query: '',
        filters: { tags },
        options: options || {},
      };
    } catch (error) {
      console.error('Error searching by tags:', error);
      throw new ApiError(ErrorType.NETWORK_ERROR, 'Failed to search by tags', {
        severity: ErrorSeverity.MEDIUM,
        context: { originalError: error },
      });
    }
  }

  /**
   * Advanced search with multiple criteria
   */
  async advancedSearch(criteria: {
    query?: string;
    filters?: SearchFilters;
    options?: SearchOptions;
  }): Promise<SearchResult> {
    try {
      let queryBuilder: PostgrestFilterBuilder<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, Record<string, unknown>> = supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Add text search
      if (criteria.query && criteria.query.trim() !== '') {
        const searchQuery = KHDataTransformationProvider.createSearchQuery(
          criteria.query
        );
        queryBuilder = queryBuilder.or(searchQuery);
      }

      // Add filters
      if (criteria.filters) {
        queryBuilder = this.applyFilters(queryBuilder, criteria.filters);
      }

      // Apply options
      if (criteria.options) {
        queryBuilder = this.applyOptions(queryBuilder, criteria.options);
      } else {
        queryBuilder = queryBuilder.order('created_at', { ascending: false });
      }

      const { data, error, count } = await queryBuilder;

      if (error) throw error;

      const content =
        KHDataTransformationProvider.transformRawRowsToContentItems((data as Record<string, unknown>[]) || []);

      return {
        content,
        total: (count as number) || 0,
        query: criteria.query || '',
        filters: criteria.filters || {},
        options: criteria.options || {},
      };
    } catch (error) {
      console.error('Error in advanced search:', error);
      throw new ApiError(
        ErrorType.NETWORK_ERROR,
        'Failed to perform advanced search',
        {
          severity: ErrorSeverity.HIGH,
          context: { originalError: error },
        }
      );
    }
  }

  /**
   * Get search suggestions based on query
   */
  async getSearchSuggestions(
    query: string,
    limit: number = 10
  ): Promise<string[]> {
    try {
      if (!query || query.trim() === '') {
        return [];
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .select('title, description, tags')
        .eq('is_active', true)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .limit(limit);

      if (error) throw error;

      const suggestions = new Set<string>();

      data?.forEach((item) => {
        // Add title suggestions
        if (
          item.title &&
          item.title.toLowerCase().includes(query.toLowerCase())
        ) {
          suggestions.add(item.title);
        }

        // Add tag suggestions
        if (Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => {
            if (tag.toLowerCase().includes(query.toLowerCase())) {
              suggestions.add(tag);
            }
          });
        }
      });

      return Array.from(suggestions).slice(0, limit);
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      return [];
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearchTerms(limit: number = 10): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('title, tags')
        .eq('is_active', true)
        .eq('status', 'published')
        .limit(100); // Get more data to analyze

      if (error) throw error;

      const termCounts: Record<string, number> = {};

      data?.forEach((item) => {
        // Count title words
        if (item.title) {
          const words = item.title.toLowerCase().split(/\s+/);
          words.forEach((word) => {
            if (word.length > 2) {
              // Only count words longer than 2 characters
              termCounts[word] = (termCounts[word] || 0) + 1;
            }
          });
        }

        // Count tags
        if (Array.isArray(item.tags)) {
          item.tags.forEach((tag: string) => {
            if (tag.length > 2) {
              termCounts[tag.toLowerCase()] =
                (termCounts[tag.toLowerCase()] || 0) + 1;
            }
          });
        }
      });

      // Sort by count and return top terms
      return Object.entries(termCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([term]) => term);
    } catch (error) {
      console.error('Error getting popular search terms:', error);
      return [];
    }
  }

  /**
   * Apply filters to query builder
   */
  private applyFilters(
    queryBuilder: PostgrestFilterBuilder<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>,
    filters: SearchFilters
  ): PostgrestFilterBuilder<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, Record<string, unknown>> {
    if (filters.category) {
      queryBuilder = queryBuilder.eq('content_type', filters.category.toLowerCase());
    }
    if (filters.status) {
      queryBuilder = queryBuilder.eq('status', filters.status);
    }
    if (filters.department) {
      queryBuilder = queryBuilder.eq('department', filters.department);
    }
    if (filters.domain) {
      queryBuilder = queryBuilder.eq('domain', filters.domain);
    }
    if (filters.difficultyLevel) {
      queryBuilder = queryBuilder.eq('difficulty_level', filters.difficultyLevel);
    }
    if (filters.tags && filters.tags.length > 0) {
      queryBuilder = queryBuilder.overlaps('tags', filters.tags);
    }

    return queryBuilder;
  }

  /**
   * Apply options to query builder
   */
  private applyOptions(
    queryBuilder: PostgrestFilterBuilder<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>,
    options: SearchOptions
  ): PostgrestFilterBuilder<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>, Record<string, unknown>> {
    if (options.limit) {
      queryBuilder = queryBuilder.limit(options.limit);
    }
    if (options.offset) {
      queryBuilder = queryBuilder.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }
    if (options.sortBy) {
      queryBuilder = queryBuilder.order(options.sortBy, {
        ascending: options.sortOrder === 'asc',
      });
    }

    return queryBuilder;
  }
}
