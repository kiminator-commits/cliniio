import { useState, useEffect, useCallback } from 'react';
import { Room, CleaningAnalytics } from '../models';
import { Checklist } from '../types';
import { EnvironmentalCleanService } from '../services/EnvironmentalCleanService';
import { createUserFriendlyError } from '../services/errors/EnvironmentalCleanServiceError';

interface UseEnvironmentalCleanDataManagerReturn {
  rooms: Room[];
  checklists: Checklist[];
  analytics: CleaningAnalytics | null;
  loading: boolean;
  error: string | null;
  fetchRooms: () => Promise<void>;
  fetchChecklists: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const useEnvironmentalCleanDataManager =
  (): UseEnvironmentalCleanDataManagerReturn => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [checklists, setChecklists] = useState<Checklist[]>([]);
    const [analytics, setAnalytics] = useState<CleaningAnalytics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleError = (error: unknown, operation: string): void => {
      const friendlyError = createUserFriendlyError(error as Error, operation);
      setError(friendlyError.message);
      console.error(`❌ ${operation} failed:`, friendlyError);
    };

    const fetchRooms = useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const rooms = await EnvironmentalCleanService.fetchRooms();
        setRooms(rooms);
      } catch (error) {
        handleError(error, 'fetchRooms');
      } finally {
        setLoading(false);
      }
    }, []);

    const fetchChecklists = useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const checklists = await EnvironmentalCleanService.fetchChecklists();
        setChecklists(checklists);
      } catch (error) {
        handleError(error, 'fetchChecklists');
      } finally {
        setLoading(false);
      }
    }, []);

    const fetchAnalytics = useCallback(async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        const analytics = await EnvironmentalCleanService.fetchAnalytics();
        setAnalytics(analytics);
      } catch (error) {
        handleError(error, 'fetchAnalytics');
      } finally {
        setLoading(false);
      }
    }, []);

    const refreshData = useCallback(async (): Promise<void> => {
      // Don't await - let data load in background
      Promise.all([fetchRooms(), fetchChecklists(), fetchAnalytics()]).catch(
        (error) => {
          console.error('Background data refresh failed:', error);
        }
      );
    }, [fetchRooms, fetchChecklists, fetchAnalytics]);

    // Load data on mount - defer to avoid blocking initial render
    useEffect(() => {
      const timer = setTimeout(() => {
        refreshData();
      }, 0);
      return () => clearTimeout(timer);
    }, [refreshData]);

    return {
      rooms,
      checklists,
      analytics,
      loading,
      error,
      fetchRooms,
      fetchChecklists,
      fetchAnalytics,
      refreshData,
    };
  };
