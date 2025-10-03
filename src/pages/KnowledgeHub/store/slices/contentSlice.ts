import { StateCreator } from 'zustand';
import { ContentItem, ContentCategory } from '../../types';

// Helper: get all possible categories
const ALL_CATEGORIES: ContentCategory[] = [
  'Courses',
  'Procedures',
  'Policies',
  'Learning Pathways',
  'Advanced',
];

// Content State interface
export interface ContentState {
  content: ContentItem[];
  isLoading: boolean;
  error: unknown | null;

  // Computed values
  selectedContent: ContentItem[];
  categoryCounts: Record<string, number>;
}

// Content Actions interface
export interface ContentActions {
  setContent: (content: ContentItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: unknown | null) => void;
  updateSelectedContent: (selectedCategory: string) => void;
}

// Combined content slice type
export type ContentSlice = ContentState & ContentActions;

// Content slice creator
export const createContentSlice: StateCreator<ContentSlice> = (set, get) => ({
  // Initial state
  content: [],
  isLoading: false,
  error: null,
  selectedContent: [],
  categoryCounts: {},

  // Content Actions
  setContent: (content: ContentItem[]) => {
    const categoryCounts = content.reduce(
      (acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    ALL_CATEGORIES.forEach((cat) => {
      if (!(cat in categoryCounts)) categoryCounts[cat] = 0;
    });

    set({ content, categoryCounts });
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: unknown | null) => set({ error }),

  updateSelectedContent: (selectedCategory: string) => {
    const { content } = get();
    const selectedContent = selectedCategory
      ? content.filter((item) => item.category === selectedCategory)
      : [];
    set({ selectedContent });
  },
});
