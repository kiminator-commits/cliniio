import { ContentItem } from '../types';
import { DEPRECATED_MOCK_NOTICE } from './deprecatedNotice';

export class ProviderService {
  static getCategoryCount(content: ContentItem[], category: string): number {
    return content.filter((item) => item.category === category).length;
  }

  static updateContentInList(
    content: ContentItem[],
    contentId: string,
    updates: Partial<ContentItem>
  ): ContentItem[] {
    return content.map((item) =>
      item.id === contentId ? { ...item, ...updates } : item
    );
  }

  static removeContentFromList(
    content: ContentItem[],
    contentId: string
  ): ContentItem[] {
    return content.filter((item) => item.id !== contentId);
  }

  static async performContentUpdate(
    contentId: string,
    updates: Partial<ContentItem>
  ): Promise<ContentItem> {
    try {
      // Placeholder implementation - Knowledge Hub now uses Supabase directly
      console.warn(DEPRECATED_MOCK_NOTICE);
      return { id: contentId, ...updates } as ContentItem;
    } catch (err) {
      console.error(err);
      // If API is not available, return a mock updated item
      return { id: contentId, ...updates } as ContentItem;
    }
  }

  static async performContentDeletion(contentId: string): Promise<void> {
    try {
      const { supabase } = await import('@/lib/supabaseClient');

      const { error } = await supabase
        .from('knowledge_hub_content')
        .delete()
        .eq('id', contentId);

      if (error) {
        throw new Error(`Failed to delete content: ${error.message}`);
      }

      console.log(`✅ Successfully deleted content item: ${contentId}`);
    } catch (err) {
      console.error('Error deleting content:', err);
      throw err;
    }
  }

  static async performContentStatusUpdate(
    contentId: string,
    status: string
  ): Promise<ContentItem> {
    try {
      // Placeholder implementation - Knowledge Hub now uses Supabase directly
      console.warn(DEPRECATED_MOCK_NOTICE);
      return { id: contentId, status } as ContentItem;
    } catch (err) {
      console.error(err);
      // If API is not available, return a mock updated item
      return { id: contentId, status } as ContentItem;
    }
  }

  static async performContentFetch(): Promise<ContentItem[]> {
    try {
      // Placeholder implementation - Knowledge Hub now uses Supabase directly
      console.warn(DEPRECATED_MOCK_NOTICE);
      return [];
    } catch (err) {
      console.error(err);
      // If API is not available, return empty array
      return [];
    }
  }

  static createError(message: string): Error {
    return new Error(message);
  }

  static getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'An unknown error occurred';
  }
}
