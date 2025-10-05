import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiTestTube, mdiCheckCircle, mdiAlertCircle } from '@mdi/js';
import { useSterilizationStore } from '../../store/sterilizationStore';
import { BITestResult } from '../../types/toolTypes';
import { BIFailConfirmationModal } from './BIFailConfirmationModal';
import { useQuarantineData } from './BIFailureResolution/hooks/useQuarantineData';

interface BITestBannerProps {
  isVisible: boolean;
  onComplete: (result: BITestResult) => void;
  onOptOut: () => void;
}

const BITestBanner: React.FC<BITestBannerProps> = ({
  isVisible,
  onComplete,
  onOptOut,
}) => {
  const [showFailConfirmation, setShowFailConfirmation] = useState(false);
  const [pendingResult, setPendingResult] = useState<
    'pass' | 'fail' | 'skip' | null
  >(null);

  const { currentCycle, enforceBI } = useSterilizationStore();
  const quarantineData = useQuarantineData();

  if (!isVisible || !enforceBI) return null;

  const handleResultSelect = (result: 'pass' | 'fail' | 'skip') => {
    if (result === 'fail') {
      setPendingResult(result);
      setShowFailConfirmation(true);
      return;
    }

    const testResult: BITestResult = {
      id: `bi-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      toolId: 'default',
      passed: result === 'pass',
      date: new Date(),
      status: result,
      operator: currentCycle?.operator || 'Operator',
    };

    // If skipping, trigger the opt-out logic AND save the result
    if (result === 'skip') {
      onOptOut();
    }

    onComplete(testResult);
  };

  const handleFailConfirm = () => {
    // Debug logging removed for production
    setShowFailConfirmation(false);
    if (pendingResult) {
      const testResult: BITestResult = {
        id: `bi-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        toolId: 'default',
        passed: false,
        date: new Date(),
        status: 'fail',
        operator: currentCycle?.operator || 'Operator',
      };

      // Activate global BI failure banner
      const { activateBIFailure } = useSterilizationStore.getState();

      // Calculate actual affected tools count from quarantine data (all tools since last successful BI test)
      const affectedToolsCount = quarantineData.totalToolsAffected;
      const affectedBatchIds = quarantineData.affectedCycles
        .map((cycle) => cycle.batchId)
        .filter((batchId): batchId is string => Boolean(batchId));

      activateBIFailure({
        affectedToolsCount,
        affectedBatchIds,
        operator: currentCycle?.operator || 'Operator',
      });

      // Debug logging removed for production
      onComplete(testResult);
    }
    setPendingResult(null);
  };

  const handleFailCancel = () => {
    setShowFailConfirmation(false);
    setPendingResult(null);
  };

  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-4 rounded-r-lg shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-orange-100 rounded-lg flex-shrink-0">
            <Icon path={mdiTestTube} size={1.2} className="text-orange-600" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-orange-800">
                Daily BI Test Required
              </h3>
              <span className="text-sm text-orange-600">
                ({new Date().toLocaleDateString()})
              </span>
            </div>

            <p className="text-orange-700 text-sm mb-3">
              Please complete the daily Biological Indicator test to ensure
              sterilization compliance.
            </p>

            {/* Result Selection */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleResultSelect('pass')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-green-300 hover:border-green-500 bg-green-50 hover:bg-green-100 text-green-800 transition-colors"
              >
                <Icon
                  path={mdiCheckCircle}
                  size={1}
                  className="text-green-600"
                />
                <span className="text-sm font-medium">PASS</span>
              </button>

              <button
                onClick={() => handleResultSelect('fail')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-red-300 hover:border-red-500 bg-red-50 hover:bg-red-100 text-red-800 transition-colors"
              >
                <Icon path={mdiAlertCircle} size={1} className="text-red-600" />
                <span className="text-sm font-medium">FAIL</span>
              </button>

              <button
                onClick={() => handleResultSelect('skip')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-300 hover:border-gray-500 bg-gray-50 hover:bg-gray-100 text-gray-800 transition-colors"
              >
                <Icon path={mdiTestTube} size={1} className="text-gray-600" />
                <span className="text-sm font-medium">SKIP</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAIL Confirmation Modal */}
      <BIFailConfirmationModal
        isOpen={showFailConfirmation}
        onConfirm={handleFailConfirm}
        onCancel={handleFailCancel}
        operatorName={currentCycle?.operator || 'Operator'}
      />
    </div>
  );
};

export default BITestBanner;
