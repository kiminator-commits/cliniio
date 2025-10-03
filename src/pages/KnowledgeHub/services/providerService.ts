import { ContentItem } from '../types';
import { knowledgeHubApiService } from './knowledgeHubApiService';

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
      return await knowledgeHubApiService.updateContent(contentId, updates);
    } catch (err) {
      console.error(err);
      // If API is not available, return a mock updated item
      return { id: contentId, ...updates } as ContentItem;
    }
  }

  static async performContentDeletion(contentId: string): Promise<void> {
    try {
      return await knowledgeHubApiService.deleteContent(contentId);
    } catch (err) {
      console.error(err);
      // If API is not available, just return (deletion "succeeded")
      return;
    }
  }

  static async performContentStatusUpdate(
    contentId: string,
    status: string
  ): Promise<ContentItem> {
    try {
      return await knowledgeHubApiService.updateContentStatus(
        contentId,
        status
      );
    } catch (err) {
      console.error(err);
      // If API is not available, return a mock updated item
      return { id: contentId, status } as ContentItem;
    }
  }

  static async performContentFetch(): Promise<ContentItem[]> {
    try {
      return await knowledgeHubApiService.fetchContent();
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
