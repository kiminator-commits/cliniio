interface LearningProgressItem {
  id: string;
  title: string;
  category: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  dueDate?: string;
  progress?: number;
  department?: string;
  updated_at?: string;
  source?: string;
  description: string;
  level: string;
  duration: string;
  points: number;
}

class LearningProgressService {
  private static instance: LearningProgressService;
  private progressItems: Map<string, LearningProgressItem> = new Map();

  private constructor() {
    try {
      // Load from localStorage on initialization
      this.loadFromStorage();
    } catch (error) {
      console.error('[LearningProgressService] Failed to initialize:', error);
      // Continue with empty state if localStorage is not available
    }
  }

  public static getInstance(): LearningProgressService | null {
    try {
      if (!LearningProgressService.instance) {
        LearningProgressService.instance = new LearningProgressService();
      }
      return LearningProgressService.instance;
    } catch (error) {
      console.error('[LearningProgressService] Failed to get instance:', error);
      return null;
    }
  }

  private loadFromStorage(): void {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn('[LearningProgressService] localStorage not available');
        return;
      }

      const stored = localStorage.getItem('learningProgress');
      if (stored) {
        const items = JSON.parse(stored);
        this.progressItems.clear();
        items.forEach((item: LearningProgressItem) => {
          this.progressItems.set(item.id, item);
        });
      }
    } catch (error) {
      console.error(
        '[LearningProgressService] Failed to load from storage:',
        error
      );
    }
  }

  private saveToStorage(): void {
    try {
      // Check if localStorage is available
      if (typeof window === 'undefined' || !window.localStorage) {
        console.warn(
          '[LearningProgressService] localStorage not available for saving'
        );
        return;
      }

      const items = Array.from(this.progressItems.values());
      localStorage.setItem('learningProgress', JSON.stringify(items));
    } catch (error) {
      console.error(
        '[LearningProgressService] Failed to save to storage:',
        error
      );
    }
  }

  public addToMyList(item: LearningProgressItem): void {
    const progressItem: LearningProgressItem = {
      ...item,
      status: 'In Progress',
      updated_at: new Date().toISOString(),
    };
    this.progressItems.set(item.id, progressItem);
    this.saveToStorage();
  }

  public markInProgress(itemId: string): void {
    const item = this.progressItems.get(itemId);
    if (item) {
      item.status = 'In Progress';
      item.updated_at = new Date().toISOString();
      this.saveToStorage();
    }
  }

  public getItemStatus(
    itemId: string
  ): 'Not Started' | 'In Progress' | 'Completed' {
    const item = this.progressItems.get(itemId);
    return item ? item.status : 'Not Started';
  }

  public updateItemStatus(
    itemId: string,
    status: 'In Progress' | 'Completed'
  ): void {
    const item = this.progressItems.get(itemId);
    if (item) {
      item.status = status;
      item.updated_at = new Date().toISOString();
      this.saveToStorage();
    }
  }

  public getItemsByCategory(category: string): LearningProgressItem[] {
    return Array.from(this.progressItems.values()).filter(
      (item) => item.category === category
    );
  }

  public getAllProgressItems(): LearningProgressItem[] {
    return Array.from(this.progressItems.values());
  }

  public removeItem(itemId: string): void {
    this.progressItems.delete(itemId);
    this.saveToStorage();
  }

  public isInitialized(): boolean {
    return this.progressItems !== undefined;
  }
}

export default LearningProgressService;
export type { LearningProgressItem };
