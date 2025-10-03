export interface Category {
  id: string;
  title: string;
  iconColor: string;
  icon: string;
}

export interface CleaningInventoryItem {
  id: string;
  name: string;
  currentStock: number;
  requiredQuantity: number;
  category: string;
  status?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  inventoryItems?: CleaningInventoryItem[];
  sds?: SDSSheet;
  instructions: string;
  completed?: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
}

export interface SDSSheet {
  id: string;
  name: string;
  category: string;
  lastUpdated: string;
  url: string;
  sections: string[];
}

export interface StolenItem {
  item: string;
  quantity: number;
  notes: string;
}

export interface PrnItem {
  item: string;
  quantity: number;
  reason: string;
}

export type ActiveTab = 'checklists' | 'sds';
