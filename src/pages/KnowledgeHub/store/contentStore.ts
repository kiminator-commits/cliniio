import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ContentItem, ContentCategory } from '../types';

// Helper: get all possible categories
const ALL_CATEGORIES: ContentCategory[] = [
  'Courses',
  'Procedures',
  'Policies',
  'Learning Pathways',
  'Advanced',
];

// Content State interface
interface ContentState {
  content: ContentItem[];
  isLoading: boolean;
  error: unknown | null;

  // Computed values
  selectedContent: ContentItem[];
  categoryCounts: Record<string, number>;
}

// Content Actions interface
interface ContentActions {
  setContent: (content: ContentItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: unknown | null) => void;
  updateSelectedContent: (selectedCategory: string) => void;
}

// Combined content store type
type ContentStore = ContentState & ContentActions;

// Create the content store
export const useContentStore = create<ContentStore>()(
  devtools((set, get) => ({
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
  }))
);

// Selector hooks for content state
export const useContent = () => useContentStore((state) => state.content);
export const useSelectedContent = () =>
  useContentStore((state) => state.selectedContent);
export const useLoading = () => useContentStore((state) => state.isLoading);
export const useError = () => useContentStore((state) => state.error);
export const useCategoryCounts = () =>
  useContentStore((state) => state.categoryCounts);

// Action hooks for content
export const useSetContent = () => useContentStore((state) => state.setContent);
export const useSetLoading = () => useContentStore((state) => state.setLoading);
export const useSetError = () => useContentStore((state) => state.setError);
export const useUpdateSelectedContent = () =>
  useContentStore((state) => state.updateSelectedContent);

// Computed selectors
export const useCategoryCount = (category: string) =>
  useContentStore((state) => state.categoryCounts[category] || 0);
