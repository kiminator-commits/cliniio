import React from 'react';
import Icon from '@mdi/react';
import { mdiCheck } from '@mdi/js';
import { Checklist } from '../../../../store/checklistStore';

interface ActionButtonsProps {
  selectedChecklist: Checklist | null;
  onSaveDraft: () => void;
  onPublish: () => void;
  isValid?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedChecklist,
  onSaveDraft,
  onPublish,
  isValid = true,
}) => {
  return (
    <div className="flex justify-end mt-4 space-x-3">
      <button
        onClick={onSaveDraft}
        disabled={!isValid}
        className={`flex items-center px-6 py-2 rounded-lg font-semibold text-lg ${
          isValid
            ? 'bg-gray-500 text-white hover:bg-gray-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        <Icon path={mdiCheck} size={1} className="mr-2" />
        Save Draft
      </button>
      {selectedChecklist && (
        <button
          onClick={onPublish}
          disabled={!isValid}
          className={`flex items-center px-6 py-2 rounded-lg font-semibold text-lg ${
            isValid
              ? 'bg-[#4ECDC4] text-white hover:bg-[#3db8b0]'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Icon path={mdiCheck} size={1} className="mr-2" />
          Publish
        </button>
      )}
    </div>
  );
};
