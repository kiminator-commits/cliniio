import { useState, useEffect, useCallback } from 'react';
import { SDSSheet } from '../libraryTypes';
import { sdsService } from '../services/sdsService';

interface UseSDSSheetsReturn {
  sdsSheets: SDSSheet[];
  isLoading: boolean;
  error: string | null;
  searchSDSSheets: (query: string) => Promise<void>;
  refreshSDSSheets: () => Promise<void>;
}

export const useSDSSheets = (): UseSDSSheetsReturn => {
  const [sdsSheets, setSdsSheets] = useState<SDSSheet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSDSSheets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const sheets = await sdsService.getAllSDSSheets();
      setSdsSheets(sheets);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch SDS sheets'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchSDSSheets = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        await fetchSDSSheets();
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const results = await sdsService.searchSDSSheets(query);
        setSdsSheets(results);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to search SDS sheets'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [fetchSDSSheets]
  );

  const refreshSDSSheets = useCallback(async () => {
    await fetchSDSSheets();
  }, [fetchSDSSheets]);

  useEffect(() => {
    fetchSDSSheets();
  }, [fetchSDSSheets]);

  return {
    sdsSheets,
    isLoading,
    error,
    searchSDSSheets,
    refreshSDSSheets,
  };
};
