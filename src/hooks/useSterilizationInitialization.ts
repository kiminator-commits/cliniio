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
  const [isLoading, setIsLoading] = useState(false); // Start as false to prevent blocking
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStore = async () => {
      if (isInitialized || facilityLoading) return;

      // Wait for user authentication to complete
      if (!currentUser) {
        console.log('⏳ Waiting for user authentication...');
        return;
      }

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

  // Non-blocking analytics initialization - runs immediately
  useEffect(() => {
    if (isInitialized) return;

    const initializeAnalyticsImmediately = async () => {
      try {
        // Don't set loading to true to prevent blocking UI
        setError(null);

        // Try to get facility ID from context
        const facilityId = getCurrentFacilityId();
        if (!facilityId) {
          console.log(
            '⚠️ No facility ID available, skipping sterilization initialization'
          );
          return;
        }

        // Load sterilization cycles for analytics (read-only) - no user auth required
        await loadCycles(facilityId);

        // Mark as initialized for analytics (tools will still require user auth)
        setIsInitialized(true);
        console.log('✅ Sterilization analytics initialized successfully');
      } catch (err) {
        console.error('Failed to initialize sterilization analytics:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    // Start immediately, don't wait for timeout
    initializeAnalyticsImmediately();
  }, [isInitialized, loadCycles, getCurrentFacilityId]);

  return {
    isInitialized,
    isLoading,
    error,
    hasData: availableTools.length > 0,
  };
};
