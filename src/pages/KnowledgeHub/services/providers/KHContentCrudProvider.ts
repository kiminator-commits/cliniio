import { supabase } from '../../../../lib/supabase';
import { ContentItem } from '../../types';
import { ApiError, ErrorType, ErrorSeverity } from '../../types/errors';
import {
  KHDataTransformationProvider,
  KnowledgeHubCourse,
} from './KHDataTransformationProvider';

export class KHContentCrudProvider {
  private tableName = 'knowledge_hub_courses';

  /**
   * Create new content
   */
  async createContent(
    contentData: Partial<KnowledgeHubCourse>
  ): Promise<ContentItem> {
    try {
      // Validate data before insertion
      const validation =
        KHDataTransformationProvider.validateCourseData(contentData);
      if (!validation.isValid) {
        throw new ApiError(ErrorType.VALIDATION_ERROR, 'Invalid content data', {
          severity: ErrorSeverity.MEDIUM,
          context: { errors: validation.errors },
        });
      }

      const insertData =
        KHDataTransformationProvider.sanitizeCourseDataForInsert(contentData);

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('No data returned from content creation');
      }

      const courseData =
        KHDataTransformationProvider.transformRawRowToCourse(data);
      return KHDataTransformationProvider.transformRowToContentItem(courseData);
    } catch (error) {
      console.error('Error creating content:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(ErrorType.NETWORK_ERROR, 'Failed to create content', {
        severity: ErrorSeverity.HIGH,
        context: { originalError: error },
      });
    }
  }

  /**
   * Update content
   */
  async updateContent(
    id: string,
    updates: Partial<KnowledgeHubCourse>
  ): Promise<ContentItem> {
    try {
      // Validate data before update
      const validation =
        KHDataTransformationProvider.validateCourseData(updates);
      if (!validation.isValid) {
        throw new ApiError(ErrorType.VALIDATION_ERROR, 'Invalid update data', {
          severity: ErrorSeverity.MEDIUM,
          context: { errors: validation.errors },
        });
      }

      const updateData =
        KHDataTransformationProvider.sanitizeCourseDataForInsert(updates);

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('No data returned from content update');
      }

      const courseData =
        KHDataTransformationProvider.transformRawRowToCourse(data);
      return KHDataTransformationProvider.transformRowToContentItem(courseData);
    } catch (error) {
      console.error('Error updating content:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(ErrorType.NETWORK_ERROR, 'Failed to update content', {
        severity: ErrorSeverity.HIGH,
        context: { originalError: error },
      });
    }
  }

  /**
   * Delete content
   */
  async deleteContent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting content:', error);
      throw new ApiError(ErrorType.NETWORK_ERROR, 'Failed to delete content', {
        severity: ErrorSeverity.HIGH,
        context: { originalError: error },
      });
    }
  }

  /**
   * Soft delete content (mark as inactive)
   */
  async softDeleteContent(id: string): Promise<ContentItem> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_active: false,
          archived_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('No data returned from soft delete');
      }

      const courseData =
        KHDataTransformationProvider.transformRawRowToCourse(data);
      return KHDataTransformationProvider.transformRowToContentItem(courseData);
    } catch (error) {
      console.error('Error soft deleting content:', error);
      throw new ApiError(
        ErrorType.NETWORK_ERROR,
        'Failed to soft delete content',
        {
          severity: ErrorSeverity.MEDIUM,
          context: { originalError: error },
        }
      );
    }
  }

  /**
   * Restore content (mark as active)
   */
  async restoreContent(id: string): Promise<ContentItem> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          is_active: true,
          archived_at: null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('No data returned from restore');
      }

      const courseData =
        KHDataTransformationProvider.transformRawRowToCourse(data);
      return KHDataTransformationProvider.transformRowToContentItem(courseData);
    } catch (error) {
      console.error('Error restoring content:', error);
      throw new ApiError(ErrorType.NETWORK_ERROR, 'Failed to restore content', {
        severity: ErrorSeverity.MEDIUM,
        context: { originalError: error },
      });
    }
  }

  /**
   * Publish content
   */
  async publishContent(id: string): Promise<ContentItem> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('No data returned from publish');
      }

      const courseData =
        KHDataTransformationProvider.transformRawRowToCourse(data);
      return KHDataTransformationProvider.transformRowToContentItem(courseData);
    } catch (error) {
      console.error('Error publishing content:', error);
      throw new ApiError(ErrorType.NETWORK_ERROR, 'Failed to publish content', {
        severity: ErrorSeverity.MEDIUM,
        context: { originalError: error },
      });
    }
  }

  /**
   * Unpublish content
   */
  async unpublishContent(id: string): Promise<ContentItem> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          status: 'draft',
          published_at: null,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error('No data returned from unpublish');
      }

      const courseData =
        KHDataTransformationProvider.transformRawRowToCourse(data);
      return KHDataTransformationProvider.transformRowToContentItem(courseData);
    } catch (error) {
      console.error('Error unpublishing content:', error);
      throw new ApiError(
        ErrorType.NETWORK_ERROR,
        'Failed to unpublish content',
        {
          severity: ErrorSeverity.MEDIUM,
          context: { originalError: error },
        }
      );
    }
  }

  /**
   * Bulk update content
   */
  async bulkUpdateContent(
    ids: string[],
    updates: Partial<KnowledgeHubCourse>
  ): Promise<ContentItem[]> {
    try {
      const updateData =
        KHDataTransformationProvider.sanitizeCourseDataForInsert(updates);

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .in('id', ids)
        .select();

      if (error) throw error;

      if (!data) {
        throw new Error('No data returned from bulk update');
      }

      return KHDataTransformationProvider.transformRawRowsToContentItems(data);
    } catch (error) {
      console.error('Error bulk updating content:', error);
      throw new ApiError(
        ErrorType.NETWORK_ERROR,
        'Failed to bulk update content',
        {
          severity: ErrorSeverity.HIGH,
          context: { originalError: error },
        }
      );
    }
  }

  /**
   * Bulk delete content
   */
  async bulkDeleteContent(ids: string[]): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .in('id', ids);

      if (error) throw error;
    } catch (error) {
      console.error('Error bulk deleting content:', error);
      throw new ApiError(
        ErrorType.NETWORK_ERROR,
        'Failed to bulk delete content',
        {
          severity: ErrorSeverity.HIGH,
          context: { originalError: error },
        }
      );
    }
  }
}
