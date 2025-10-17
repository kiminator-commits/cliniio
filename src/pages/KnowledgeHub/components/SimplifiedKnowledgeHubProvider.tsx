import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { KnowledgeHubSupabaseService } from '../services/knowledgeHubSupabaseService';
import type { ContentItem, ContentStatus } from '../types';

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
  const [_selectedContent, _setSelectedContent] = useState<ContentItem | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    try {
      setLoading(true);
      const service = new KnowledgeHubSupabaseService();
      const data = await service.fetchContent();
      setContent(data || []);
      setError(null);
    } catch (err: unknown) {
      console.error('Error loading Knowledge Hub content:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: ContentItem) => {
    try {
      const service = new KnowledgeHubSupabaseService();
      const newItem = await service.createContent(item);
      setContent((prev) => [...prev, newItem]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateItem = async (id: string, changes: Partial<ContentItem>) => {
    try {
      const service = new KnowledgeHubSupabaseService();
      const updated = await service.updateContent(id, changes);
      setContent((prev) => prev.map((c) => (c.id === id ? updated : c)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const service = new KnowledgeHubSupabaseService();
      await service.deleteContent(id);
      setContent((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await updateItem(id, { status: status as ContentStatus });
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <KnowledgeHubContext.Provider
      value={{
        content,
        selectedContent: _selectedContent,
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
