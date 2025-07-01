interface LearningProgressItem {
  id: string;
  title: string;
  category: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  dueDate?: string;
  progress?: number;
  department?: string;
  lastUpdated?: string;
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
    // Load from localStorage on initialization
    this.loadFromStorage();
  }

  public static getInstance(): LearningProgressService {
    if (!LearningProgressService.instance) {
      LearningProgressService.instance = new LearningProgressService();
    }
    return LearningProgressService.instance;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('learningProgress');
      if (stored) {
        const items = JSON.parse(stored);
        this.progressItems.clear();
        items.forEach((item: LearningProgressItem) => {
          this.progressItems.set(item.id, item);
        });
      }
    } catch (error) {
      console.error('[LearningProgressService]', error);
    }
  }

  private saveToStorage(): void {
    try {
      const items = Array.from(this.progressItems.values());
      localStorage.setItem('learningProgress', JSON.stringify(items));
    } catch (error) {
      console.error('[LearningProgressService]', error);
    }
  }

  public addToMyList(item: LearningProgressItem): void {
    const progressItem: LearningProgressItem = {
      ...item,
      status: 'In Progress',
      lastUpdated: new Date().toISOString(),
    };
    this.progressItems.set(item.id, progressItem);
    this.saveToStorage();
  }

  public markInProgress(itemId: string): void {
    const item = this.progressItems.get(itemId);
    if (item) {
      item.status = 'In Progress';
      item.lastUpdated = new Date().toISOString();
      this.saveToStorage();
    }
  }

  public getItemStatus(itemId: string): 'Not Started' | 'In Progress' | 'Completed' {
    const item = this.progressItems.get(itemId);
    return item ? item.status : 'Not Started';
  }

  public updateItemStatus(itemId: string, status: 'In Progress' | 'Completed'): void {
    const item = this.progressItems.get(itemId);
    if (item) {
      item.status = status;
      item.lastUpdated = new Date().toISOString();
      this.saveToStorage();
    }
  }

  public getItemsByCategory(category: string): LearningProgressItem[] {
    return Array.from(this.progressItems.values()).filter(item => item.category === category);
  }

  public getAllProgressItems(): LearningProgressItem[] {
    return Array.from(this.progressItems.values());
  }

  public removeItem(itemId: string): void {
    this.progressItems.delete(itemId);
    this.saveToStorage();
  }
}

export default LearningProgressService;
export type { LearningProgressItem };
