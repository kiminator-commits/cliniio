import React from 'react';
import { ExpandedSections, Tool, InventoryItem } from '../types/inventoryTypes';
import { InventoryFormData } from '../types/inventory';

export const getItemId = (item: InventoryItem): string => {
  return (
    ((item.data as Record<string, unknown>)?.toolId as string) ||
    ((item.data as Record<string, unknown>)?.supplyId as string) ||
    ((item.data as Record<string, unknown>)?.equipmentId as string) ||
    ((item.data as Record<string, unknown>)?.hardwareId as string) ||
    item.toolId ||
    item.supplyId ||
    item.equipmentId ||
    item.hardwareId ||
    item.id
  );
};

export const toggleFavorite = (
  prev: Set<string>,
  toolId: string
): Set<string> => {
  const newFavorites = new Set(prev);
  if (newFavorites.has(toolId)) {
    newFavorites.delete(toolId);
  } else {
    newFavorites.add(toolId);
  }
  return newFavorites;
};

export const handleFormChange = <T extends object>(
  prev: T,
  field: keyof T,
  value: string
): T => {
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

export const toggleSection = <T extends object>(
  prev: T,
  section: keyof T
): T => {
  return {
    ...prev,
    [section]: !prev[section],
  };
};

export const handleCategoryChange = <T>(
  setter: (tab: T) => void,
  tab: T
): void => {
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

export const getDefaultFormState = (): InventoryFormData => ({
  itemName: '',
  category: '',
  id: '',
  location: '',
  status: '',
  quantity: 1,
  unitCost: 0,
  minimumQuantity: 0,
  maximumQuantity: 999,
  supplier: '',
  barcode: '',
  sku: '',
  description: '',
  notes: '',
  lastUpdated: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  createdAt: new Date().toISOString(),
});

export function getDefaultFormData(): InventoryFormData {
  return {
    itemName: '',
    category: '',
    id: '',
    location: '',
    status: 'active',
    quantity: 1,
    unitCost: 0,
    minimumQuantity: 0,
    maximumQuantity: 999,
    supplier: '',
    barcode: '',
    sku: '',
    description: '',
    notes: '',
    updated_at: new Date().toISOString(),
    createdAt: new Date().toISOString(),
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
  return tools.filter((tool) => {
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

export const getFormDataFromItem = (
  item: InventoryItem
): InventoryFormData => ({
  itemName: item.name || item.item || '',
  category: item.category || '',
  id: getItemId(item),
  location: item.location || '',
  status: item.status || '',
  quantity: item.quantity || 1,
  unitCost: item.unit_cost || 0,
  minimumQuantity: item.reorder_point || 0,
  maximumQuantity:
    ((item.data as Record<string, unknown>)?.maximumQuantity as number) || 0,
  supplier: item.supplier || '',
  updated_at: item.updated_at || new Date().toISOString(),
  createdAt: item.created_at || new Date().toISOString(),
});

export const resetAddModalState = (
  setFormData: React.Dispatch<React.SetStateAction<InventoryFormData>>,
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>,
  setExpandedSections: React.Dispatch<React.SetStateAction<ExpandedSections>>
): void => {
  setFormData(getDefaultFormState());
  setIsEditMode(false);
  setExpandedSections(getDefaultExpandedSections());
};

export const filterInventoryBySearch = <
  T extends Record<string, string | number | boolean>,
>(
  items: T[],
  fields: (keyof T)[],
  searchQuery: string
): T[] => {
  const query = searchQuery.toLowerCase();
  return items.filter((item) =>
    fields.some((field) =>
      item[field]?.toString().toLowerCase().includes(query)
    )
  );
};

export const simulateLoading = (
  setter: (loading: boolean) => void,
  delay = 500
): (() => void) => {
  const timer = setTimeout(() => setter(false), delay);
  return () => clearTimeout(timer);
};
