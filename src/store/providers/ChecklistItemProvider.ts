import { ChecklistItem, Checklist } from './ChecklistDataProvider';

export class ChecklistItemProvider {
  /**
   * Add item to checklist
   */
  addItemToChecklist(
    checklists: Checklist[],
    checklistId: string,
    itemData: Omit<ChecklistItem, 'id'>
  ): Checklist[] {
    const newItem: ChecklistItem = {
      ...itemData,
      id: this.generateId(),
    };

    return checklists.map((checklist) =>
      checklist.id === checklistId
        ? {
            ...checklist,
            items: [...checklist.items, newItem],
            updatedAt: new Date().toISOString(),
          }
        : checklist
    );
  }

  /**
   * Update checklist item
   */
  updateChecklistItem(
    checklists: Checklist[],
    checklistId: string,
    itemId: string,
    updates: Partial<ChecklistItem>
  ): Checklist[] {
    return checklists.map((checklist) =>
      checklist.id === checklistId
        ? {
            ...checklist,
            items: checklist.items.map((item) =>
              item.id === itemId ? { ...item, ...updates } : item
            ),
            updatedAt: new Date().toISOString(),
          }
        : checklist
    );
  }

  /**
   * Delete checklist item
   */
  deleteChecklistItem(
    checklists: Checklist[],
    checklistId: string,
    itemId: string
  ): Checklist[] {
    return checklists.map((checklist) =>
      checklist.id === checklistId
        ? {
            ...checklist,
            items: checklist.items.filter((item) => item.id !== itemId),
            updatedAt: new Date().toISOString(),
          }
        : checklist
    );
  }

  /**
   * Get item by ID
   */
  getItemById(checklists: Checklist[], checklistId: string, itemId: string): ChecklistItem | null {
    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) return null;

    return checklist.items.find((item) => item.id === itemId) || null;
  }

  /**
   * Complete item
   */
  completeItem(
    checklists: Checklist[],
    checklistId: string,
    itemId: string
  ): Checklist[] {
    return this.updateChecklistItem(checklists, checklistId, itemId, {
      completed: true,
      skipped: false,
    });
  }

  /**
   * Skip item
   */
  skipItem(
    checklists: Checklist[],
    checklistId: string,
    itemId: string
  ): Checklist[] {
    return this.updateChecklistItem(checklists, checklistId, itemId, {
      skipped: true,
      completed: false,
    });
  }

  /**
   * Reset item
   */
  resetItem(
    checklists: Checklist[],
    checklistId: string,
    itemId: string
  ): Checklist[] {
    return this.updateChecklistItem(checklists, checklistId, itemId, {
      completed: false,
      skipped: false,
    });
  }

  /**
   * Move item up in list
   */
  moveItemUp(
    checklists: Checklist[],
    checklistId: string,
    itemId: string
  ): Checklist[] {
    return checklists.map((checklist) => {
      if (checklist.id !== checklistId) return checklist;

      const items = [...checklist.items];
      const currentIndex = items.findIndex((item) => item.id === itemId);
      
      if (currentIndex <= 0) return checklist;

      // Swap with previous item
      [items[currentIndex], items[currentIndex - 1]] = [
        items[currentIndex - 1],
        items[currentIndex],
      ];

      return {
        ...checklist,
        items,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  /**
   * Move item down in list
   */
  moveItemDown(
    checklists: Checklist[],
    checklistId: string,
    itemId: string
  ): Checklist[] {
    return checklists.map((checklist) => {
      if (checklist.id !== checklistId) return checklist;

      const items = [...checklist.items];
      const currentIndex = items.findIndex((item) => item.id === itemId);
      
      if (currentIndex === -1 || currentIndex >= items.length - 1) return checklist;

      // Swap with next item
      [items[currentIndex], items[currentIndex + 1]] = [
        items[currentIndex + 1],
        items[currentIndex],
      ];

      return {
        ...checklist,
        items,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  /**
   * Move item to specific position
   */
  moveItemToPosition(
    checklists: Checklist[],
    checklistId: string,
    itemId: string,
    newPosition: number
  ): Checklist[] {
    return checklists.map((checklist) => {
      if (checklist.id !== checklistId) return checklist;

      const items = [...checklist.items];
      const currentIndex = items.findIndex((item) => item.id === itemId);
      
      if (currentIndex === -1) return checklist;

      // Remove item from current position
      const [movedItem] = items.splice(currentIndex, 1);
      
      // Insert at new position
      items.splice(newPosition, 0, movedItem);

      return {
        ...checklist,
        items,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  /**
   * Duplicate item
   */
  duplicateItem(
    checklists: Checklist[],
    checklistId: string,
    itemId: string
  ): Checklist[] {
    const originalItem = this.getItemById(checklists, checklistId, itemId);
    if (!originalItem) return checklists;

    const duplicatedItem: ChecklistItem = {
      ...originalItem,
      id: this.generateId(),
      title: `${originalItem.title} (Copy)`,
      completed: false,
      skipped: false,
    };

    return checklists.map((checklist) =>
      checklist.id === checklistId
        ? {
            ...checklist,
            items: [...checklist.items, duplicatedItem],
            updatedAt: new Date().toISOString(),
          }
        : checklist
    );
  }

  /**
   * Get item statistics
   */
  getItemStatistics(checklists: Checklist[]): {
    totalItems: number;
    completedItems: number;
    skippedItems: number;
    pendingItems: number;
    completionRate: number;
    itemsWithInventory: number;
    itemsWithSDS: number;
  } {
    let totalItems = 0;
    let completedItems = 0;
    let skippedItems = 0;
    let itemsWithInventory = 0;
    let itemsWithSDS = 0;

    checklists.forEach((checklist) => {
      checklist.items.forEach((item) => {
        totalItems++;
        if (item.completed) completedItems++;
        if (item.skipped) skippedItems++;
        if (item.requiredInventory && item.requiredInventory.length > 0) itemsWithInventory++;
        if (item.sdsId) itemsWithSDS++;
      });
    });

    const pendingItems = totalItems - completedItems - skippedItems;
    const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return {
      totalItems,
      completedItems,
      skippedItems,
      pendingItems,
      completionRate,
      itemsWithInventory,
      itemsWithSDS,
    };
  }

  /**
   * Get checklist completion status
   */
  getChecklistCompletionStatus(checklist: Checklist): {
    totalItems: number;
    completedItems: number;
    skippedItems: number;
    pendingItems: number;
    completionRate: number;
    isFullyCompleted: boolean;
  } {
    const totalItems = checklist.items.length;
    const completedItems = checklist.items.filter((item) => item.completed).length;
    const skippedItems = checklist.items.filter((item) => item.skipped).length;
    const pendingItems = totalItems - completedItems - skippedItems;
    const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;
    const isFullyCompleted = completedItems === totalItems;

    return {
      totalItems,
      completedItems,
      skippedItems,
      pendingItems,
      completionRate,
      isFullyCompleted,
    };
  }

  /**
   * Validate item
   */
  validateItem(item: Partial<ChecklistItem>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!item.title || item.title.trim() === '') {
      errors.push('Title is required');
    }

    if (!item.instructions || item.instructions.trim() === '') {
      errors.push('Instructions are required');
    }

    if (item.requiredInventory && Array.isArray(item.requiredInventory)) {
      item.requiredInventory.forEach((inventory, index) => {
        if (!inventory.id || inventory.id.trim() === '') {
          errors.push(`Inventory item ${index + 1}: ID is required`);
        }
        if (!inventory.name || inventory.name.trim() === '') {
          errors.push(`Inventory item ${index + 1}: Name is required`);
        }
        if (inventory.required <= 0) {
          errors.push(`Inventory item ${index + 1}: Required quantity must be greater than 0`);
        }
        if (inventory.available < 0) {
          errors.push(`Inventory item ${index + 1}: Available quantity cannot be negative`);
        }
        if (inventory.used < 0) {
          errors.push(`Inventory item ${index + 1}: Used quantity cannot be negative`);
        }
        if (inventory.used > inventory.available) {
          errors.push(`Inventory item ${index + 1}: Used quantity cannot exceed available quantity`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Search items
   */
  searchItems(checklists: Checklist[], query: string): Array<{
    checklist: Checklist;
    item: ChecklistItem;
    matchType: 'title' | 'instructions' | 'inventory';
  }> {
    const lowercaseQuery = query.toLowerCase();
    const results: Array<{
      checklist: Checklist;
      item: ChecklistItem;
      matchType: 'title' | 'instructions' | 'inventory';
    }> = [];

    checklists.forEach((checklist) => {
      checklist.items.forEach((item) => {
        if (item.title.toLowerCase().includes(lowercaseQuery)) {
          results.push({ checklist, item, matchType: 'title' });
        } else if (item.instructions.toLowerCase().includes(lowercaseQuery)) {
          results.push({ checklist, item, matchType: 'instructions' });
        } else if (
          item.requiredInventory?.some((inv) =>
            inv.name.toLowerCase().includes(lowercaseQuery)
          )
        ) {
          results.push({ checklist, item, matchType: 'inventory' });
        }
      });
    });

    return results;
  }

  /**
   * Filter items
   */
  filterItems(
    checklists: Checklist[],
    filters: {
      completed?: boolean;
      skipped?: boolean;
      hasInventory?: boolean;
      hasSDS?: boolean;
      category?: string;
    }
  ): Array<{ checklist: Checklist; item: ChecklistItem }> {
    const results: Array<{ checklist: Checklist; item: ChecklistItem }> = [];

    checklists.forEach((checklist) => {
      if (filters.category && checklist.category !== filters.category) return;

      checklist.items.forEach((item) => {
        if (filters.completed !== undefined && item.completed !== filters.completed) return;
        if (filters.skipped !== undefined && item.skipped !== filters.skipped) return;
        if (filters.hasInventory !== undefined) {
          const hasInventory = !!(item.requiredInventory && item.requiredInventory.length > 0);
          if (hasInventory !== filters.hasInventory) return;
        }
        if (filters.hasSDS !== undefined) {
          const hasSDS = !!item.sdsId;
          if (hasSDS !== filters.hasSDS) return;
        }

        results.push({ checklist, item });
      });
    });

    return results;
  }

  /**
   * Sort items
   */
  sortItems(
    items: Array<{ checklist: Checklist; item: ChecklistItem }>,
    sortBy: 'title' | 'completed' | 'skipped' | 'inventoryCount',
    order: 'asc' | 'desc' = 'asc'
  ): Array<{ checklist: Checklist; item: ChecklistItem }> {
    return [...items].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.item.title.localeCompare(b.item.title);
          break;
        case 'completed':
          comparison = (a.item.completed ? 1 : 0) - (b.item.completed ? 1 : 0);
          break;
        case 'skipped':
          comparison = (a.item.skipped ? 1 : 0) - (b.item.skipped ? 1 : 0);
          break;
        case 'inventoryCount': {
          const aCount = a.item.requiredInventory?.length || 0;
          const bCount = b.item.requiredInventory?.length || 0;
          comparison = aCount - bCount;
          break;
        }
      }

      return order === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}
