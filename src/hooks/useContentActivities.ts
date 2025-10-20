import { useState, useEffect, useCallback } from 'react';
import { useFacility } from '../contexts/FacilityContext';
import { 
  fetchContentActivities, 
  getContentActivityStats, 
  ContentActivity, 
  ContentActivityFilters 
} from '../services/contentActivityService';

export interface UseContentActivitiesReturn {
  activities: ContentActivity[];
  stats: {
    total_activities: number;
    activities_by_type: Record<string, number>;
    activities_by_content_type: Record<string, number>;
    activities_by_user: Record<string, number>;
    recent_activities: ContentActivity[];
  };
  loading: boolean;
  error: string | null;
  refreshActivities: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export function useContentActivities(filters?: Partial<ContentActivityFilters>): UseContentActivitiesReturn {
  const { getCurrentFacilityId } = useFacility();
  const [activities, setActivities] = useState<ContentActivity[]>([]);
  const [stats, setStats] = useState({
    total_activities: 0,
    activities_by_type: {} as Record<string, number>,
    activities_by_content_type: {} as Record<string, number>,
    activities_by_user: {} as Record<string, number>,
    recent_activities: [] as ContentActivity[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = useCallback(async () => {
    const facilityId = getCurrentFacilityId();
    if (!facilityId) {
      setError('No facility ID available');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const activityFilters: ContentActivityFilters = {
        facility_id: facilityId,
        limit: 50, // Get last 50 activities
        ...filters
      };

      const [activitiesData, statsData] = await Promise.all([
        fetchContentActivities(activityFilters),
        getContentActivityStats(facilityId, 30) // Last 30 days
      ]);

      setActivities(activitiesData);
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load activities';
      setError(errorMessage);
      console.error('Error loading content activities:', err);
    } finally {
      setLoading(false);
    }
  }, [getCurrentFacilityId, filters]);

  const refreshActivities = useCallback(async () => {
    await loadActivities();
  }, [loadActivities]);

  const refreshStats = useCallback(async () => {
    const facilityId = getCurrentFacilityId();
    if (!facilityId) return;

    try {
      const statsData = await getContentActivityStats(facilityId, 30);
      setStats(statsData);
    } catch (err) {
      console.error('Error refreshing stats:', err);
    }
  }, [getCurrentFacilityId]);

  // Load activities on mount and when filters change
  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  return {
    activities,
    stats,
    loading,
    error,
    refreshActivities,
    refreshStats
  };
}
