import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../contexts/UserContext';
import { fetchUserDrafts, ContentDraft, DraftsByType } from '../services/contentDraftsService';

export interface UseDraftsReturn {
  drafts: DraftsByType;
  loading: boolean;
  error: string | null;
  refreshDrafts: () => Promise<void>;
  getDraftsByType: (contentType: keyof DraftsByType) => ContentDraft[];
}

export function useDrafts(): UseDraftsReturn {
  const { currentUser } = useUser();
  const [drafts, setDrafts] = useState<DraftsByType>({
    courses: [],
    policies: [],
    procedures: [],
    learning_pathways: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDrafts = useCallback(async () => {
    if (!currentUser?.id || !currentUser?.facility_id) {
      setDrafts({
        courses: [],
        policies: [],
        procedures: [],
        learning_pathways: []
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const userDrafts = await fetchUserDrafts(currentUser.id, currentUser.facility_id);
      setDrafts(userDrafts);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load drafts';
      setError(errorMessage);
      console.error('Error loading drafts:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.facility_id]);

  const refreshDrafts = useCallback(async () => {
    await loadDrafts();
  }, [loadDrafts]);

  const getDraftsByType = useCallback((contentType: keyof DraftsByType): ContentDraft[] => {
    return drafts[contentType] || [];
  }, [drafts]);

  // Load drafts on mount and when user changes
  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  return {
    drafts,
    loading,
    error,
    refreshDrafts,
    getDraftsByType
  };
}
