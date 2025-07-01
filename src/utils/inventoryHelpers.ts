import React from 'react';
import { FormData, ExpandedSections, Tool, LocalInventoryItem } from '../types/inventoryTypes';

export const getItemId = (item: LocalInventoryItem): string => {
  if ('toolId' in item) return item.toolId!;
  if ('supplyId' in item) return item.supplyId!;
  if ('equipmentId' in item) return item.equipmentId!;
  if ('hardwareId' in item) return item.hardwareId!;
  return '';
};

export const toggleFavorite = (prev: Set<string>, toolId: string): Set<string> => {
  const newFavorites = new Set(prev);
  if (newFavorites.has(toolId)) {
    newFavorites.delete(toolId);
  } else {
    newFavorites.add(toolId);
  }
  return newFavorites;
};

export const handleFormChange = <T extends object>(prev: T, field: keyof T, value: string): T => {
  return {
    ...prev,
    [field]: value,
  };
};

export const createFormChangeHandler = <T extends object>(
  setFormData: React.Dispatch<React.SetStateAction<T>>
) => {
  return (field: keyof T, value: string) => {
    setFormData((prev: T) => handleFormChange(prev, field, value));
  };
};

export const toggleSection = <T extends object>(prev: T, section: keyof T): T => {
  return {
    ...prev,
    [section]: !prev[section],
  };
};

export const handleCategoryChange = <T>(setter: (tab: T) => void, tab: T): void => {
  setter(tab);
};

export const handleDownloadTemplate = (): void => {
  // Create CSV template content
  const csvContent = `Item Name,Category,Location,Cost,Status,Notes
Example Item,Tools,Operating Room 1,150.00,Active,Example note
Example Supply,Supplies,Supply Room A,25.50,In Stock,Example supply note
Example Equipment,Equipment,ICU Room 101,2500.00,Operational,Example equipment note
Example Hardware,Office Hardware,Admin Office,800.00,Online,Example hardware note`;

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'inventory_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const getDefaultFormState = (): FormData => ({
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

export function getDefaultFormData() {
  return {
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
    status: 'Available',
    quantity: '1',
    notes: '',
  };
}

export const getDefaultExpandedSections = (): ExpandedSections => ({
  general: true,
  purchase: false,
  maintenance: false,
  usage: false,
});

export const filterTools = (
  tools: Tool[],
  searchTerm: string,
  activeFilter: string,
  favorites: Set<string>
): Tool[] => {
  return tools.filter(tool => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.barcode.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'favorites' && favorites.has(tool.id)) ||
      (activeFilter === 'surgical' && tool.category === 'Surgical') ||
      (activeFilter === 'dental' && tool.category === 'Dental') ||
      (activeFilter === 'emergency' && tool.category === 'Emergency') ||
      (activeFilter === 'recently-used' && tool.currentPhase === 'complete');

    return matchesSearch && matchesFilter;
  });
};

export const getFormDataFromItem = (item: LocalInventoryItem) => ({
  itemName: item.item,
  category: item.category,
  id: getItemId(item),
  location: item.location,
  purchaseDate: '',
  vendor: '',
  cost: item.cost?.toString() || '',
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

export const resetAddModalState = (
  setFormData: React.Dispatch<React.SetStateAction<FormData>>,
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>,
  setExpandedSections: React.Dispatch<React.SetStateAction<ExpandedSections>>
): void => {
  setFormData(getDefaultFormState());
  setIsEditMode(false);
  setExpandedSections(getDefaultExpandedSections());
};

export const filterInventoryBySearch = <T extends Record<string, string | number | boolean>>(
  items: T[],
  fields: (keyof T)[],
  searchQuery: string
): T[] => {
  const query = searchQuery.toLowerCase();
  return items.filter(item =>
    fields.some(field => item[field]?.toString().toLowerCase().includes(query))
  );
};

export const simulateLoading = (setter: (loading: boolean) => void, delay = 500): (() => void) => {
  const timer = setTimeout(() => setter(false), delay);
  return () => clearTimeout(timer);
};
