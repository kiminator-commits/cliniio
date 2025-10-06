import { supabase } from '../../../../lib/supabase';
import { ContentItem } from '../../types';
import { KHDataTransformationProvider } from './KHDataTransformationProvider';

export class KHContentFetchProvider {
  private tableName = 'knowledge_hub_courses';

  /**
   * Fetch all content
   */
  async fetchContent(): Promise<ContentItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array instead of throwing
        if (error.code === '42P01') {
          // Silently handle missing table - no console warning
          return [];
        }
        throw error;
      }

      return KHDataTransformationProvider.transformRawRowsToContentItems(
        data || []
      );
    } catch (error) {
      console.error('Error fetching knowledge hub content:', error);
      // Return empty array for any other errors to prevent app crashes
      return [];
    }
  }

  /**
   * Fetch content by category
   */
  async fetchContentByCategory(category: string): Promise<ContentItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .eq('content_type', category.toLowerCase())
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          // Silently handle missing table - no console warning
          return [];
        }
        throw error;
      }

      return KHDataTransformationProvider.transformRawRowsToContentItems(
        data || []
      );
    } catch (error) {
      console.error('Error fetching content by category:', error);
      return [];
    }
  }

  /**
   * Fetch content by domain
   */
  async fetchContentByDomain(domain: string): Promise<ContentItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .eq('domain', domain)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          return [];
        }
        throw error;
      }

      return KHDataTransformationProvider.transformRawRowsToContentItems(
        data || []
      );
    } catch (error) {
      console.error('Error fetching content by domain:', error);
      return [];
    }
  }

  /**
   * Fetch content by status
   */
  async fetchContentByStatus(status: string): Promise<ContentItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          return [];
        }
        throw error;
      }

      return KHDataTransformationProvider.transformRawRowsToContentItems(
        data || []
      );
    } catch (error) {
      console.error('Error fetching content by status:', error);
      return [];
    }
  }

  /**
   * Fetch content by department
   */
  async fetchContentByDepartment(department: string): Promise<ContentItem[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .eq('department', department)
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          return [];
        }
        throw error;
      }

      return KHDataTransformationProvider.transformRawRowsToContentItems(
        data || []
      );
    } catch (error) {
      console.error('Error fetching content by department:', error);
      return [];
    }
  }

  /**
   * Get content by ID
   */
  async getContentById(id: string): Promise<ContentItem | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      const courseData =
        KHDataTransformationProvider.transformRawRowToCourse(data);
      return KHDataTransformationProvider.transformRowToContentItem(courseData);
    } catch (error) {
      console.error('Error fetching content by ID:', error);
      throw new Error('Failed to fetch content');
    }
  }

  /**
   * Fetch content with pagination
   */
  async fetchContentPaginated(
    page: number = 1,
    pageSize: number = 10,
    filters?: {
      category?: string;
      status?: string;
      department?: string;
      domain?: string;
    }
  ): Promise<{
    content: ContentItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    try {
      let queryBuilder = supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('is_active', true);

      // Apply filters
      if (filters?.category) {
        queryBuilder = queryBuilder.eq(
          'content_type',
          filters.category.toLowerCase()
        );
      }
      if (filters?.status) {
        queryBuilder = queryBuilder.eq('status', filters.status);
      }
      if (filters?.department) {
        queryBuilder = queryBuilder.eq('department', filters.department);
      }
      if (filters?.domain) {
        queryBuilder = queryBuilder.eq('domain', filters.domain);
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      queryBuilder = queryBuilder.range(from, to);

      // Apply ordering
      queryBuilder = queryBuilder.order('created_at', { ascending: false });

      const { data, error, count } = await queryBuilder;

      if (error) {
        if (error.code === '42P01') {
          return {
            content: [],
            total: 0,
            page,
            pageSize,
            totalPages: 0,
          };
        }
        throw error;
      }

      const content =
        KHDataTransformationProvider.transformRawRowsToContentItems(data || []);
      const total = count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        content,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching paginated content:', error);
      return {
        content: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }
  }

  /**
   * Fetch content statistics
   */
  async fetchContentStatistics(): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    byDepartment: Record<string, number>;
  }> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('content_type, status, department')
        .eq('is_active', true);

      if (error) {
        if (error.code === '42P01') {
          return {
            total: 0,
            byCategory: {},
            byStatus: {},
            byDepartment: {},
          };
        }
        throw error;
      }

      const stats = {
        total: data?.length || 0,
        byCategory: {} as Record<string, number>,
        byStatus: {} as Record<string, number>,
        byDepartment: {} as Record<string, number>,
      };

      data?.forEach((item) => {
        // Count by category
        const category = item.content_type || 'Unknown';
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;

        // Count by status
        const status = item.status || 'Unknown';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        // Count by department
        const department = item.department || 'Unknown';
        stats.byDepartment[department] =
          (stats.byDepartment[department] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error fetching content statistics:', error);
      return {
        total: 0,
        byCategory: {},
        byStatus: {},
        byDepartment: {},
      };
    }
  }
}
