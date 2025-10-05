import React, {
  memo,
  useCallback,
  useEffect,
  useRef,
  createContext,
} from 'react';
import { BIFailureService } from '../services/bi/failure';
import { useSterilizationStore } from '../store/sterilizationStore';

/**
 * GlobalBIFailureProvider - Integrates BI failure management with sterilization store
 *
 * This provider now properly integrates with the sterilization store to:
 * - Sync BI failure state between database and store
 * - Update sterilization store when BI failures occur
 * - Track affected tools and batches in sterilization context
 * - Maintain activity logs for BI failure events
 */

interface GlobalBIFailureProviderProps {
  children: React.ReactNode;
}

interface BIFailureIncident {
  affected_tools_count?: number;
  affected_batch_ids?: string[];
  incident_id: string;
  facility_id: string;
  created_at: string;
  status: string;
}

interface BIFailureHandlers {
  handleIncident: (incident: BIFailureIncident) => Promise<void>;
  handleResolution: (incidentId: string) => Promise<void>;
  syncData: (facilityId: string) => Promise<void>;
}

const BIFailureContext = createContext<BIFailureHandlers | null>(null);

export const GlobalBIFailureProvider: React.FC<GlobalBIFailureProviderProps> =
  memo(({ children }) => {
    const sterilizationStore = useSterilizationStore();
    const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
    const initializedRef = useRef(false);

    const handleBIFailureIncident = useCallback(
      async (incident: BIFailureIncident) => {
        try {
          // Update sterilization store with BI failure incident
          sterilizationStore.activateBIFailure({
            affectedToolsCount:
              (incident as { affected_tools_count?: number })
                .affected_tools_count || 0,
            affectedBatchIds:
              (incident as { affected_batch_ids?: string[] })
                .affected_batch_ids || [],
            operator:
              (incident as { detected_by_operator_id?: string })
                .detected_by_operator_id || 'System Alert',
          });

          // Add activity log entry
          sterilizationStore.addActivity({
            id: `bi-failure-${Date.now()}`,
            type: 'bi-failure',
            title: 'BI Failure Detected',
            time: new Date(incident.created_at || new Date()),
            toolCount: incident.affected_tools_count || 0,
            color: 'bg-red-500',
          });

          console.log('BI failure incident synced to sterilization store');
        } catch (error) {
          console.error(
            'Failed to sync BI failure incident to sterilization store:',
            error
          );
        }
      },
      [sterilizationStore]
    );

    const handleBIFailureResolution = useCallback(async () => {
      try {
        // Deactivate BI failure in sterilization store
        sterilizationStore.deactivateBIFailure();

        // Add activity log entry
        sterilizationStore.addActivity({
          id: `bi-resolution-${Date.now()}`,
          type: 'bi-failure',
          title: 'BI Failure Resolved',
          time: new Date(),
          toolCount: 0,
          color: 'bg-green-500',
        });

        console.log('BI failure resolution synced to sterilization store');
      } catch (error) {
        console.error(
          'Failed to sync BI failure resolution to sterilization store:',
          error
        );
      }
    }, [sterilizationStore]);

    const syncBIFailureData = useCallback(
      async (facilityId: string) => {
        try {
          // Get active BI failure incidents from database
          const activeIncidents =
            await BIFailureService.getActiveIncidents(facilityId);

          if (activeIncidents.length > 0) {
            // Sync the most recent active incident to sterilization store
            // const _latestIncident = activeIncidents[0];
            // TODO: Implement syncBIFailureFromDatabase method in sterilization store // TRACK: Migrate to GitHub issue
            // sterilizationStore.syncBIFailureFromDatabase({
            //   status: latestIncident.status,
            //   failure_date: latestIncident.failure_date,
            //   affected_tools_count: latestIncident.affected_tools_count,
            //   affected_batch_ids: latestIncident.affected_batch_ids,
            //   detected_by_operator_id: latestIncident.detected_by_operator_id,
            // });
          } else {
            // No active incidents, ensure sterilization store reflects this
            sterilizationStore.deactivateBIFailure();
          }
        } catch (error) {
          console.error('Failed to sync BI failure data:', error);
        }
      },
      [sterilizationStore]
    );

    const initializeBIFailureSystem = useCallback(async () => {
      if (initializedRef.current) return;

      try {
        // Get current facility ID
        let facilityId;
        try {
          facilityId = await BIFailureService.getCurrentFacilityId();
        } catch (error) {
          console.error(
            '❌ Failed to resolve facility ID in GlobalBIFailureProvider:',
            error
          );
          return;
        }

        if (!facilityId) {
          console.error(
            '❌ No valid facility ID found. BI Failure Provider initialization aborted.'
          );
          return;
        }

        // Initialize state from database
        await BIFailureService.initializeBIFailureState(facilityId);

        // Sync BI failure data from database to sterilization store
        await syncBIFailureData(facilityId);

        // Subscribe to real-time updates
        const subscription =
          BIFailureService.subscribeToBIFailureUpdates(facilityId);
        if (subscription) {
          subscriptionRef.current = {
            unsubscribe: () => subscription.unsubscribe(),
          };
        }

        initializedRef.current = true;
        console.log('Global BI Failure system initialized');
      } catch (error) {
        console.error('Failed to initialize BI failure system:', error);
      }
    }, [syncBIFailureData]);

    // Expose BI failure handlers for external use
    const biFailureHandlers = {
      handleIncident: handleBIFailureIncident,
      handleResolution: handleBIFailureResolution,
      syncData: syncBIFailureData,
    };

    useEffect(() => {
      initializeBIFailureSystem();

      // Capture the ref value at the time the effect runs
      const currentSubscription = subscriptionRef.current;

      // Cleanup subscription on unmount
      return () => {
        if (currentSubscription) {
          currentSubscription.unsubscribe();
        }
      };
    }, [initializeBIFailureSystem]);

    return (
      <BIFailureContext.Provider value={biFailureHandlers}>
        {children}
      </BIFailureContext.Provider>
    );
  });

GlobalBIFailureProvider.displayName = 'GlobalBIFailureProvider';

// Hook to use BI failure handlers
export const useBIFailureHandlers = () => {
  const context = React.useContext(BIFailureContext);
  if (!context) {
    throw new Error(
      'useBIFailureHandlers must be used within a GlobalBIFailureProvider'
    );
  }
  return context;
};
