import { useState } from 'react';
import {
  Category,
  Checklist,
  SDSSheet,
  StolenItem,
  PrnItem,
  ActiveTab,
} from '../types/cleaningChecklists';

interface UseChecklistStateReturn {
  // State
  selectedCategory: Category | null;
  selectedChecklist: Checklist | null;
  activeTab: ActiveTab;
  searchQuery: string;
  selectedSDS: SDSSheet | null;
  sdsCategory: string;
  bypassedItems: Set<string>;
  adjustedQuantities: Record<string, number>;
  showModal: boolean;
  notes: string;
  stolenItems: StolenItem[];
  prnItems: PrnItem[];

  // Setters
  setSelectedCategory: (category: Category | null) => void;
  setSelectedChecklist: (checklist: Checklist | null) => void;
  setActiveTab: (tab: ActiveTab) => void;
  setSearchQuery: (query: string) => void;
  setSelectedSDS: (sds: SDSSheet | null) => void;
  setSdsCategory: (category: string) => void;
  setShowModal: (show: boolean) => void;
  setNotes: (notes: string | ((prev: string) => string)) => void;

  // Handlers
  handleCategoryClick: (category: Category) => void;
  handleChecklistSelect: (checklist: Checklist) => void;
  handleCloseModal: () => void;
  handleMarkComplete: () => void;
  handleBypassItem: (itemId: string) => void;
  handleAdjustQuantity: (
    itemId: string,
    inventoryItemId: string,
    adjustment: number
  ) => void;
  handleAddStolenItem: () => void;
  handleAddPrnItem: () => void;
  handleUpdateStolenItem: (
    index: number,
    field: string,
    value: string | number
  ) => void;
  handleUpdatePrnItem: (
    index: number,
    field: string,
    value: string | number
  ) => void;
  clearStolenItems: () => void;
  clearPrnItems: () => void;
  clearNotes: () => void;
}

export const useChecklistState = (): UseChecklistStateReturn => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [selectedChecklist, setSelectedChecklist] = useState<Checklist | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<ActiveTab>('checklists');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSDS, setSelectedSDS] = useState<SDSSheet | null>(null);
  const [sdsCategory, setSdsCategory] = useState<string>('all');
  const [bypassedItems, setBypassedItems] = useState<Set<string>>(new Set());
  const [adjustedQuantities, setAdjustedQuantities] = useState<
    Record<string, number>
  >({});
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState<string>('');
  const [stolenItems, setStolenItems] = useState<StolenItem[]>([]);
  const [prnItems, setPrnItems] = useState<PrnItem[]>([]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(category);
    setSelectedChecklist(null);
    setShowModal(true);
  };

  const handleChecklistSelect = (checklist: Checklist) => {
    setSelectedChecklist(checklist);
  };

  const handleCloseModal = () => {
    setSelectedCategory(null);
    setSelectedChecklist(null);
    setShowModal(false);
  };

  const handleMarkComplete = () => {
    // In a real app, this would save to a database
    handleCloseModal();
  };

  const handleBypassItem = (itemId: string) => {
    setBypassedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleAdjustQuantity = (
    itemId: string,
    inventoryItemId: string,
    adjustment: number
  ) => {
    setAdjustedQuantities((prev) => ({
      ...prev,
      [`${itemId}-${inventoryItemId}`]:
        (prev[`${itemId}-${inventoryItemId}`] || 0) + adjustment,
    }));
  };

  const handleAddStolenItem = () => {
    setStolenItems([...stolenItems, { item: '', quantity: 1, notes: '' }]);
  };

  const handleAddPrnItem = () => {
    setPrnItems([...prnItems, { item: '', quantity: 1, reason: '' }]);
  };

  const handleUpdateStolenItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...stolenItems];
    updated[index] = { ...updated[index], [field]: value };
    setStolenItems(updated);
  };

  const handleUpdatePrnItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...prnItems];
    updated[index] = { ...updated[index], [field]: value };
    setPrnItems(updated);
  };

  const clearStolenItems = () => {
    setStolenItems([]);
  };

  const clearPrnItems = () => {
    setPrnItems([]);
  };

  const clearNotes = () => {
    setNotes('');
  };

  return {
    // State
    selectedCategory,
    selectedChecklist,
    activeTab,
    searchQuery,
    selectedSDS,
    sdsCategory,
    bypassedItems,
    adjustedQuantities,
    showModal,
    notes,
    stolenItems,
    prnItems,

    // Setters
    setSelectedCategory,
    setSelectedChecklist,
    setActiveTab,
    setSearchQuery,
    setSelectedSDS,
    setSdsCategory,
    setShowModal,
    setNotes,

    // Handlers
    handleCategoryClick,
    handleChecklistSelect,
    handleCloseModal,
    handleMarkComplete,
    handleBypassItem,
    handleAdjustQuantity,
    handleAddStolenItem,
    handleAddPrnItem,
    handleUpdateStolenItem,
    handleUpdatePrnItem,
    clearStolenItems,
    clearPrnItems,
    clearNotes,
  };
};
