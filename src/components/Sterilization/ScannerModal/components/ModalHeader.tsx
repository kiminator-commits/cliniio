import React from 'react';
import Icon from '@mdi/react';
import { mdiBarcode, mdiClose } from '@mdi/js';

interface ModalHeaderProps {
  onClose: () => void;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose }) => {
  return (
    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <Icon path={mdiBarcode} size={1.5} className="text-blue-600" />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Tool Scanner</h2>
          <p className="text-gray-600 text-sm">
            Scan tools for sterilization workflows
          </p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Icon path={mdiClose} size={1.2} className="text-gray-600" />
      </button>
    </div>
  );
};
