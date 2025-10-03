export interface ChecklistItem {
  id: string;
  title: string;
  instructions: string;
  requiredInventory?: {
    id: string;
    name: string;
    required: number;
    available: number;
    used: number;
    unit?: string;
  }[];
  sdsId?: string;
  skipped?: boolean;
  completed?: boolean;
}

export interface Checklist {
  id: string;
  title: string;
  category:
    | 'setup'
    | 'patient'
    | 'weekly'
    | 'public'
    | 'deep'
    | 'environmental_cleaning';
  items: ChecklistItem[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  // Scheduling properties
  autoSchedule?: boolean;
  scheduleFrequency?:
    | 'daily'
    | 'per_patient'
    | 'weekly'
    | 'bi_weekly'
    | 'monthly'
    | 'quarterly'
    | 'custom';
  scheduleDay?:
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday'
    | 'sunday';
  scheduleTime?: string;
  schedulePriority?: 'low' | 'medium' | 'high' | 'urgent';
  schedulePoints?: number;
  scheduleDuration?: number;
  triggerRoomStatus?: boolean;
  triggerStaffSchedule?: boolean;
  triggerAdminDecision?: boolean;
}

export class ChecklistDataProvider {
  private checklists: Checklist[] = [];

  constructor(initialChecklists: Checklist[] = []) {
    this.checklists = initialChecklists;
  }

  /**
   * Get all checklists
   */
  getAllChecklists(): Checklist[] {
    return [...this.checklists];
  }

  /**
   * Get checklist by ID
   */
  getChecklistById(id: string): Checklist | undefined {
    return this.checklists.find((checklist) => checklist.id === id);
  }

  /**
   * Get checklists by category
   */
  getChecklistsByCategory(category: string): Checklist[] {
    return this.checklists.filter((checklist) => checklist.category === category);
  }

  /**
   * Get published checklists by category
   */
  getPublishedChecklistsByCategory(category: string): Checklist[] {
    return this.checklists.filter(
      (checklist) =>
        checklist.category === category && checklist.status === 'published'
    );
  }

  /**
   * Get checklists by status
   */
  getChecklistsByStatus(status: 'draft' | 'published'): Checklist[] {
    return this.checklists.filter((checklist) => checklist.status === status);
  }

  /**
   * Add new checklist
   */
  addChecklist(checklistData: Omit<Checklist, 'id' | 'createdAt' | 'updatedAt'>): Checklist {
    const newChecklist: Checklist = {
      ...checklistData,
      status: 'draft',
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    this.checklists.push(newChecklist);
    return newChecklist;
  }

  /**
   * Update checklist
   */
  updateChecklist(id: string, updates: Partial<Checklist>): Checklist | null {
    const index = this.checklists.findIndex((checklist) => checklist.id === id);
    if (index === -1) return null;

    const updatedChecklist = {
      ...this.checklists[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.checklists[index] = updatedChecklist;
    return updatedChecklist;
  }

  /**
   * Delete checklist
   */
  deleteChecklist(id: string): boolean {
    const index = this.checklists.findIndex((checklist) => checklist.id === id);
    if (index === -1) return false;

    this.checklists.splice(index, 1);
    return true;
  }

  /**
   * Publish checklist
   */
  publishChecklist(id: string): Checklist | null {
    return this.updateChecklist(id, {
      status: 'published',
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Unpublish checklist
   */
  unpublishChecklist(id: string): Checklist | null {
    return this.updateChecklist(id, {
      status: 'draft',
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Duplicate checklist
   */
  duplicateChecklist(id: string, newTitle?: string): Checklist | null {
    const originalChecklist = this.getChecklistById(id);
    if (!originalChecklist) return null;

    const duplicatedChecklist: Checklist = {
      ...originalChecklist,
      id: this.generateId(),
      title: newTitle || `${originalChecklist.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: originalChecklist.items.map((item) => ({
        ...item,
        id: this.generateId(),
        completed: false,
        skipped: false,
      })),
    };

    this.checklists.push(duplicatedChecklist);
    return duplicatedChecklist;
  }

  /**
   * Get checklist statistics
   */
  getChecklistStatistics(): {
    total: number;
    published: number;
    draft: number;
    byCategory: Record<string, number>;
    averageItemsPerChecklist: number;
    totalItems: number;
  } {
    const total = this.checklists.length;
    const published = this.checklists.filter((c) => c.status === 'published').length;
    const draft = this.checklists.filter((c) => c.status === 'draft').length;

    const byCategory = this.checklists.reduce(
      (acc, checklist) => {
        acc[checklist.category] = (acc[checklist.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const totalItems = this.checklists.reduce((sum, checklist) => sum + checklist.items.length, 0);
    const averageItemsPerChecklist = total > 0 ? totalItems / total : 0;

    return {
      total,
      published,
      draft,
      byCategory,
      averageItemsPerChecklist,
      totalItems,
    };
  }

  /**
   * Search checklists
   */
  searchChecklists(query: string): Checklist[] {
    const lowercaseQuery = query.toLowerCase();
    return this.checklists.filter(
      (checklist) =>
        checklist.title.toLowerCase().includes(lowercaseQuery) ||
        checklist.items.some((item) =>
          item.title.toLowerCase().includes(lowercaseQuery) ||
          item.instructions.toLowerCase().includes(lowercaseQuery)
        )
    );
  }

  /**
   * Filter checklists
   */
  filterChecklists(filters: {
    category?: string;
    status?: 'draft' | 'published';
    hasScheduling?: boolean;
    minItems?: number;
    maxItems?: number;
  }): Checklist[] {
    return this.checklists.filter((checklist) => {
      if (filters.category && checklist.category !== filters.category) return false;
      if (filters.status && checklist.status !== filters.status) return false;
      if (filters.hasScheduling !== undefined) {
        const hasScheduling = !!(checklist.autoSchedule || checklist.scheduleFrequency);
        if (hasScheduling !== filters.hasScheduling) return false;
      }
      if (filters.minItems !== undefined && checklist.items.length < filters.minItems) return false;
      if (filters.maxItems !== undefined && checklist.items.length > filters.maxItems) return false;
      return true;
    });
  }

  /**
   * Sort checklists
   */
  sortChecklists(
    checklists: Checklist[],
    sortBy: 'title' | 'createdAt' | 'updatedAt' | 'category' | 'status',
    order: 'asc' | 'desc' = 'asc'
  ): Checklist[] {
    return [...checklists].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }

      return order === 'desc' ? -comparison : comparison;
    });
  }

  /**
   * Export checklists
   */
  exportChecklists(checklistIds?: string[]): string {
    const checklistsToExport = checklistIds
      ? this.checklists.filter((checklist) => checklistIds.includes(checklist.id))
      : this.checklists;

    return JSON.stringify(checklistsToExport, null, 2);
  }

  /**
   * Import checklists
   */
  importChecklists(jsonData: string): {
    success: boolean;
    imported: Checklist[];
    errors: string[];
  } {
    try {
      const importedChecklists = JSON.parse(jsonData) as Checklist[];
      
      if (!Array.isArray(importedChecklists)) {
        return {
          success: false,
          imported: [],
          errors: ['Invalid format: expected array of checklists'],
        };
      }

      const errors: string[] = [];
      const validChecklists: Checklist[] = [];

      importedChecklists.forEach((checklist, index) => {
        const validation = this.validateChecklist(checklist);
        if (!validation.isValid) {
          errors.push(`Checklist ${index + 1}: ${validation.errors.join(', ')}`);
        } else {
          // Generate new IDs to avoid conflicts
          const importedChecklist: Checklist = {
            ...checklist,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: checklist.items.map((item) => ({
              ...item,
              id: this.generateId(),
            })),
          };
          validChecklists.push(importedChecklist);
        }
      });

      if (validChecklists.length > 0) {
        this.checklists.push(...validChecklists);
      }

      return {
        success: errors.length === 0,
        imported: validChecklists,
        errors,
      };
    } catch {
      return {
        success: false,
        imported: [],
        errors: ['Invalid JSON format'],
      };
    }
  }

  /**
   * Validate checklist
   */
  validateChecklist(checklist: Partial<Checklist>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!checklist.title || checklist.title.trim() === '') {
      errors.push('Title is required');
    }

    if (!checklist.category) {
      errors.push('Category is required');
    } else {
      const validCategories = ['setup', 'patient', 'weekly', 'public', 'deep', 'environmental_cleaning'];
      if (!validCategories.includes(checklist.category)) {
        errors.push(`Invalid category: ${checklist.category}`);
      }
    }

    if (!checklist.items || !Array.isArray(checklist.items)) {
      errors.push('Items array is required');
    } else if (checklist.items.length === 0) {
      errors.push('At least one item is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get default checklists
   */
  getDefaultChecklists(): Checklist[] {
    return [
      {
        id: 'treatment-room-setup',
        title: 'Treatment Room Setup',
        category: 'setup',
        status: 'published',
        items: [
          {
            id: 'clean-surfaces',
            title: 'Clean and sanitize all surfaces with CaviWipes',
            instructions: 'Use 2 wipes per surface. Allow to air dry for 3 minutes.',
            requiredInventory: [
              {
                id: 'caviwipes-001',
                name: 'CaviWipes',
                required: 2,
                available: 100,
                used: 0,
                unit: 'wipes',
              },
            ],
            sdsId: 'caviwipes-sds',
            skipped: false,
            completed: false,
          },
          {
            id: 'restock-supplies',
            title: 'Restock Treatment Room Supplies',
            instructions: 'Verify all supplies are present and in date',
            requiredInventory: [
              {
                id: 'gloves-001',
                name: 'Nitrile Gloves',
                required: 10,
                available: 500,
                used: 0,
                unit: 'pairs',
              },
              {
                id: 'gauze-001',
                name: 'Sterile Gauze',
                required: 5,
                available: 200,
                used: 0,
                unit: 'packs',
              },
              {
                id: 'alcohol-001',
                name: 'Alcohol Swabs',
                required: 10,
                available: 300,
                used: 0,
                unit: 'swabs',
              },
            ],
            skipped: false,
            completed: false,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Set checklists (for initialization)
   */
  setChecklists(checklists: Checklist[]): void {
    this.checklists = [...checklists];
  }

  /**
   * Clear all checklists
   */
  clearChecklists(): void {
    this.checklists = [];
  }
}
