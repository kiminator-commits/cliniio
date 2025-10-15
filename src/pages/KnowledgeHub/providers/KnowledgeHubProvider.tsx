import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react';
import { getAllContentItems } from '../services/supabaseService';
import { supabase as _supabase } from '@/lib/supabaseClient';
import type { ContentItem } from '../types';

interface KnowledgeHubContextType {
  content: ContentItem[];
  filteredContent: ContentItem[];
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
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
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { supabase } = knowledgeHubSupabaseService;

  const logAuditEvent = async (action: string, item: ContentItem) => {
    try {
      await supabase.from('ai_audit_logs').insert({
        action,
        module: 'knowledge_hub',
        item_id: item.id,
        item_title: item.title,
        category: item.category,
        timestamp: new Date().toISOString(),
      });
    } catch (err: unknown) {
      console.error('Audit log failed:', err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllContentItems();
      setContent(data || []);
      setError(null);
    } catch (err: unknown) {
      console.error('Error loading Knowledge Hub content:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = async (item: ContentItem) => {
    try {
      // For now, just add to local state - implement actual service call later
      const newItem = { ...item, id: Date.now().toString() };
      setContent((prev) => [...prev, newItem]);
      await logAuditEvent('add', newItem);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const updateItem = async (id: string, changes: Partial<ContentItem>) => {
    try {
      // For now, just update local state - implement actual service call later
      const updated = content.find((c) => c.id === id);
      if (updated) {
        const updatedItem = { ...updated, ...changes };
        setContent((prev) => prev.map((c) => (c.id === id ? updatedItem : c)));
        await logAuditEvent('update', updatedItem);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const deletedItem = content.find((c) => c.id === id);
      // For now, just remove from local state - implement actual service call later
      setContent((prev) => prev.filter((c) => c.id !== id));
      if (deletedItem) await logAuditEvent('delete', deletedItem);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await updateItem(id, { status });
    const updatedItem = content.find((c) => c.id === id);
    if (updatedItem)
      await logAuditEvent('status_update', { ...updatedItem, status });
  };

  // Apply category filtering
  useEffect(() => {
    if (!selectedCategory) {
      setFilteredContent(content);
    } else {
      setFilteredContent(
        content.filter((c) => c.category === selectedCategory)
      );
    }
  }, [content, selectedCategory]);

  // Real-time Supabase subscriptions
  useEffect(() => {
    refresh(); // initial load
    const channel = _supabase
      .channel('knowledge_hub_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'knowledge_hub_content' },
        (payload) => {
          console.info('Realtime update received:', payload.eventType);
          refresh();
        }
      )
      .subscribe();

    return () => {
      _supabase.removeChannel(channel);
    };
  }, [refresh]);

  return (
    <KnowledgeHubContext.Provider
      value={{
        content,
        filteredContent,
        selectedCategory,
        setSelectedCategory,
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
