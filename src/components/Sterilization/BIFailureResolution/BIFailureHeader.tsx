import React from 'react';
import Icon from '@mdi/react';
import { mdiAlert, mdiClose } from '@mdi/js';

/**
 * Props for the BIFailureHeader component.
 * @interface BIFailureHeaderProps
 * @property {boolean} isSubmitting - Whether the form is currently being submitted
 * @property {() => void} onClose - Callback function triggered when the close button is clicked
 */
interface BIFailureHeaderProps {
  isSubmitting: boolean;
  onClose: () => void;
}

/**
 * Header component for BI Failure Resolution modal.
 * Displays the title, status information, and close button.
 * Handles accessibility and keyboard navigation for the modal header.
 *
 * @param {BIFailureHeaderProps} props - Component props containing submission state and close callback
 * @returns {JSX.Element} Header component with title, status, and close functionality
 */
export const BIFailureHeader: React.FC<BIFailureHeaderProps> = ({
  isSubmitting,
  onClose,
}) => {
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSubmitting) {
      handleClose();
    }
  };

  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <div className="flex items-center space-x-3">
        <Icon path={mdiAlert} size={1.5} className="text-red-500" />
        <div>
          <h2
            id="bi-failure-modal-title"
            className="text-xl font-semibold text-gray-900"
          >
            BI Failure Resolution Workflow
          </h2>
          <p
            id="bi-failure-modal-description"
            className="text-sm text-gray-600"
          >
            Complete these steps to resolve the BI failure
          </p>
        </div>
      </div>
      <button
        onClick={handleClose}
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
        className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        aria-label="Close modal"
        aria-describedby="bi-failure-modal-description"
      >
        <Icon path={mdiClose} size={1.2} />
      </button>
    </div>
  );
};
