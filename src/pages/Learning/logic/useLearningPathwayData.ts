// Learning Pathway Data Hook
// Manages learning pathway data and progress tracking

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface PathwayItem {
  id: string;
  title: string;
  description: string;
  type: 'course' | 'module' | 'lesson' | 'assessment' | 'practical';
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
  completed: boolean;
  progress: number; // 0-100
  lastAccessed?: string;
  estimatedCompletion?: string;
  resources: {
    videos: string[];
    documents: string[];
    links: string[];
  };
  learningObjectives: string[];
  tags: string[];
}

export interface PathwaySection {
  id: string;
  title: string;
  description: string;
  order: number;
  items: PathwayItem[];
  completed: boolean;
  progress: number; // 0-100
  prerequisites: string[];
  estimatedDuration: number; // in minutes
}

export interface LearningPathway {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  sections: PathwaySection[];
  totalDuration: number; // in minutes
  completed: boolean;
  progress: number; // 0-100
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  isPublic: boolean;
}

export interface LearningProgress {
  pathwayId: string;
  userId: string;
  currentSectionId?: string;
  currentItemId?: string;
  overallProgress: number;
  completedSections: string[];
  completedItems: string[];
  timeSpent: number; // in minutes
  lastAccessed: string;
  startedAt: string;
  completedAt?: string;
}

export interface UseLearningPathwayDataReturn {
  pathways: LearningPathway[];
  currentPathway: LearningPathway | null;
  progress: LearningProgress | null;
  loading: boolean;
  error: string | null;
  contentItems: PathwayItem[];
  filteredContent: PathwayItem[];
  isLoading: boolean;
  searchQuery: string;
  contentTypeFilter: string;
  newSectionName: string;
  isModalOpen: (modalType: string) => boolean;
  setNewSectionName: (name: string) => void;
  setSearchQuery: (query: string) => void;
  setContentTypeFilter: (filter: string) => void;
  addToPathway: (item: PathwayItem) => void;
  removeFromPathway: (itemId: string) => void;
  movePathwayItem: (itemId: string, newIndex: number) => void;
  addSection: (section: PathwaySection) => void;
  selectPathway: (pathwayId: string) => void;
  updateProgress: (itemId: string, progress: number) => Promise<void>;
  markComplete: (itemId: string) => Promise<void>;
  markSectionComplete: (sectionId: string) => Promise<void>;
  resetProgress: (pathwayId: string) => Promise<void>;
  refreshPathways: () => Promise<void>;
}

export function useLearningPathwayData(
  userId?: string
): UseLearningPathwayDataReturn {
  const [pathways, setPathways] = useState<LearningPathway[]>([]);
  const [currentPathway, setCurrentPathway] = useState<LearningPathway | null>(
    null
  );
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentItems, setContentItems] = useState<PathwayItem[]>([]);
  const [filteredContent, _setFilteredContent] = useState<PathwayItem[]>([]);
  const [isLoading, _setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [contentTypeFilter, setContentTypeFilter] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [modalStates, _setModalStates] = useState<Record<string, boolean>>({});

  // Fetch learning pathways
  const fetchPathways = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('learning_pathways')
        .select('*')
        .eq('isPublic', true)
        .order('createdAt', { ascending: false });

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      setPathways(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pathways');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user progress
  const fetchProgress = useCallback(
    async (pathwayId: string) => {
      if (!userId) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('learning_progress')
          .select('*')
          .eq('pathwayId', pathwayId)
          .eq('userId', userId)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          // Not found error
          throw new Error(fetchError.message);
        }

        setProgress(data || null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch progress'
        );
      }
    },
    [userId]
  );

  // Select a pathway
  const selectPathway = useCallback(
    (pathwayId: string) => {
      const pathway = pathways.find((p) => p.id === pathwayId);
      if (pathway) {
        setCurrentPathway(pathway);
        fetchProgress(pathwayId);
      }
    },
    [pathways, fetchProgress]
  );

  // Update item progress
  const updateProgress = useCallback(
    async (itemId: string, progressValue: number) => {
      if (!userId || !currentPathway) return;

      try {
        const progressData = {
          pathwayId: currentPathway.id,
          userId,
          currentItemId: itemId,
          overallProgress: progressValue,
          timeSpent: (progress?.timeSpent || 0) + 1, // Increment by 1 minute
          lastAccessed: new Date().toISOString(),
          startedAt: progress?.startedAt || new Date().toISOString(),
        };

        const { error } = await supabase
          .from('learning_progress')
          .upsert(progressData, { onConflict: 'pathwayId,userId' });

        if (error) {
          throw new Error(error.message);
        }

        setProgress(
          (prev) =>
            ({
              ...prev,
              ...progressData,
            }) as LearningProgress
        );

        // Update pathway progress
        setCurrentPathway((prev) => {
          if (!prev) return prev;

          const updatedSections = prev.sections.map((section) => {
            const updatedItems = section.items.map((item) => {
              if (item.id === itemId) {
                return { ...item, progress: progressValue };
              }
              return item;
            });

            const sectionProgress =
              updatedItems.reduce((sum, item) => sum + item.progress, 0) /
              updatedItems.length;

            return {
              ...section,
              items: updatedItems,
              progress: sectionProgress,
              completed: sectionProgress === 100,
            };
          });

          const overallProgress =
            updatedSections.reduce(
              (sum, section) => sum + section.progress,
              0
            ) / updatedSections.length;

          return {
            ...prev,
            sections: updatedSections,
            progress: overallProgress,
            completed: overallProgress === 100,
          };
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update progress'
        );
      }
    },
    [userId, currentPathway, progress]
  );

  // Mark item as complete
  const markComplete = useCallback(
    async (itemId: string) => {
      await updateProgress(itemId, 100);
    },
    [updateProgress]
  );

  // Mark section as complete
  const markSectionComplete = useCallback(
    async (sectionId: string) => {
      if (!currentPathway) return;

      const section = currentPathway.sections.find((s) => s.id === sectionId);
      if (!section) return;

      // Mark all items in section as complete
      for (const item of section.items) {
        await markComplete(item.id);
      }
    },
    [currentPathway, markComplete]
  );

  // Reset progress
  const resetProgress = useCallback(
    async (pathwayId: string) => {
      if (!userId) return;

      try {
        const { error } = await supabase
          .from('learning_progress')
          .delete()
          .eq('pathwayId', pathwayId)
          .eq('userId', userId);

        if (error) {
          throw new Error(error.message);
        }

        setProgress(null);

        // Reset pathway progress
        setCurrentPathway((prev) => {
          if (!prev || prev.id !== pathwayId) return prev;

          const resetSections = prev.sections.map((section) => ({
            ...section,
            items: section.items.map((item) => ({
              ...item,
              completed: false,
              progress: 0,
            })),
            completed: false,
            progress: 0,
          }));

          return {
            ...prev,
            sections: resetSections,
            completed: false,
            progress: 0,
          };
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to reset progress'
        );
      }
    },
    [userId]
  );

  // Refresh pathways
  const refreshPathways = useCallback(async () => {
    await fetchPathways();
  }, [fetchPathways]);

  // Modal management
  const isModalOpen = useCallback(
    (modalType: string) => {
      return modalStates[modalType] || false;
    },
    [modalStates]
  );

  // Content management functions
  const addToPathway = useCallback((item: PathwayItem) => {
    setContentItems((prev) => [...prev, item]);
  }, []);

  const removeFromPathway = useCallback((itemId: string) => {
    setContentItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  const movePathwayItem = useCallback((itemId: string, newIndex: number) => {
    setContentItems((prev) => {
      const items = [...prev];
      const currentIndex = items.findIndex((item) => item.id === itemId);
      if (currentIndex !== -1) {
        const [item] = items.splice(currentIndex, 1);
        items.splice(newIndex, 0, item);
      }
      return items;
    });
  }, []);

  const addSection = useCallback(
    (section: PathwaySection) => {
      if (currentPathway) {
        setCurrentPathway((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sections: [...prev.sections, section],
          };
        });
      }
    },
    [currentPathway]
  );

  // Load pathways on mount
  useEffect(() => {
    fetchPathways();
  }, [fetchPathways]);

  return {
    pathways,
    currentPathway,
    progress,
    loading,
    error,
    contentItems,
    filteredContent,
    isLoading,
    searchQuery,
    contentTypeFilter,
    newSectionName,
    isModalOpen,
    setNewSectionName,
    setSearchQuery,
    setContentTypeFilter,
    addToPathway,
    removeFromPathway,
    movePathwayItem,
    addSection,
    selectPathway,
    updateProgress,
    markComplete,
    markSectionComplete,
    resetProgress,
    refreshPathways,
  };
}
