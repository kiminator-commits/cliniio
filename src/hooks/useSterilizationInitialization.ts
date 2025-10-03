import { useEffect, useState } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { ToolService } from '@/services/toolService';
import { useUser } from '@/contexts/UserContext';
import { useFacility } from '@/contexts/FacilityContext';

/**
 * Hook to initialize sterilization store with data from Supabase
 * Fetches available tools, BI test results, and other necessary data
 */
export const useSterilizationInitialization = () => {
  const { currentUser } = useUser();
  const { getCurrentFacilityId, isLoading: facilityLoading } = useFacility();
  const { availableTools, setAvailableTools, loadCycles } =
    useSterilizationStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStore = async () => {
      if (!currentUser || isInitialized || facilityLoading) return;

      try {
        setIsLoading(true);
        setError(null);

        // Get user's facility ID
        const facilityId = getCurrentFacilityId();
        if (!facilityId) {
          throw new Error('User facility not found');
        }

        // Fetch available tools
        const tools = await ToolService.getAvailableTools(facilityId);

        // Update store with fetched data
        setAvailableTools(tools);

        // Load sterilization cycles
        await loadCycles(facilityId);

        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize sterilization store:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    initializeStore();
  }, [
    currentUser,
    isInitialized,
    setAvailableTools,
    loadCycles,
    getCurrentFacilityId,
    facilityLoading,
  ]);

  return {
    isInitialized,
    isLoading,
    error,
    hasData: availableTools.length > 0,
  };
};
