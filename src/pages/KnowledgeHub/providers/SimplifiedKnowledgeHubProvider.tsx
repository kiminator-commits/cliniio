import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
  useEffect,
} from 'react';
import { ContentItem } from '../types';
import { ProviderService } from '../services/providerService';
import { supabase } from '@/lib/supabaseClient';

// Function that fetches content from available tables
const getAllContentItems = async (): Promise<ContentItem[]> => {
  try {
    const { data, error } = await supabase
      .from('knowledge_hub_content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch Knowledge Hub content:', error.message);
      return [];
    }

    console.log(
      `✅ Loaded ${data?.length || 0} Knowledge Hub items from Supabase`
    );
    return data || [];
  } catch (err) {
    console.error('❌ Unexpected error fetching Knowledge Hub content:', err);
    return [];
  }
};

interface SimplifiedKnowledgeHubContextType {
  content: ContentItem[];
  selectedContent: ContentItem[] | null;
  selectedCategory: string | null;
  isLoading: boolean;
  error: Error | null;
  validationError: string | null;
  setSelectedCategory: (category: string) => void;
  getCategoryCount: (category: string) => number;
  refetchContent: () => Promise<void>;
  deleteContent: (contentId: string) => Promise<boolean>;
  updateContentStatus: (contentId: string, status: string) => Promise<boolean>;
  updateContent: (
    contentId: string,
    updates: Partial<ContentItem>
  ) => Promise<boolean>;
  clearValidationError: () => void;
}

const SimplifiedKnowledgeHubContext = createContext<
  SimplifiedKnowledgeHubContextType | undefined
>(undefined);

interface SimplifiedKnowledgeHubProviderProps {
  children: ReactNode;
}

export const SimplifiedKnowledgeHubProvider: React.FC<
  SimplifiedKnowledgeHubProviderProps
> = ({ children }) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const refetchContent = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch content immediately without waiting for auth
      const fetchedContent = await getAllContentItems();
      // Performance optimization: Removed excessive logging
      setContent(fetchedContent);
      setSelectedContent(fetchedContent);

      // Set default category if none is selected
      if (!selectedCategory && fetchedContent.length > 0) {
        const defaultCategory = fetchedContent[0].category;
        // Performance optimization: Removed excessive logging
        setSelectedCategory(defaultCategory);
      }

      // Try to get user from Supabase in the background (non-blocking)
      supabase.auth
        .getUser()
        .then((userResult) => {
          if (userResult?.data?.user) {
            // userId = userResult.data.user.id; // Uncomment when needed
          }
        })
        .catch((authError) => {
          console.warn('Supabase auth not available:', authError);
          // Continue with default user ID for test environments
        });
    } catch (err) {
      const errorMessage = ProviderService.getErrorMessage(err);
      setError(ProviderService.createError(errorMessage));
      console.error('❌ KnowledgeHub: Error fetching content:', err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // selectedCategory intentionally excluded to prevent infinite loops

  // Fetch user-specific content on mount - defer to avoid blocking initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      // Performance optimization: Removed excessive logging
      refetchContent();
    }, 0);
    return () => clearTimeout(timer);
  }, [refetchContent]); // Include refetchContent dependency

  const updateContent = useCallback(
    async (
      contentId: string,
      updates: Partial<ContentItem>
    ): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const updatedContent = await ProviderService.performContentUpdate(
          contentId,
          updates
        );
        setContent((prevContent) =>
          ProviderService.updateContentInList(
            prevContent,
            contentId,
            updatedContent
          )
        );

        return true;
      } catch (err) {
        const errorMessage = ProviderService.getErrorMessage(err);
        setError(ProviderService.createError(errorMessage));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteContent = useCallback(
    async (contentId: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        await ProviderService.performContentDeletion(contentId);
        setContent((prevContent) =>
          ProviderService.removeContentFromList(prevContent, contentId)
        );

        return true;
      } catch (err) {
        const errorMessage = ProviderService.getErrorMessage(err);
        setError(ProviderService.createError(errorMessage));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const getCategoryCount = useCallback(
    (category: string): number => {
      return ProviderService.getCategoryCount(content, category);
    },
    [content]
  );

  const updateContentStatus = useCallback(
    async (contentId: string, status: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const updatedContent = await ProviderService.performContentStatusUpdate(
          contentId,
          status
        );
        setContent((prevContent) =>
          ProviderService.updateContentInList(
            prevContent,
            contentId,
            updatedContent
          )
        );

        return true;
      } catch (err) {
        const errorMessage = ProviderService.getErrorMessage(err);
        setError(ProviderService.createError(errorMessage));
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  const handleSetSelectedCategory = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      // Filter content by category
      const filteredContent = content.filter(
        (item) => item.category === category
      );
      setSelectedContent(filteredContent);
    },
    [content]
  );

  const value: SimplifiedKnowledgeHubContextType = {
    content,
    selectedContent,
    selectedCategory,
    isLoading,
    error,
    validationError,
    setSelectedCategory: handleSetSelectedCategory,
    getCategoryCount,
    refetchContent,
    deleteContent,
    updateContentStatus,
    updateContent,
    clearValidationError,
  };

  return (
    <SimplifiedKnowledgeHubContext.Provider value={value}>
      {children}
    </SimplifiedKnowledgeHubContext.Provider>
  );
};

export const useSimplifiedKnowledgeHub =
  (): SimplifiedKnowledgeHubContextType => {
    const context = useContext(SimplifiedKnowledgeHubContext);
    if (context === undefined) {
      throw new Error(
        'useSimplifiedKnowledgeHub must be used within a SimplifiedKnowledgeHubProvider'
      );
    }
    return context;
  };
