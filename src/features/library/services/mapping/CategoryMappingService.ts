import { ContentCategory } from '../../../pages/KnowledgeHub/types';
import { CategoryMapping } from '../types/categoryTypes';

export class CategoryMappingService {
  // Comprehensive category mapping with confidence scores
  private categoryMappings: CategoryMapping[] = [
    // Direct mappings (high confidence)
    {
      libraryCategory: 'Courses',
      knowledgeHubCategory: 'Courses',
      confidence: 1.0,
      reasoning: 'Direct category match',
    },
    {
      libraryCategory: 'Learning Pathways',
      knowledgeHubCategory: 'Learning Pathways',
      confidence: 1.0,
      reasoning: 'Direct category match',
    },
    {
      libraryCategory: 'Procedures',
      knowledgeHubCategory: 'Procedures',
      confidence: 1.0,
      reasoning: 'Direct category match',
    },
    {
      libraryCategory: 'Policies',
      knowledgeHubCategory: 'Policies',
      confidence: 1.0,
      reasoning: 'Direct category match',
    },

    // Related mappings (medium-high confidence)
    {
      libraryCategory: 'SDS Sheets',
      knowledgeHubCategory: 'Procedures',
      confidence: 0.9,
      reasoning: 'SDS sheets contain safety procedures',
    },
    {
      libraryCategory: 'Safety',
      knowledgeHubCategory: 'Procedures',
      confidence: 0.85,
      reasoning: 'Safety content typically involves procedures',
    },
    {
      libraryCategory: 'Training',
      knowledgeHubCategory: 'Courses',
      confidence: 0.9,
      reasoning: 'Training content fits courses category',
    },
    {
      libraryCategory: 'Guidelines',
      knowledgeHubCategory: 'Policies',
      confidence: 0.8,
      reasoning: 'Guidelines are policy-like content',
    },
    {
      libraryCategory: 'Protocols',
      knowledgeHubCategory: 'Procedures',
      confidence: 0.95,
      reasoning: 'Protocols are detailed procedures',
    },
    {
      libraryCategory: 'Standards',
      knowledgeHubCategory: 'Policies',
      confidence: 0.85,
      reasoning: 'Standards are policy-like requirements',
    },

    // Department-specific mappings
    {
      libraryCategory: 'Sterilization',
      knowledgeHubCategory: 'Procedures',
      confidence: 0.9,
      reasoning: 'Sterilization involves specific procedures',
    },
    {
      libraryCategory: 'Infection Control',
      knowledgeHubCategory: 'Procedures',
      confidence: 0.9,
      reasoning: 'Infection control involves procedures',
    },
    {
      libraryCategory: 'Equipment',
      knowledgeHubCategory: 'Procedures',
      confidence: 0.8,
      reasoning: 'Equipment content often involves procedures',
    },
    {
      libraryCategory: 'Maintenance',
      knowledgeHubCategory: 'Procedures',
      confidence: 0.85,
      reasoning: 'Maintenance involves procedures',
    },

    // Leadership and management mappings
    {
      libraryCategory: 'Leadership',
      knowledgeHubCategory: 'Learning Pathways',
      confidence: 0.8,
      reasoning: 'Leadership development is a learning pathway',
    },
    {
      libraryCategory: 'Management',
      knowledgeHubCategory: 'Learning Pathways',
      confidence: 0.8,
      reasoning: 'Management skills form a learning pathway',
    },
    {
      libraryCategory: 'Supervision',
      knowledgeHubCategory: 'Learning Pathways',
      confidence: 0.75,
      reasoning: 'Supervision skills are part of leadership pathway',
    },

    // Advanced content mappings
    {
      libraryCategory: 'Advanced',
      knowledgeHubCategory: 'Advanced',
      confidence: 1.0,
      reasoning: 'Direct advanced category match',
    },
    {
      libraryCategory: 'Expert',
      knowledgeHubCategory: 'Advanced',
      confidence: 0.95,
      reasoning: 'Expert level content is advanced',
    },
    {
      libraryCategory: 'Specialist',
      knowledgeHubCategory: 'Advanced',
      confidence: 0.9,
      reasoning: 'Specialist content is typically advanced',
    },
  ];

  /**
   * Find mapping for a library category
   */
  findMapping(libraryCategory: string): CategoryMapping | undefined {
    return this.categoryMappings.find(
      (mapping) =>
        mapping.libraryCategory.toLowerCase() === libraryCategory.toLowerCase()
    );
  }

  /**
   * Get all category mappings
   */
  getAllMappings(): CategoryMapping[] {
    return [...this.categoryMappings];
  }

  /**
   * Get department-specific category
   */
  getDepartmentCategory(department: string): ContentCategory | null {
    const deptMappings: Record<string, ContentCategory> = {
      Sterilization: 'Procedures',
      Surgery: 'Procedures',
      Emergency: 'Procedures',
      Nursing: 'Procedures',
      Management: 'Learning Pathways',
      Administration: 'Policies',
      'Quality Assurance': 'Policies',
      Compliance: 'Policies',
      Training: 'Courses',
      Education: 'Courses',
    };

    return deptMappings[department] || null;
  }

  /**
   * Validate and normalize category names
   */
  validateCategory(category: string): ContentCategory {
    const normalizedCategory = category.trim();

    // Direct matches
    if (this.isValidKnowledgeHubCategory(normalizedCategory)) {
      return normalizedCategory as ContentCategory;
    }

    // Try to find a mapping
    const mapping = this.findMapping(normalizedCategory);

    if (mapping) {
      return mapping.knowledgeHubCategory;
    }

    // Default fallback
    return 'Courses';
  }

  /**
   * Get all valid Knowledge Hub categories
   */
  getValidCategories(): ContentCategory[] {
    return [
      'Courses',
      'Procedures',
      'Policies',
      'Learning Pathways',
      'Advanced',
    ];
  }

  /**
   * Check if category is a valid Knowledge Hub category
   */
  private isValidKnowledgeHubCategory(category: string): boolean {
    const validCategories = this.getValidCategories();
    return validCategories.includes(category as ContentCategory);
  }
}
