import React from 'react';
import Icon from '@/components/Icon/Icon';
import { mdiBarcode, mdiClose } from '@mdi/js';

interface ScanModalHeaderProps {
  scanMode: 'add' | 'use' | null;
  onClose: () => void;
}

const ScanModalHeader: React.FC<ScanModalHeaderProps> = ({
  scanMode,
  onClose,
}) => {
  return (
    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
      <div className="flex items-center gap-3">
        <h3 className="text-xl font-semibold text-[#5b5b5b] flex items-center">
          <Icon path={mdiBarcode} size={1.2} className="text-[#4ECDC4] mr-3" />
          {scanMode ? 'Inventory Scanner' : 'Scan Inventory'}
        </h3>
      </div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <Icon path={mdiClose} size={1.2} />
      </button>
    </div>
  );
};

export default ScanModalHeader;
