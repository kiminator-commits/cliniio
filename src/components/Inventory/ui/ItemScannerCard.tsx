import React from 'react';
import Icon from '@mdi/react';
import { mdiBarcode, mdiFileUploadOutline, mdiReceiptText } from '@mdi/js';

const ItemScannerCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow-lg p-3 border-l-4 border-[#4ECDC4]">
    <div className="flex flex-col">
      <h2 className="text-base font-semibold flex items-center text-[#5b5b5b] mb-2">
        <span className="p-1.5 bg-[#4ECDC4] bg-opacity-10 rounded-full">
          <Icon path={mdiBarcode} size={1.2} color="#4ECDC4" />
        </span>
        <span className="ml-2">Item Scanner</span>
      </h2>
      <div className="flex gap-2">
        <button
          className="bg-[#4ECDC4] hover:bg-[#3dbdb5] text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center"
          tabIndex={0}
        >
          <Icon path={mdiReceiptText} size={1.2} className="mr-1.5" />
          <span>Scan Invoice</span>
        </button>
        <button
          className="bg-[#4ECDC4] hover:bg-[#3dbdb5] text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center"
          tabIndex={0}
        >
          <Icon path={mdiFileUploadOutline} size={1.2} className="mr-1.5" />
          <span>Import</span>
        </button>
        <button
          className="bg-[#4ECDC4] hover:bg-[#3dbdb5] text-white text-sm font-medium py-1.5 px-3 rounded-lg flex items-center"
          tabIndex={0}
        >
          <Icon path={mdiBarcode} size={1.2} className="mr-1.5" />
          <span>Scan Item</span>
        </button>
      </div>
    </div>
  </div>
);

export default ItemScannerCard;
