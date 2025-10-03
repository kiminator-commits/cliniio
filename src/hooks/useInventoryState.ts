import { useState } from 'react';
import { TabType } from '@/types/inventory';
import { LocalInventoryItem } from '../types/inventoryTypes';
import { ITEMS_PER_PAGE } from '@/constants/homeUiConstants';

export const useInventoryState = () => {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showTrackedOnly, setShowTrackedOnly] = useState(false);

  // Tab and modal state
  const [activeTab, setActiveTab] = useState<TabType>('tools');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<LocalInventoryItem | null>(
    null
  );

  // Track modal search state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Pagination and filter display state
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Add modal section states
  const [expandedSections, setExpandedSections] = useState({
    general: true, // Start with general info expanded
    purchase: false,
    maintenance: false,
    usage: false,
  });

  // Form state for add/edit modal
  const [formData, setFormData] = useState({
    itemName: '',
    category: '',
    id: '',
    location: '',
    purchaseDate: '',
    vendor: '',
    cost: '',
    warranty: '',
    maintenanceSchedule: '',
    lastServiced: '',
    nextDue: '',
    serviceProvider: '',
    assignedTo: '',
    status: '',
    quantity: '',
    notes: '',
  });

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);

  return {
    // Search and filter state
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    locationFilter,
    setLocationFilter,
    showTrackedOnly,
    setShowTrackedOnly,

    // Tab and modal state
    activeTab,
    setActiveTab,
    showAddModal,
    setShowAddModal,
    showTrackModal,
    setShowTrackModal,
    showScanModal,
    setShowScanModal,
    showUploadModal,
    setShowUploadModal,
    deletingItem,
    setDeletingItem,

    // Track modal search state
    searchTerm,
    setSearchTerm,
    activeFilter,
    setActiveFilter,
    favorites,
    setFavorites,

    // Pagination and filter display state
    itemsPerPage,
    setItemsPerPage,
    currentPage,
    setCurrentPage,
    showFilters,
    setShowFilters,

    // Add modal section states
    expandedSections,
    setExpandedSections,

    // Form state for add/edit modal
    formData,
    setFormData,

    // Edit mode state
    isEditMode,
    setIsEditMode,
  };
};
