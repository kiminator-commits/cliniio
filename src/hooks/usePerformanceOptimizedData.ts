import { useState, useEffect, useCallback, useRef } from 'react';
import { usePagePerformance } from './usePagePerformance';

interface UsePerformanceOptimizedDataOptions<T> {
  fetchFunction: () => Promise<T>;
  pageName: string;
  cacheKey?: string;
  cacheTime?: number; // milliseconds
  staleTime?: number; // milliseconds
  retryCount?: number;
  retryDelay?: number; // milliseconds
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

interface UsePerformanceOptimizedDataReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  clearError: () => void;
}

// Simple in-memory cache
const dataCache = new Map<
  string,
  { data: unknown; timestamp: number; ttl: number }
>();

export const usePerformanceOptimizedData = <T>({
  fetchFunction,
  pageName,
  cacheKey,
  cacheTime = 5 * 60 * 1000, // 5 minutes
  retryCount = 2,
  retryDelay = 1000,
  onSuccess,
  onError,
}: UsePerformanceOptimizedDataOptions<T>): UsePerformanceOptimizedDataReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Performance tracking
  usePagePerformance(true);

  // Check cache for existing data
  const getCachedData = useCallback((): T | null => {
    if (!cacheKey) return null;

    const cached = dataCache.get(cacheKey);
    if (!cached) return null;

    const now = Date.now();
    const isExpired = now - cached.timestamp > cached.ttl;

    if (isExpired) {
      dataCache.delete(cacheKey);
      return null;
    }

    return cached.data as T;
  }, [cacheKey]);

  // Set cache data
  const setCachedData = useCallback(
    (newData: T) => {
      if (!cacheKey) return;

      dataCache.set(cacheKey, {
        data: newData,
        timestamp: Date.now(),
        ttl: cacheTime,
      });
    },
    [cacheKey, cacheTime]
  );

  // Core fetch function with retry logic
  const fetchData = useCallback(
    async (isRetry = false): Promise<void> => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const startTime = performance.now();

      try {
        setIsLoading(true);
        setError(null);

        // Check cache first (unless it's a retry)
        if (!isRetry) {
          const cachedData = getCachedData();
          if (cachedData) {
            setData(cachedData);
            setIsLoading(false);
            onSuccess?.(cachedData);
            return;
          }
        }

        const result = await fetchFunction();

        // Check if component is still mounted
        if (
          !isMountedRef.current ||
          abortControllerRef.current.signal.aborted
        ) {
          return;
        }

        setData(result);
        setCachedData(result);
        setRetryAttempts(0);
        onSuccess?.(result);

        if (process.env.NODE_ENV === 'development') {
          const fetchTime = performance.now() - startTime;
          console.log(
            `[PERF] ${pageName} data fetched in ${fetchTime.toFixed(2)}ms`
          );
        }
      } catch (err) {
        if (
          !isMountedRef.current ||
          abortControllerRef.current.signal.aborted
        ) {
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        onError?.(errorMessage);

        // Retry logic
        if (retryAttempts < retryCount && !isRetry) {
          setRetryAttempts((prev) => prev + 1);
          setTimeout(() => {
            if (isMountedRef.current) {
              fetchData(true);
            }
          }, retryDelay);
        }

        if (process.env.NODE_ENV === 'development') {
          console.error(`[PERF] ${pageName} data fetch failed:`, errorMessage);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    },
    [
      fetchFunction,
      pageName,
      getCachedData,
      setCachedData,
      retryAttempts,
      retryCount,
      retryDelay,
      onSuccess,
      onError,
    ]
  );

  // Refetch function
  const refetch = useCallback(async (): Promise<void> => {
    // Clear cache for fresh data
    if (cacheKey) {
      dataCache.delete(cacheKey);
    }
    await fetchData();
  }, [fetchData, cacheKey]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch,
    clearError,
  };
};
