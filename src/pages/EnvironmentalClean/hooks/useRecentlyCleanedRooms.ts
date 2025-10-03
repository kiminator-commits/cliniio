import { useState, useEffect, useCallback } from 'react';
import { EnvironmentalCleanService } from '../services/EnvironmentalCleanService';

interface RecentlyCleanedRoom {
  room: string;
  cleanedAt: string;
  cleanedBy: string;
}

interface UseRecentlyCleanedRoomsResult {
  recentlyCleanedRooms: RecentlyCleanedRoom[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useRecentlyCleanedRooms(
  limit: number = 10
): UseRecentlyCleanedRoomsResult {
  const [recentlyCleanedRooms, setRecentlyCleanedRooms] = useState<
    RecentlyCleanedRoom[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentlyCleanedRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data =
        await EnvironmentalCleanService.fetchRecentlyCleanedRooms(limit);
      setRecentlyCleanedRooms(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch recently cleaned rooms';
      setError(errorMessage);
      console.error('❌ Error fetching recently cleaned rooms:', err);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecentlyCleanedRooms();
  }, [fetchRecentlyCleanedRooms]);

  return {
    recentlyCleanedRooms,
    isLoading,
    error,
    refetch: fetchRecentlyCleanedRooms,
  };
}
