import React from 'react';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import { ModalHeaderProps } from '../types/InventorySearchModalTypes';

const ModalHeader: React.FC<ModalHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Search Inventory Items
        </h2>
        <p className="text-gray-600 mt-1">
          Select items for your checklist with advanced filtering
        </p>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Icon path={mdiClose} size={1.5} />
      </button>
    </div>
  );
};

export default ModalHeader;
