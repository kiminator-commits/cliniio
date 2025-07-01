import { createContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { TabType } from '../types';
import { useInventoryStore } from '@/store/useInventoryStore';

// Updated context type to include all required properties
interface InventoryDashboardContextType {
  showTrackedOnly: boolean;
  showFavoritesOnly?: boolean;
  handleShowAddModal: () => void;
  handleCloseAddModal: () => void;
  handleToggleTrackedFilter: () => void;
  handleToggleFavoritesFilter?: () => void;
  onCategoryChange: (tab: TabType) => void;
  // Add missing properties that InventoryModalsWrapper expects
  searchTerm: string;
  expandedSections: Record<string, boolean>;
  favorites: string[];
  filteredTools: Array<{
    id: string;
    name: string;
    barcode: string;
    currentPhase: string;
    category: string;
  }>;
  setSearchTerm: (term: string) => void;
  handleSave: () => void;
  handleToggleSection: (section: string) => void;
  handleFormChangeWrapper: (field: string, value: string) => void;
  handleToggleFavorite: (itemId: string) => void;
  handleDeleteItem: (itemId: string) => void;
  getStatusBadge: (status: string) => React.ReactNode;
  getStatusText: (status: string) => string;
}

const InventoryDashboardContext = createContext<InventoryDashboardContextType | undefined>(
  undefined
);

interface InventoryDashboardProviderProps {
  children: ReactNode;
}

export const InventoryDashboardProvider: React.FC<InventoryDashboardProviderProps> = ({
  children,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showTrackedOnly, setShowTrackedOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    purchase: false,
    maintenance: false,
    usage: false,
  });
  const [favorites, setFavorites] = useState<string[]>([]);
  const [filteredTools] = useState<
    Array<{
      id: string;
      name: string;
      barcode: string;
      currentPhase: string;
      category: string;
    }>
  >([]);

  // Get form data and modal state from store
  const { formData, isEditMode, toggleAddModal, setActiveTab } = useInventoryStore();

  const handleShowAddModal = useCallback(() => {
    // Reset form data and set edit mode to false when opening add modal
    if (formData && Object.keys(formData).length > 0) {
      // Reset form data if it exists
      console.log('Resetting form data for new item');
    }
    toggleAddModal();
  }, [toggleAddModal, formData]);

  const handleCloseAddModal = useCallback(() => {
    toggleAddModal();
  }, [toggleAddModal]);

  const handleToggleTrackedFilter = useCallback(() => {
    setShowTrackedOnly(prev => !prev);
  }, []);

  const handleToggleFavoritesFilter = useCallback(() => {
    setShowFavoritesOnly(prev => !prev);
  }, []);

  const onCategoryChange = useCallback(
    (tab: TabType) => {
      setActiveTab(tab);
    },
    [setActiveTab]
  );

  const handleSave = useCallback(async () => {
    try {
      if (isEditMode && formData) {
        // For now, just close the modal since update functionality is handled elsewhere
        console.log('Saving item:', formData);
      }
      // Close the modal after saving
      toggleAddModal();
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  }, [isEditMode, formData, toggleAddModal]);

  const handleToggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const handleFormChangeWrapper = useCallback((field: string, value: string) => {
    // Implementation would depend on your form management
    console.log('Form field changed:', field, value);
  }, []);

  const handleToggleFavorite = useCallback((itemId: string) => {
    setFavorites(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    );
  }, []);

  const handleDeleteItem = useCallback((itemId: string) => {
    // Implementation would depend on your delete logic
    console.log('Delete item:', itemId);
  }, []);

  const getStatusBadge = useCallback((status: string) => {
    return <span className="badge">{status}</span>;
  }, []);

  const getStatusText = useCallback((status: string) => {
    return status;
  }, []);

  const contextValue: InventoryDashboardContextType = useMemo(
    () => ({
      showTrackedOnly,
      showFavoritesOnly,
      handleShowAddModal,
      handleCloseAddModal,
      handleToggleTrackedFilter,
      handleToggleFavoritesFilter,
      onCategoryChange,
      searchTerm,
      expandedSections,
      favorites,
      filteredTools,
      setSearchTerm,
      handleSave,
      handleToggleSection,
      handleFormChangeWrapper,
      handleToggleFavorite,
      handleDeleteItem,
      getStatusBadge,
      getStatusText,
    }),
    [
      showTrackedOnly,
      showFavoritesOnly,
      handleShowAddModal,
      handleCloseAddModal,
      handleToggleTrackedFilter,
      handleToggleFavoritesFilter,
      onCategoryChange,
      searchTerm,
      expandedSections,
      favorites,
      filteredTools,
      setSearchTerm,
      handleSave,
      handleToggleSection,
      handleFormChangeWrapper,
      handleToggleFavorite,
      handleDeleteItem,
      getStatusBadge,
      getStatusText,
    ]
  );

  return (
    <InventoryDashboardContext.Provider value={contextValue}>
      {children}
    </InventoryDashboardContext.Provider>
  );
};

// Export the context for internal use only
export { InventoryDashboardContext };
