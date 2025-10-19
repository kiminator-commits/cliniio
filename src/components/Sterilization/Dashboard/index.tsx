import React, { useEffect, useCallback, useMemo, memo } from 'react';
import { useSterilizationStore } from '../../../store/sterilizationStore';
import { useCleanBIStore } from '../../../store/biStore';
import BITestBanner from '../BITestBanner';
import { checkBITestDue } from '../../../utils/checkBITestDue';
import { useDashboardLogic } from '../hooks/useDashboardLogic';
import { useDashboardState } from './hooks/useDashboardState';
import { BITestResult } from '../../../types/toolTypes';
import { DashboardHeader } from './DashboardHeader';
import {
  initializeBIFailureState,
} from '../../../services/bi/failure/index';

import { DashboardTabs } from './DashboardTabs';
import { NewCycleModal } from './NewCycleModal';
import BatchCodeModal from '../BatchCodeModal';

/**
 * Props for the SterilizationDashboard component.
 * @interface SterilizationDashboardProps
 * @property {React.ComponentType} [SterilizationAnalyticsComponent] - Optional custom analytics component to display sterilization metrics and performance data. If not provided, the default analytics view will be used. Allows for customization of the analytics display while maintaining the core dashboard functionality.
 */
interface SterilizationDashboardProps {
  SterilizationAnalyticsComponent?: React.ComponentType;
}

/**
 * SterilizationDashboard component that provides the main interface for sterilization management.
 * Displays cycle controls, phase timers, analytics, and logs in a tabbed interface.
 */
const SterilizationDashboard: React.FC<SterilizationDashboardProps> = memo(
  ({ SterilizationAnalyticsComponent }) => {
    // Use the clean BI store for BI-related functionality
    const {
      recordBITestResult,
      lastBITestDate,
      biTestOptedOut,
      setBiTestOptedOut,
      enforceBI,
    } = useCleanBIStore();

    // Keep using the sterilization store for non-BI functionality
    const {
      startNewCycle,
      showBatchCodeModal,
      setShowBatchCodeModal,
    } = useSterilizationStore();

    // Business logic separated into hook
    const {
      tabs,
      validateOperatorName,
      getTabButtonClasses,
      getStartCycleButtonState,
    } = useDashboardLogic();

    // Dashboard state management
    const {
      activeTab,
      showNewCycleModal,
      operatorName,
      handleTabChange,
      handleOperatorNameChange,
      handleCloseNewCycleModal,
      resetOperatorName,
    } = useDashboardState();

    // Initialize BI data on mount
    useEffect(() => {
      // Initialize BI data on mount
      initializeBIFailureState();

      // Clean store doesn't need subscription management
    }, []);

    // Check for BI test due every 5 minutes instead of every minute for better performance
    useEffect(() => {
      let timeoutId: NodeJS.Timeout | null = null;
      let isMounted = true; // Track if component is still mounted

      function loopCheck() {
        // Only continue if component is still mounted
        if (!isMounted) return;

        // Check if BI test is due (but don't auto-trigger - banner will handle visibility)
        checkBITestDue(lastBITestDate);

        // Increased interval from 60000ms (1 minute) to 300000ms (5 minutes)
        timeoutId = setTimeout(loopCheck, 300000);
      }

      loopCheck();

      return () => {
        isMounted = false; // Mark as unmounted
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };
    }, [lastBITestDate]); // Added lastBITestDate to dependencies

    // Set up real-time updates for sterilization cycles
    // Temporarily disabled to fix production issues
    /*
    useSterilizationRealtime(
      payload => {
        // The store will handle updating the UI automatically
      },
      false // disabled temporarily to stop audit log spam
    );
    */

    const handleBITestComplete = useCallback(
      async (result: BITestResult) => {
        console.log('🔬 Dashboard: handleBITestComplete called with:', result);
        try {
          await recordBITestResult(result);
          console.log('🔬 Dashboard: BI test result recorded successfully');
        } catch (error) {
          console.error('🔬 Dashboard: Error recording BI test result:', error);
        }
      },
      [recordBITestResult]
    );

    const handleStartNewCycle = useCallback(() => {
      if (validateOperatorName(operatorName)) {
        startNewCycle(operatorName.trim());
        handleCloseNewCycleModal();
        resetOperatorName();
      }
    }, [
      operatorName,
      startNewCycle,
      validateOperatorName,
      handleCloseNewCycleModal,
      resetOperatorName,
    ]);

    const handleBITestOptOut = useCallback(() => {
      setBiTestOptedOut(true);
    }, [setBiTestOptedOut]);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleBITestDismiss = useCallback(() => {
      // Dismiss BI test banner - could be implemented to hide for a period
    }, []);

    // Calculate if BI test banner should be shown
    const shouldShowBITestBanner = useMemo(() => {
      if (!enforceBI || biTestOptedOut) return false;

      const today = new Date().toDateString();
      const lastTestDate = lastBITestDate
        ? new Date(lastBITestDate).toDateString()
        : null;

      console.log('🔬 Dashboard: Banner visibility check:', {
        enforceBI,
        biTestOptedOut,
        lastBITestDate,
        lastTestDate,
        today,
        shouldShow: lastTestDate !== today
      });

      return lastTestDate !== today;
    }, [enforceBI, biTestOptedOut, lastBITestDate]);

    // Handle Enter key press in operator name input
    const handleOperatorNameKeyPressWithStart = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          handleStartNewCycle();
        }
      },
      [handleStartNewCycle]
    );

    // Performance logging removed for production

    return (
      <div className="space-y-6">
        {/* BI Test Banner */}
        <BITestBanner
          isVisible={shouldShowBITestBanner}
          onComplete={handleBITestComplete}
          onOptOut={handleBITestOptOut}
        />

        <DashboardHeader />

        <DashboardTabs
          activeTab={activeTab}
          tabs={tabs}
          SterilizationAnalyticsComponent={SterilizationAnalyticsComponent}
          onTabChange={handleTabChange}
          getTabButtonClasses={getTabButtonClasses}
        />

        <NewCycleModal
          isOpen={showNewCycleModal}
          operatorName={operatorName}
          onOperatorNameChange={handleOperatorNameChange}
          onOperatorNameKeyPress={handleOperatorNameKeyPressWithStart}
          onClose={handleCloseNewCycleModal}
          onStartCycle={handleStartNewCycle}
          getStartCycleButtonState={getStartCycleButtonState}
        />

        <BatchCodeModal
          isOpen={showBatchCodeModal}
          onClose={() => setShowBatchCodeModal(false)}
        />
      </div>
    );
  }
);

SterilizationDashboard.displayName = 'SterilizationDashboard';

export default SterilizationDashboard;
