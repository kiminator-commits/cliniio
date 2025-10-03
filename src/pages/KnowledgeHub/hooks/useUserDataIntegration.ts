import { useState, useEffect, useCallback } from 'react';
import { UserDataIntegrationService } from '../services/userDataIntegrationService';
import { ContentItem, ContentStatus, ContentCategory } from '../types';
import {
  UserLearningProgress,
  ContentRecommendation,
  UserProfile,
} from '../services/userDataIntegrationService';

export const useUserDataIntegration = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [userContent, setUserContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUserData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const service = new UserDataIntegrationService();
      const profile = await service.getUserProfile();
      setCurrentUser(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadUserContent = useCallback(async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setError(null);

      const service = new UserDataIntegrationService();
      const progress = await service.getUserLearningProgress(currentUser.id);

      const contentWithProgress = progress.map(
        (progress: UserLearningProgress) => ({
          id: progress.contentId,
          title: progress.title,
          category: progress.category as ContentCategory,
          status: progress.status as ContentStatus,
          description: '',
          tags: [],
          domain: '',
          contentType: 'course',
          type: 'course',
          createdAt: '',
          lastUpdated: progress.lastAccessed,
          archivedAt: undefined,
          estimatedDuration: undefined,
          difficultyLevel: '',
          department: progress.department,
          authorId: undefined,
          assignedBy: progress.assignedBy,
          isRepeat: false,
          isActive: true,
          content: {},
          media: [],
          dueDate: '',
          progress: progress.progress,
        })
      );

      setUserContent(contentWithProgress);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load user content'
      );
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  useEffect(() => {
    if (currentUser) {
      loadUserContent();
    }
  }, [currentUser, loadUserContent]);

  const updateContentProgress = useCallback(
    async (contentId: string, progress: number, status: ContentStatus) => {
      try {
        setUserContent((prevContent) =>
          prevContent.map((item) =>
            item.id === contentId ? { ...item, progress, status } : item
          )
        );

        const service = new UserDataIntegrationService();
        await service.trackLearningActivity({
          contentId,
          action: status === 'published' ? 'completed' : 'started',
          duration: progress,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to update progress'
        );
      }
    },
    []
  );

  const getPersonalizedRecommendations = useCallback(
    async (limit: number = 10) => {
      if (!currentUser) return [];

      try {
        const service = new UserDataIntegrationService();
        const recommendations = await service.getPersonalizedRecommendations(
          currentUser.id,
          limit
        );

        return recommendations.map((rec: ContentRecommendation) => ({
          id: rec.contentId,
          title: rec.title,
          category: rec.category as ContentCategory,
          status: 'Not Started' as ContentStatus,
          description: '',
          tags: rec.tags || [],
          domain: '',
          contentType: 'course',
          type: 'course',
          createdAt: '',
          lastUpdated: '',
          archivedAt: undefined,
          estimatedDuration: rec.estimatedDuration,
          difficultyLevel: rec.difficulty,
          department: '',
          authorId: undefined,
          assignedBy: undefined,
          isRepeat: false,
          isActive: true,
          content: {},
          media: [],
          dueDate: '',
          progress: 0,
        }));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to get recommendations'
        );
        return [];
      }
    },
    [currentUser]
  );

  return {
    currentUser,
    userContent,
    isLoading,
    error,
    updateContentProgress,
    getPersonalizedRecommendations,
    refreshData: loadUserData,
  };
};
