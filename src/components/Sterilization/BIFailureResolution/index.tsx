import React from 'react';
import { createPortal } from 'react-dom';
import { useBIFailureResolution } from './hooks/useBIFailureResolution';
import { BIFailureHeader } from './BIFailureHeader';
import { BIFailureStatus } from './BIFailureStatus';
import { BIFailureWorkflowSteps } from './BIFailureWorkflowSteps';
import { BIFailureErrorDisplay } from './BIFailureErrorDisplay';
import { BIFailureActions } from './BIFailureActions';
import { PatientExposureReport } from '../PatientExposureReport';

/**
 * Props for the BIFailureResolution component.
 * @interface BIFailureResolutionProps
 * @property {boolean} isOpen - Controls the visibility of the BI failure resolution modal
 * @property {() => void} onClose - Callback function triggered when the modal is closed
 */
interface BIFailureResolutionProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Main BI Failure Resolution modal component.
 * Orchestrates the complete BI failure resolution workflow by combining focused sub-components.
 * Handles modal state, business logic, and user interactions for incident resolution.
 * Provides a comprehensive interface for operators to resolve BI failure incidents.
 *
 * @param {BIFailureResolutionProps} props - Component props containing modal state and close callback
 * @returns {JSX.Element | null} BI failure resolution modal or null if not open
 */
export const BIFailureResolution: React.FC<BIFailureResolutionProps> = ({
  isOpen,
  onClose,
}) => {
  // Business logic separated into hook
  const {
    // State
    isLoading,
    error,
    showExposureReport,
    resolutionNotes,
    biFailureDetails,

    // Actions
    handleResolve,
    handleRetry,
    handleClose,
    handleBackdropClick,
    handleKeyDown,
    toggleExposureReport,
    updateResolutionNotes,

    // Utilities
    getErrorColor,
    isResolveButtonDisabled,
    getResolveButtonText,
  } = useBIFailureResolution({
    onClose,
    onSuccess: () => {
      // Additional success handling can be added here
      // Debug logging removed for production
    },
  });

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4"
      style={{ paddingTop: '12rem' }}
      onClick={handleBackdropClick}
      role="button"
      tabIndex={0}
      aria-label="Close modal by clicking outside"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Create a synthetic MouseEvent to reuse the handler
          const syntheticEvent = {
            ...e,
            target: e.currentTarget,
            currentTarget: e.currentTarget,
            // Add the properties expected by handleBackdropClick
            nativeEvent: e.nativeEvent,
            bubbles: true,
            cancelable: true,
            button: 0,
          } as unknown as React.MouseEvent<HTMLDivElement>;
          handleBackdropClick(syntheticEvent);
        }
      }}
    >
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <div
        className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto transform translate-y-16 scrollbar-hide"
        role="dialog"
        aria-labelledby="bi-failure-modal-title"
        aria-describedby="bi-failure-modal-description"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <BIFailureHeader isSubmitting={isLoading} onClose={handleClose} />

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Status */}
          <BIFailureStatus biFailureDetails={biFailureDetails} />

          {/* Workflow Steps */}
          <BIFailureWorkflowSteps
            showExposureReport={showExposureReport}
            onToggleExposureReport={toggleExposureReport}
          />

          {/* Error Display */}
          <BIFailureErrorDisplay
            error={error}
            onRetry={handleRetry}
            getErrorColor={getErrorColor}
          />

          {/* Actions */}
          <BIFailureActions
            isLoading={isLoading}
            isResolveButtonDisabled={isResolveButtonDisabled()}
            resolveButtonText={getResolveButtonText()}
            resolutionNotes={resolutionNotes}
            onResolve={handleResolve}
            onCancel={handleClose}
            onUpdateNotes={updateResolutionNotes}
          />
        </div>
      </div>

      {/* Patient Exposure Report Modal */}
      {showExposureReport && (
        <PatientExposureReport
          isOpen={showExposureReport}
          onClose={toggleExposureReport}
          incidentId={biFailureDetails?.id}
        />
      )}
    </div>,
    document.body
  );
};
