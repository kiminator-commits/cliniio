import React from 'react';
import Icon from '@mdi/react';
import { mdiShieldAlert, mdiClose } from '@mdi/js';

interface ModalHeaderProps {
  onCancel: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ onCancel }) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-100 rounded-lg">
          <Icon path={mdiShieldAlert} size={1.5} className="text-red-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-red-800">
            BI Test Failure - Critical Alert
          </h2>
          <p className="text-sm text-red-600">
            Sterilization process failure detected
          </p>
        </div>
      </div>
      <button
        onClick={onCancel}
        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
      >
        <Icon path={mdiClose} size={1} className="text-red-600" />
      </button>
    </div>
  );
};
