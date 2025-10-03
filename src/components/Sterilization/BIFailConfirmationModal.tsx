import React from 'react';
import { createPortal } from 'react-dom';
import { useQuarantineData } from './BIFailureResolution/hooks/useQuarantineData';
import { QuarantineSummary } from './BIFailureResolution/components/QuarantineSummary';
import { AffectedCyclesList } from './BIFailureResolution/components/AffectedCyclesList';
import { AffectedToolsList } from './BIFailureResolution/components/AffectedToolsList';
import { RequiredActions } from './BIFailureResolution/components/RequiredActions';
import { OperatorConfirmation } from './BIFailureResolution/components/OperatorConfirmation';
import { ModalHeader } from './BIFailureResolution/components/ModalHeader';
import { WarningMessage } from './BIFailureResolution/components/WarningMessage';

interface BIFailConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  operatorName: string;
}

export const BIFailConfirmationModal: React.FC<
  BIFailConfirmationModalProps
> = ({ isOpen, onConfirm, onCancel, operatorName }) => {
  const quarantineData = useQuarantineData();

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onCancel}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onCancel();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <ModalHeader onCancel={onCancel} />

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto bi-modal-scrollbar-hide">
          <WarningMessage />

          <QuarantineSummary quarantineData={quarantineData} />

          <AffectedCyclesList affectedCycles={quarantineData.affectedCycles} />

          <AffectedToolsList affectedTools={quarantineData.affectedTools} />

          <RequiredActions
            totalToolsAffected={quarantineData.totalToolsAffected}
          />

          <OperatorConfirmation
            operatorName={operatorName}
            totalToolsAffected={quarantineData.totalToolsAffected}
            totalCyclesAffected={quarantineData.totalCyclesAffected}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            Confirm BI Test Failure
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
