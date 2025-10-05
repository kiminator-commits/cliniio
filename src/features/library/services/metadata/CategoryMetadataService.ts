import { ContentCategory } from '../../../pages/KnowledgeHub/types';
import { CategoryMetadata } from '../types/categoryTypes';

export class CategoryMetadataService {
  /**
   * Get category description and metadata
   */
  getCategoryMetadata(category: ContentCategory): CategoryMetadata {
    const metadata: Record<ContentCategory, CategoryMetadata> = {
      Courses: {
        name: 'Courses',
        description:
          'Structured learning content with objectives and assessments',
        icon: 'school',
        color: '#3B82F6',
        examples: [
          'Training modules',
          'Certification courses',
          'Workshops',
          'Seminars',
        ],
      },
      Procedures: {
        name: 'Procedures',
        description:
          'Step-by-step instructions for specific tasks and processes',
        icon: 'clipboard-list',
        color: '#10B981',
        examples: [
          'Safety protocols',
          'Equipment procedures',
          'Clinical guidelines',
          'Maintenance steps',
        ],
      },
      Policies: {
        name: 'Policies',
        description:
          'Organizational rules, standards, and compliance requirements',
        icon: 'shield-check',
        color: '#F59E0B',
        examples: [
          'Safety policies',
          'Quality standards',
          'Regulatory requirements',
          'Organizational rules',
        ],
      },
      'Learning Pathways': {
        name: 'Learning Pathways',
        description:
          'Sequenced learning journeys for skill development and career growth',
        icon: 'map',
        color: '#8B5CF6',
        examples: [
          'Career development tracks',
          'Skill progression paths',
          'Leadership programs',
          'Specialization tracks',
        ],
      },
      Advanced: {
        name: 'Advanced',
        description:
          'Specialized content for experienced professionals and experts',
        icon: 'star',
        color: '#EF4444',
        examples: [
          'Expert-level training',
          'Specialist procedures',
          'Advanced techniques',
          'Master-level content',
        ],
      },
    };

    return metadata[category] || metadata['Courses'];
  }

  /**
   * Get all category metadata
   */
  getAllCategoryMetadata(): Record<ContentCategory, CategoryMetadata> {
    const categories: ContentCategory[] = [
      'Courses',
      'Procedures',
      'Policies',
      'Learning Pathways',
      'Advanced',
    ];

    const result: Record<string, CategoryMetadata> = {};
    categories.forEach((category) => {
      result[category] = this.getCategoryMetadata(category);
    });

    return result as Record<ContentCategory, CategoryMetadata>;
  }
}
