import { useState } from 'react';
import { TabType } from '../pages/Inventory/types';
import { LocalInventoryItem } from '../types/inventoryTypes';

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
  const [deletingItem, setDeletingItem] = useState<LocalInventoryItem | null>(null);

  // Track modal search state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [mockTools, setMockTools] = useState([
    { id: '1', name: 'Scalpel', status: 'clean', location: 'OR 1' },
    { id: '2', name: 'Forceps', status: 'dirty', location: 'OR 2' },
    { id: '3', name: 'Retractor', status: 'bath1', location: 'OR 1' },
  ]);

  // Pagination and filter display state
  const [itemsPerPage, setItemsPerPage] = useState(3);
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

  // Inventory data state
  const [inventoryData, setInventoryData] = useState([
    {
      item: 'Scalpel Handle #3',
      category: 'Surgical',
      toolId: 'T-001',
      location: 'OR 1',
      p2Status: 'clean',
      cost: 45.0,
    },
    {
      item: 'Forceps 5"',
      category: 'Surgical',
      toolId: 'T-002',
      location: 'OR 2',
      p2Status: 'dirty',
      cost: 35.0,
    },
    {
      item: 'Retractor Set',
      category: 'Surgical',
      toolId: 'T-003',
      location: 'OR 1',
      p2Status: 'bath1',
      cost: 150.0,
    },
  ]);

  const [suppliesData, setSuppliesData] = useState([
    {
      item: 'Gauze',
      category: 'Supplies',
      supplyId: 'S-002',
      location: 'Supply Room',
      quantity: 200,
      expiration: '2024-12-31',
      cost: 25.5,
    },
    {
      item: 'Syringe',
      category: 'Supplies',
      supplyId: 'S-003',
      location: 'Supply Room',
      quantity: 150,
      expiration: '2025-03-15',
      cost: 15.75,
    },
  ]);

  const [equipmentData, setEquipmentData] = useState([
    {
      item: 'Monitor',
      category: 'Equipment',
      equipmentId: 'E-003',
      location: 'ICU',
      status: 'Operational',
      lastServiced: '2024-01-10',
      cost: 2500.0,
    },
    {
      item: 'Defibrillator',
      category: 'Equipment',
      equipmentId: 'E-004',
      location: 'ER',
      status: 'Maintenance',
      lastServiced: '2023-11-05',
      cost: 3500.0,
    },
  ]);

  const [officeHardwareData, setOfficeHardwareData] = useState([
    {
      item: 'Printer',
      category: 'Office Hardware',
      hardwareId: 'H-001',
      location: 'Admin Office',
      status: 'Online',
      warranty: '2025-06-30',
      cost: 800.0,
    },
    {
      item: 'Desktop Computer',
      category: 'Office Hardware',
      hardwareId: 'H-002',
      location: 'Reception',
      status: 'Offline',
      warranty: '2024-09-15',
      cost: 1200.0,
    },
  ]);

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
    mockTools,
    setMockTools,

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

    // Inventory data state
    inventoryData,
    setInventoryData,
    suppliesData,
    setSuppliesData,
    equipmentData,
    setEquipmentData,
    officeHardwareData,
    setOfficeHardwareData,
  };
};
