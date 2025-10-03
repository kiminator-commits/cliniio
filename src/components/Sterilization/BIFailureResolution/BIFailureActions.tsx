import React from 'react';

/**
 * Props for the BIFailureActions component.
 * @interface BIFailureActionsProps
 * @property {boolean} isLoading - Whether the form is currently being submitted
 * @property {boolean} isResolveButtonDisabled - Whether the resolve button should be disabled
 * @property {string} resolveButtonText - Text to display on the resolve button
 * @property {string} resolutionNotes - Current resolution notes value
 * @property {() => void} onResolve - Callback function for resolve action
 * @property {() => void} onCancel - Callback function for cancel action
 * @property {(notes: string) => void} onUpdateNotes - Callback function for updating resolution notes
 */
interface BIFailureActionsProps {
  isLoading: boolean;
  isResolveButtonDisabled: boolean;
  resolveButtonText: string;
  resolutionNotes: string;
  onResolve: () => void;
  onCancel: () => void;
  onUpdateNotes: (notes: string) => void;
}

/**
 * Actions component for BI Failure Resolution modal.
 * Displays resolution notes input and action buttons (Resolve/Cancel).
 * Handles form submission, validation, and user interaction.
 * Provides clear visual feedback for form state and actions.
 *
 * @param {BIFailureActionsProps} props - Component props containing form state and action handlers
 * @returns {JSX.Element} Actions component with form inputs and buttons
 */
export const BIFailureActions: React.FC<BIFailureActionsProps> = ({
  isLoading,
  isResolveButtonDisabled,
  resolveButtonText,
  resolutionNotes,
  onResolve,
  onCancel,
  onUpdateNotes,
}) => {
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateNotes(e.target.value);
  };

  const handleResolve = () => {
    if (!isResolveButtonDisabled) {
      onResolve();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key === 'Enter' &&
      (e.ctrlKey || e.metaKey) &&
      !isResolveButtonDisabled
    ) {
      e.preventDefault();
      handleResolve();
    }
    if (e.key === 'Escape' && !isLoading) {
      handleCancel();
    }
  };

  return (
    <div className="space-y-4">
      {/* Resolution Notes */}
      <div>
        <label
          htmlFor="resolution-notes"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Resolution Notes
        </label>
        <textarea
          id="resolution-notes"
          value={resolutionNotes}
          onChange={handleNotesChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={4}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            isLoading ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
          placeholder="Document the steps taken to resolve this BI failure incident..."
          aria-describedby="resolution-notes-help"
        />
        <p id="resolution-notes-help" className="mt-1 text-sm text-gray-500">
          Include details about re-sterilization parameters, new BI test
          results, and any corrective actions taken.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className={`px-4 py-2 text-sm font-medium rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isLoading
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
          aria-label="Cancel resolution"
        >
          Cancel
        </button>

        <button
          onClick={handleResolve}
          disabled={isResolveButtonDisabled}
          className={`px-4 py-2 text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isResolveButtonDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
          aria-label="Resolve BI failure incident"
        >
          {resolveButtonText}
        </button>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-gray-500 text-center">
        <p>
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">
            Ctrl+Enter
          </kbd>{' '}
          to resolve •{' '}
          <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> to
          cancel
        </p>
      </div>
    </div>
  );
};
