import React from 'react';
import Icon from '@mdi/react';
import {
  mdiWrench,
  mdiPackageVariant,
  mdiDesktopClassic,
  mdiPrinter3d,
  mdiFileUploadOutline,
} from '@mdi/js';
import { Button } from 'react-bootstrap';
import { useInventoryHeaderData } from '@/hooks/inventory/useInventoryHeaderData';

interface Props {
  activeTab: string;
  handleShowAddModal: () => void;
}

const InventoryHeaderSection: React.FC<Props> = ({ activeTab, handleShowAddModal }) => {
  const { handleUploadBarcode } = useInventoryHeaderData(handleShowAddModal);

  return (
    <>
      {activeTab === 'tools' && (
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-[#5b5b5b] tracking-tight flex items-center">
            <Icon path={mdiWrench} size={1.1} color="#4ECDC4" className="mr-2" />
            Tool Management
          </h2>
          <div className="flex gap-2">
            <Button
              variant="success"
              className="bg-[#4ECDC4] hover:bg-[#3db8b0] border-[#4ECDC4] hover:border-[#3db8b0] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              onClick={handleShowAddModal}
            >
              Add Item
            </Button>
            <button
              className="p-2 text-[#17a2b8] hover:bg-[#17a2b8] hover:text-white rounded-md transition-colors duration-200 border border-[#17a2b8] hover:border-[#17a2b8]"
              title="Upload Barcodes"
              onClick={handleUploadBarcode}
            >
              <Icon path={mdiFileUploadOutline} size={1.2} />
            </button>
          </div>
        </div>
      )}
      {activeTab === 'supplies' && (
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-700 tracking-tight flex items-center">
            <Icon path={mdiPackageVariant} size={1.1} color="#4ECDC4" className="mr-2" />
            Supplies Management
          </h2>
          <div className="flex gap-2">
            <Button
              variant="success"
              className="bg-[#4ECDC4] hover:bg-[#3db8b0] border-[#4ECDC4] hover:border-[#3db8b0] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              onClick={handleShowAddModal}
            >
              Add Item
            </Button>
            <button
              className="p-2 text-[#17a2b8] hover:bg-[#17a2b8] hover:text-white rounded-md transition-colors duration-200 border border-[#17a2b8] hover:border-[#17a2b8]"
              title="Upload Barcodes"
              onClick={handleUploadBarcode}
            >
              <Icon path={mdiFileUploadOutline} size={1.2} />
            </button>
          </div>
        </div>
      )}
      {activeTab === 'equipment' && (
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-700 tracking-tight flex items-center">
            <Icon path={mdiPrinter3d} size={1.1} color="#4ECDC4" className="mr-2" />
            Equipment Management
          </h2>
          <div className="flex gap-2">
            <Button
              variant="success"
              className="bg-[#4ECDC4] hover:bg-[#3db8b0] border-[#4ECDC4] hover:border-[#3db8b0] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              onClick={handleShowAddModal}
            >
              Add Item
            </Button>
            <button
              className="p-2 text-[#17a2b8] hover:bg-[#17a2b8] hover:text-white rounded-md transition-colors duration-200 border border-[#17a2b8] hover:border-[#17a2b8]"
              title="Upload Barcodes"
              onClick={handleUploadBarcode}
            >
              <Icon path={mdiFileUploadOutline} size={1.2} />
            </button>
          </div>
        </div>
      )}
      {activeTab === 'officeHardware' && (
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-700 tracking-tight flex items-center">
            <Icon path={mdiDesktopClassic} size={1.1} color="#4ECDC4" className="mr-2" />
            Office Hardware Management
          </h2>
          <div className="flex gap-2">
            <Button
              variant="success"
              className="bg-[#4ECDC4] hover:bg-[#3db8b0] border-[#4ECDC4] hover:border-[#3db8b0] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
              onClick={handleShowAddModal}
            >
              Add Item
            </Button>
            <button
              className="p-2 text-[#17a2b8] hover:bg-[#17a2b8] hover:text-white rounded-md transition-colors duration-200 border border-[#17a2b8] hover:border-[#17a2b8]"
              title="Upload Barcodes"
              onClick={handleUploadBarcode}
            >
              <Icon path={mdiFileUploadOutline} size={1.2} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryHeaderSection;
