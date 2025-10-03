import React from 'react';
import { createPortal } from 'react-dom';

interface NewCycleModalProps {
  isOpen: boolean;
  operatorName: string;
  onOperatorNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOperatorNameKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onStartCycle: () => void;
  onClose: () => void;
  getStartCycleButtonState: (operatorName: string) => {
    disabled: boolean;
    className: string;
  };
}

/**
 * NewCycleModal component for starting new sterilization cycles.
 * Displays a modal for entering operator name and starting a cycle.
 */
export const NewCycleModal: React.FC<NewCycleModalProps> = ({
  isOpen,
  operatorName,
  onOperatorNameChange,
  onOperatorNameKeyPress,
  onStartCycle,
  onClose,
  getStartCycleButtonState,
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999]"
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
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Start New Sterilization Cycle
        </h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="operator-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Operator Name
            </label>
            <input
              id="operator-name"
              type="text"
              value={operatorName}
              onChange={onOperatorNameChange}
              placeholder="Enter operator name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4ECDC4] focus:border-[#4ECDC4]"
              onKeyPress={onOperatorNameKeyPress}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onStartCycle}
              disabled={getStartCycleButtonState(operatorName).disabled}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${getStartCycleButtonState(operatorName).className}`}
            >
              Start Cycle
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
