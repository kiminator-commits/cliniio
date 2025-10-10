import { ContentItem as LibraryContentItem } from '../../libraryTypes';
import {
  ContentItem as KnowledgeHubContentItem,
  ContentCategory,
} from '../../../../pages/KnowledgeHub/types';
import { AutoCategorizationResult } from '../types/categoryTypes';
import { CategoryMappingService } from '../mapping/CategoryMappingService';

export class CategoryAnalyzer {
  private mappingService: CategoryMappingService;

  // Keywords for content analysis
  private categoryKeywords: Record<ContentCategory, string[]> = {
    Courses: [
      'course',
      'training',
      'education',
      'learning',
      'tutorial',
      'workshop',
      'seminar',
      'certification',
      'accreditation',
      'curriculum',
      'module',
      'lesson',
      'session',
    ],
    Procedures: [
      'procedure',
      'protocol',
      'process',
      'step',
      'instruction',
      'method',
      'technique',
      'workflow',
      'routine',
      'checklist',
      'guideline',
      'standard',
      'practice',
    ],
    Policies: [
      'policy',
      'rule',
      'regulation',
      'standard',
      'requirement',
      'compliance',
      'governance',
      'directive',
      'mandate',
      'framework',
      'principle',
      'guideline',
    ],
    'Learning Pathways': [
      'pathway',
      'journey',
      'progression',
      'development',
      'career',
      'growth',
      'advancement',
      'roadmap',
      'track',
      'program',
      'curriculum',
      'sequence',
      'series',
    ],
    Advanced: [
      'advanced',
      'expert',
      'specialist',
      'master',
      'senior',
      'complex',
      'sophisticated',
      'specialized',
      'technical',
      'professional',
      'leadership',
      'management',
    ],
  };

  constructor(mappingService: CategoryMappingService) {
    this.mappingService = mappingService;
  }

  /**
   * Automatically categorize content based on title, description, and category
   */
  async autoCategorizeContent(
    content: LibraryContentItem | KnowledgeHubContentItem
  ): Promise<AutoCategorizationResult> {
    const reasoning: string[] = [];
    let bestCategory: ContentCategory = 'Courses';
    let bestConfidence = 0;
    const suggestedTags: string[] = [];

    // 1. Check direct category mapping
    const directMapping = this.mappingService.findMapping(
      content.category || ''
    );

    if (directMapping) {
      bestCategory = directMapping.knowledgeHubCategory;
      bestConfidence = directMapping.confidence;
      reasoning.push(directMapping.reasoning);
    }

    // 2. Analyze content text for keywords
    const contentText =
      `${content.title} ${content.description || ''}`.toLowerCase();

    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      const matchingKeywords = keywords.filter((keyword) =>
        contentText.includes(keyword.toLowerCase())
      );

      if (matchingKeywords.length > 0) {
        const keywordConfidence = Math.min(0.8, matchingKeywords.length * 0.2);

        if (keywordConfidence > bestConfidence) {
          bestCategory = category as ContentCategory;
          bestConfidence = keywordConfidence;
          reasoning.push(`Contains keywords: ${matchingKeywords.join(', ')}`);
        }

        suggestedTags.push(...matchingKeywords);
      }
    }

    // 3. Analyze content level for advanced categorization
    if (
      'level' in content &&
      content.level &&
      content.level.toLowerCase().includes('advanced')
    ) {
      if (bestConfidence < 0.9) {
        bestCategory = 'Advanced';
        bestConfidence = 0.9;
        reasoning.push('Content marked as advanced level');
      }
    }

    // 4. Check for learning pathway indicators
    if (
      content.title.toLowerCase().includes('pathway') ||
      content.title.toLowerCase().includes('journey') ||
      content.title.toLowerCase().includes('program')
    ) {
      if (bestConfidence < 0.85) {
        bestCategory = 'Learning Pathways';
        bestConfidence = 0.85;
        reasoning.push('Title suggests learning pathway content');
      }
    }

    // 5. Department-based categorization
    if (content.department) {
      const deptCategory = this.mappingService.getDepartmentCategory(
        content.department
      );
      if (deptCategory && bestConfidence < 0.8) {
        bestCategory = deptCategory;
        bestConfidence = 0.8;
        reasoning.push(
          `Department-specific categorization: ${content.department}`
        );
      }
    }

    return {
      category: bestCategory,
      confidence: Math.min(1.0, bestConfidence),
      reasoning,
      suggestedTags: Array.from(new Set(suggestedTags)), // Remove duplicates
    };
  }
}
