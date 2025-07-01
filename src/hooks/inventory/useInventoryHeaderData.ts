import { useInventoryStore } from '@/store/useInventoryStore';

export const useInventoryHeaderData = (handleShowAddModal: () => void) => {
  const { activeTab, toggleUploadBarcodeModal } = useInventoryStore();

  return {
    activeTab,
    handleShowAddModal,
    handleUploadBarcode: toggleUploadBarcodeModal,
  };
};
