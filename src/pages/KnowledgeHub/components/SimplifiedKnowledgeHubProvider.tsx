import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { knowledgeHubSupabaseService } from '../services/knowledgeHubSupabaseService';
import type { ContentItem } from '../types';

interface KnowledgeHubContextType {
  content: ContentItem[];
  selectedContent: ContentItem | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addItem: (item: ContentItem) => Promise<void>;
  updateItem: (id: string, changes: Partial<ContentItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
}

const KnowledgeHubContext = createContext<KnowledgeHubContextType | undefined>(
  undefined
);

export const KnowledgeHubProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      const data = await knowledgeHubSupabaseService.getAllContentItems();
      setContent(data || []);
      setError(null);
    } catch (err: any) {
      console.error('Error loading Knowledge Hub content:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: ContentItem) => {
    try {
      const newItem = await knowledgeHubSupabaseService.addContentItem(item);
      setContent((prev) => [...prev, newItem]);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateItem = async (id: string, changes: Partial<ContentItem>) => {
    try {
      const updated = await knowledgeHubSupabaseService.updateContentItem(
        id,
        changes
      );
      setContent((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await knowledgeHubSupabaseService.deleteContentItem(id);
      setContent((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await updateItem(id, { status });
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <KnowledgeHubContext.Provider
      value={{
        content,
        selectedContent,
        loading,
        error,
        refresh,
        addItem,
        updateItem,
        deleteItem,
        updateStatus,
      }}
    >
      {children}
    </KnowledgeHubContext.Provider>
  );
};

export const useKnowledgeHub = () => {
  const ctx = useContext(KnowledgeHubContext);
  if (!ctx)
    throw new Error('useKnowledgeHub must be used within KnowledgeHubProvider');
  return ctx;
};
