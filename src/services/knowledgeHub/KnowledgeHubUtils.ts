// ============================================================================
// KNOWLEDGE HUB UTILS - Helper Functions
// ============================================================================

import { ContentCategory } from '../../pages/KnowledgeHub/types';

// Helper function to convert string category to ContentCategory
export const convertStringToContentCategory = (
  category: string
): ContentCategory => {
  const validCategories: ContentCategory[] = [
    'Courses',
    'Procedures',
    'Policies',
    'Learning Pathways',
    'Advanced',
  ];
  return validCategories.includes(category as ContentCategory)
    ? (category as ContentCategory)
    : 'Courses';
};
