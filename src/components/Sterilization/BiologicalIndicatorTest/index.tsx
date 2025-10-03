import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useBiologicalIndicatorLogic } from '../hooks/useBiologicalIndicatorLogic';
import { BITestResult } from '@/types/sterilizationTypes';
import { BITestHeader } from './BITestHeader';
import { BITestContent } from './BITestContent';
import { BITestResultSelector } from './BITestResultSelector';
import { BITestWarning } from './BITestWarning';
import { BITestActions } from './BITestActions';
import { BIFailConfirmationModal } from '../BIFailConfirmationModal';
import { BiologicalIndicatorService } from '../services/biologicalIndicatorService';

/**
 * Props for the BiologicalIndicatorTest component.
 * @interface BiologicalIndicatorTestProps
 * @property {boolean} isOpen - Controls the visibility of the BI test modal. When true, the modal is displayed; when false, the modal is hidden. Required for modal state management.
 * @property {() => void} onClose - Callback function triggered when the user closes the BI test modal. Used to update the parent component's modal state and clean up any pending operations.
 * @property {(result: BITestResult) => void} onComplete - Callback function triggered when the BI test result is successfully recorded. Receives the test result object containing pass/fail status, timestamp, and operator information. Used to update the sterilization system's compliance records.
 * @property {string} [operatorName='Operator'] - The name of the operator performing the BI test. Used for audit trail and compliance documentation. Optional with default value 'Operator'.
 */
interface BiologicalIndicatorTestProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: BITestResult) => void;
  operatorName?: string;
}

const BiologicalIndicatorTest: React.FC<BiologicalIndicatorTestProps> = ({
  isOpen,
  onClose,
  onComplete,
  operatorName = 'Operator',
}) => {
  const [selectedResult, setSelectedResult] = useState<'pass' | 'fail' | null>(
    null
  );
  const [isSubmitting] = useState(false);
  const [showFailConfirmation, setShowFailConfirmation] = useState(false);

  // Business logic separated into hook
  const {
    handleSubmit,
    getFailWarningMessage,
    shouldShowFailWarning,
    getSubmitButtonState,
    getResultSelectionClasses,
    getCurrentDateTime,
  } = useBiologicalIndicatorLogic({
    selectedResult,
    isSubmitting,
    operatorName,
    onComplete,
    onClose,
  });

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedResult(null);
      setShowFailConfirmation(false);
      onClose();
    }
  };

  const handleResultSelect = (result: 'pass' | 'fail' | null) => {
    setSelectedResult(result);
    if (result === 'fail') {
      setShowFailConfirmation(true);
    }
  };

  const handleFailConfirm = () => {
    setShowFailConfirmation(false);
    // Continue with the normal submission process
    if (selectedResult) {
      const result = BiologicalIndicatorService.createBITestResult(
        selectedResult,
        operatorName
      );
      setTimeout(() => {
        onComplete(result);
        onClose();
      }, 500);
    }
  };

  // Override the original handleSubmit to prevent the alert for FAIL
  const handleSubmitOverride = () => {
    if (selectedResult === 'fail') {
      // Don't call the original handleSubmit for FAIL - let the confirmation modal handle it
      return;
    }
    // For PASS, use the original logic
    handleSubmit();
  };

  const handleFailCancel = () => {
    setShowFailConfirmation(false);
    setSelectedResult(null);
  };

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const submitButtonState = getSubmitButtonState();

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999] p-4"
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: 99999,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
      }}
    >
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
        <BITestHeader onClose={handleClose} isSubmitting={isSubmitting} />

        <BITestContent getCurrentDateTime={getCurrentDateTime} />

        <div className="px-6">
          <BITestResultSelector
            selectedResult={selectedResult}
            onResultSelect={handleResultSelect}
            getResultSelectionClasses={getResultSelectionClasses}
          />

          <BITestWarning
            shouldShow={shouldShowFailWarning()}
            message={getFailWarningMessage()}
          />

          <BITestActions
            onSubmit={handleSubmitOverride}
            onCancel={handleClose}
            isSubmitting={isSubmitting}
            submitButtonState={submitButtonState}
          />
        </div>
      </div>

      {/* FAIL Confirmation Modal */}
      <BIFailConfirmationModal
        isOpen={showFailConfirmation}
        onConfirm={handleFailConfirm}
        onCancel={handleFailCancel}
        operatorName={operatorName}
      />
    </div>,
    document.body
  );
};

export default BiologicalIndicatorTest;
