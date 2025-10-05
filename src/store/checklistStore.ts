import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ChecklistDataProvider,
  ChecklistItem,
  Checklist,
} from './providers/ChecklistDataProvider';
import { ChecklistItemProvider } from './providers/ChecklistItemProvider';
import { ChecklistScheduleProvider } from './providers/ChecklistScheduleProvider';
import { ChecklistInventoryProvider } from './providers/ChecklistInventoryProvider';

// Re-export interfaces for backward compatibility
export type { ChecklistItem, Checklist };

interface ChecklistStore {
  checklists: Checklist[];
  addChecklist: (
    checklist: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>
  ) => void;
  updateChecklist: (id: string, updates: Partial<Checklist>) => void;
  deleteChecklist: (id: string) => void;
  addItemToChecklist: (
    checklistId: string,
    item: Omit<ChecklistItem, 'id'>
  ) => void;
  updateChecklistItem: (
    checklistId: string,
    itemId: string,
    updates: Partial<ChecklistItem>
  ) => void;
  deleteChecklistItem: (checklistId: string, itemId: string) => void;
  getChecklistsByCategory: (category: string) => Checklist[];
  publishChecklist: (id: string) => void;
  getPublishedChecklistsByCategory: (category: string) => Checklist[];
}

// Provider instances
const dataProvider = new ChecklistDataProvider();
const itemProvider = new ChecklistItemProvider();
const _scheduleProvider = new ChecklistScheduleProvider();
const _inventoryProvider = new ChecklistInventoryProvider();

export const useChecklistStore = create<ChecklistStore>()(
  persist(
    (set, _get) => ({
      checklists: dataProvider.getDefaultChecklists(),
      addChecklist: (checklistData) => {
        const newChecklist = dataProvider.addChecklist(checklistData);
        set((state) => ({
          checklists: [...state.checklists, newChecklist],
        }));
      },
      updateChecklist: (id, updates) => {
        set((state) => {
          const updatedChecklist = dataProvider.updateChecklist(id, updates);
          if (!updatedChecklist) return state;

          return {
            checklists: state.checklists.map((checklist) =>
              checklist.id === id ? updatedChecklist : checklist
            ),
          };
        });
      },
      deleteChecklist: (id) => {
        set((state) => {
          const success = dataProvider.deleteChecklist(id);
          if (!success) return state;

          return {
            checklists: state.checklists.filter(
              (checklist) => checklist.id !== id
            ),
          };
        });
      },
      addItemToChecklist: (checklistId, itemData) => {
        set((state) => ({
          checklists: itemProvider.addItemToChecklist(
            state.checklists,
            checklistId,
            itemData
          ),
        }));
      },
      updateChecklistItem: (checklistId, itemId, updates) => {
        set((state) => ({
          checklists: itemProvider.updateChecklistItem(
            state.checklists,
            checklistId,
            itemId,
            updates
          ),
        }));
      },
      deleteChecklistItem: (checklistId, itemId) => {
        set((state) => ({
          checklists: itemProvider.deleteChecklistItem(
            state.checklists,
            checklistId,
            itemId
          ),
        }));
      },
      getChecklistsByCategory: (category) => {
        return dataProvider.getChecklistsByCategory(category);
      },
      publishChecklist: (id) => {
        set((state) => {
          const updatedChecklist = dataProvider.publishChecklist(id);
          if (!updatedChecklist) return state;

          return {
            checklists: state.checklists.map((checklist) =>
              checklist.id === id ? updatedChecklist : checklist
            ),
          };
        });
      },
      getPublishedChecklistsByCategory: (category) => {
        return dataProvider.getPublishedChecklistsByCategory(category);
      },
    }),
    {
      name: 'checklist-storage',
    }
  )
);
