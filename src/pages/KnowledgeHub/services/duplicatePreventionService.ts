import { ContentItem, ContentCategory, ContentStatus } from '../types';
import { supabase } from '../../../lib/supabase';

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  similarity: number;
  reason?: string;
  existingContent?: ContentItem;
}

export interface DuplicateGroup {
  items: ContentItem[];
  similarity: number;
  reason: string;
}

export class DuplicatePreventionService {
  private tableName = 'knowledge_articles';
  private similarityThreshold = 0.7;

  /**
   * Check if content is a duplicate before adding
   */
  async checkForDuplicates(
    newItem: Partial<ContentItem>
  ): Promise<DuplicateCheckResult[]> {
    try {
      const { data: existingItems, error } = await supabase
        .from(this.tableName)
        .select('*')
        .or(
          `title.ilike.%${newItem.title}%,description.ilike.%${newItem.data?.description}%`
        );

      if (error) throw error;

      const duplicates: DuplicateCheckResult[] = [];

      existingItems?.forEach((existing) => {
        const similarity = this.calculateSimilarity(
          newItem as ContentItem,
          this.transformRowToContentItem(existing)
        );

        if (similarity > this.similarityThreshold) {
          duplicates.push({
            isDuplicate: true,
            existingContent: this.transformRowToContentItem(existing),
            similarity,
            reason: this.getDuplicateReason(
              newItem as ContentItem,
              this.transformRowToContentItem(existing)
            ),
          });
        }
      });

      return duplicates;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return [];
    }
  }

  /**
   * Calculate similarity between two content items
   */
  private calculateSimilarity(item1: ContentItem, item2: ContentItem): number {
    let similarity = 0;
    let totalChecks = 0;

    // Title similarity
    if (item1.title && item2.title) {
      similarity += this.calculateTextSimilarity(item1.title, item2.title);
      totalChecks++;
    }

    // Category similarity
    if (item1.category && item2.category && item1.category === item2.category) {
      similarity += 1;
      totalChecks++;
    }

    // Description similarity
    if (item1.description && item2.description) {
      similarity += this.calculateTextSimilarity(
        item1.description,
        item2.description
      );
      totalChecks++;
    }

    // Tags similarity
    if (
      item1.tags &&
      item2.tags &&
      item1.tags.length > 0 &&
      item2.tags.length > 0
    ) {
      const commonTags = item1.tags.filter((tag) => item2.tags?.includes(tag));
      similarity +=
        commonTags.length / Math.max(item1.tags.length, item2.tags.length);
      totalChecks++;
    }

    return totalChecks > 0 ? similarity / totalChecks : 0;
  }

  /**
   * Calculate text similarity using Levenshtein distance
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const normalized1 = text1.toLowerCase().trim();
    const normalized2 = text2.toLowerCase().trim();

    if (normalized1 === normalized2) return 1;

    const distance = this.levenshteinDistance(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);

    return maxLength > 0 ? 1 - distance / maxLength : 0;
  }

  /**
   * Calculate tag similarity
   */
  private calculateTagSimilarity(tags1: string[], tags2: string[]): number {
    const set1 = new Set(tags1.map((t) => t.toLowerCase()));
    const set2 = new Set(tags2.map((t) => t.toLowerCase()));

    const intersection = new Set(Array.from(set1).filter((x) => set2.has(x)));
    const union = new Set(Array.from(set1).concat(Array.from(set2)));

    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Levenshtein distance algorithm
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Get reason for duplicate detection
   */
  private getDuplicateReason(
    newItem: ContentItem,
    existing: ContentItem
  ): string {
    const reasons: string[] = [];

    // Check for exact title match
    if (
      newItem.title &&
      existing.title &&
      newItem.title.toLowerCase() === existing.title.toLowerCase()
    ) {
      reasons.push('exact title match');
    }

    // Check for similar title
    if (
      newItem.title &&
      existing.title &&
      this.calculateTextSimilarity(newItem.title, existing.title) > 0.8
    ) {
      reasons.push('similar title');
    }

    // Check for same category
    if (
      newItem.category &&
      existing.category &&
      newItem.category === existing.category
    ) {
      reasons.push('same category');
    }

    // Check for similar description
    if (
      newItem.data?.description &&
      existing.description &&
      this.calculateTextSimilarity(
        newItem.data.description,
        existing.description
      ) > 0.7
    ) {
      reasons.push('similar description');
    }

    // Check for overlapping tags
    if (
      newItem.data?.tags &&
      existing.tags &&
      newItem.data.tags.length > 0 &&
      existing.tags.length > 0
    ) {
      const commonTags = newItem.data.tags.filter((tag) =>
        existing.tags?.includes(tag)
      );
      if (commonTags.length > 0) {
        reasons.push(`shared tags: ${commonTags.join(', ')}`);
      }
    }

    return reasons.length > 0 ? reasons.join(', ') : 'general similarity';
  }

  /**
   * Transform database row to ContentItem
   */
  private transformRowToContentItem(row: Record<string, unknown>): ContentItem {
    return {
      id: row.id as string,
      title: row.title as string,
      description: (row.description as string) || '',
      category: ((row.content_type as string) || 'Courses') as ContentCategory,
      status: ((row.status as string) || 'Not Started') as ContentStatus,
      progress: (row.progress as number) || 0,
      dueDate:
        (row.published_at as string) ||
        (row.created_at as string) ||
        new Date().toISOString(),
      lastUpdated:
        (row.updated_at as string) ||
        (row.last_modified_at as string) ||
        new Date().toISOString(),
      tags: (row.tags as string[]) || [],
      domain: (row.domain as string) || '',
      contentType: (row.content_type as string) || 'article',
      department: (row.department as string) || '',
    };
  }

  /**
   * Prevent duplicate content from being added
   */
  async preventDuplicate(
    newItem: Partial<ContentItem>
  ): Promise<{ allowed: boolean; duplicates: DuplicateCheckResult[] }> {
    const duplicates = await this.checkForDuplicates(newItem);

    // If high similarity duplicates exist, prevent addition
    const highSimilarityDuplicates = duplicates.filter(
      (d) => d.similarity > 0.8
    );

    return {
      allowed: highSimilarityDuplicates.length === 0,
      duplicates,
    };
  }

  /**
   * Get duplicate suggestions for existing content
   */
  async findDuplicateSuggestions(): Promise<
    Array<{ item: ContentItem; duplicates: ContentItem[] }>
  > {
    try {
      const { data: allItems, error } = await supabase
        .from(this.tableName)
        .select('*');

      if (error) throw error;

      const suggestions: Array<{
        item: ContentItem;
        duplicates: ContentItem[];
      }> = [];
      const processed = new Set<string>();

      allItems?.forEach((item1: Record<string, unknown>) => {
        if (processed.has(item1.id as string)) return;

        const duplicates: ContentItem[] = [];

        allItems.forEach((item2: Record<string, unknown>) => {
          if (item1.id === item2.id || processed.has(item2.id as string))
            return;

          const similarity = this.calculateSimilarity(
            this.transformRowToContentItem(item1),
            this.transformRowToContentItem(item2)
          );

          if (similarity > this.similarityThreshold) {
            duplicates.push(this.transformRowToContentItem(item2));
            processed.add(item2.id as string);
          }
        });

        if (duplicates.length > 0) {
          suggestions.push({
            item: this.transformRowToContentItem(item1),
            duplicates,
          });
          processed.add(item1.id as string);
        }
      });

      return suggestions;
    } catch (error) {
      console.error('Error finding duplicate suggestions:', error);
      return [];
    }
  }

  findDuplicateGroups(contentItems: ContentItem[]): DuplicateGroup[] {
    const groups: DuplicateGroup[] = [];
    const processed = new Set<string>();

    for (let i = 0; i < contentItems.length; i++) {
      const item1 = contentItems[i];
      if (processed.has(item1.id)) continue;

      const group: ContentItem[] = [item1];
      processed.add(item1.id);

      for (let j = i + 1; j < contentItems.length; j++) {
        const item2 = contentItems[j];
        if (item1.id === item2.id || processed.has(item2.id)) continue;

        const similarity = this.calculateSimilarity(item1, item2);
        if (similarity >= this.similarityThreshold) {
          group.push(item2);
          processed.add(item2.id);
        }
      }

      if (group.length > 1) {
        groups.push({
          items: group,
          similarity: this.calculateGroupSimilarity(group),
          reason: this.getGroupDuplicateReason(group),
        });
      }
    }

    return groups;
  }

  /**
   * Calculate similarity for a group of items
   */
  private calculateGroupSimilarity(group: ContentItem[]): number {
    if (group.length < 2) return 0;

    let totalSimilarity = 0;
    let comparisons = 0;

    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        totalSimilarity += this.calculateSimilarity(group[i], group[j]);
        comparisons++;
      }
    }

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  /**
   * Get duplicate reason for a group
   */
  private getGroupDuplicateReason(group: ContentItem[]): string {
    if (group.length < 2) return '';

    const reasons: string[] = [];

    // Check for common category
    const categories = group.map((item) => item.category).filter(Boolean);
    if (categories.length > 1 && new Set(categories).size === 1) {
      reasons.push(`same category: ${categories[0]}`);
    }

    // Check for common tags
    const allTags = group.flatMap((item) => item.data?.tags || []);
    if (allTags.length > 0) {
      const tagCounts = allTags.reduce(
        (acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const commonTags = Object.entries(tagCounts)
        .filter(([, count]) => (count as number) > 1)
        .map(([tag]) => tag);

      if (commonTags.length > 0) {
        reasons.push(`shared tags: ${commonTags.join(', ')}`);
      }
    }

    return reasons.length > 0 ? reasons.join(', ') : 'general similarity';
  }
}

// Export singleton instance
export const duplicatePreventionService = new DuplicatePreventionService();
