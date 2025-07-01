interface UsageData {
  itemId: string;
  usageCount: number;
  lastUsed: Date;
  searchCount: number;
  favoriteCount: number;
  trackCount: number;
}

class UsageTrackingService {
  private static instance: UsageTrackingService;
  private usageData: Map<string, UsageData> = new Map();
  private readonly STORAGE_KEY = 'inventory_usage_data';

  private constructor() {
    this.loadUsageData();
  }

  static getInstance(): UsageTrackingService {
    if (!UsageTrackingService.instance) {
      UsageTrackingService.instance = new UsageTrackingService();
    }
    return UsageTrackingService.instance;
  }

  private loadUsageData(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        // Convert date strings back to Date objects
        const convertedData = Object.fromEntries(
          Object.entries(data).map(([key, value]: [string, unknown]) => [
            key,
            {
              ...value,
              lastUsed: new Date((value as { lastUsed: string }).lastUsed),
            },
          ])
        );
        this.usageData = new Map(Object.entries(convertedData));
      }
    } catch (error) {
      console.warn('Failed to load usage data:', error);
    }
  }

  private saveUsageData(): void {
    try {
      const data = Object.fromEntries(this.usageData);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save usage data:', error);
    }
  }

  private getOrCreateUsageData(itemId: string): UsageData {
    if (!this.usageData.has(itemId)) {
      this.usageData.set(itemId, {
        itemId,
        usageCount: 0,
        lastUsed: new Date(),
        searchCount: 0,
        favoriteCount: 0,
        trackCount: 0,
      });
    }
    return this.usageData.get(itemId)!;
  }

  // Track when an item is viewed/accessed
  trackItemView(itemId: string): void {
    const data = this.getOrCreateUsageData(itemId);
    data.usageCount += 1;
    data.lastUsed = new Date();
    this.saveUsageData();
  }

  // Track when an item is searched for
  trackItemSearch(itemId: string): void {
    const data = this.getOrCreateUsageData(itemId);
    data.searchCount += 1;
    data.lastUsed = new Date();
    this.saveUsageData();
  }

  // Track when an item is favorited
  trackItemFavorite(itemId: string): void {
    const data = this.getOrCreateUsageData(itemId);
    data.favoriteCount += 1;
    data.lastUsed = new Date();
    this.saveUsageData();
  }

  // Track when an item is tracked
  trackItemTrack(itemId: string): void {
    const data = this.getOrCreateUsageData(itemId);
    data.trackCount += 1;
    data.lastUsed = new Date();
    this.saveUsageData();
  }

  // Calculate smart score for an item
  calculateSmartScore(itemId: string): number {
    const data = this.usageData.get(itemId);
    if (!data) return 0;

    const now = new Date();

    // Ensure lastUsed is a valid Date object
    let lastUsed: Date;
    try {
      lastUsed = data.lastUsed instanceof Date ? data.lastUsed : new Date(data.lastUsed);
      if (isNaN(lastUsed.getTime())) {
        lastUsed = new Date(); // Fallback to current date if invalid
      }
    } catch (error) {
      lastUsed = new Date(); // Fallback to current date if error
    }

    const daysSinceLastUsed = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);

    // Base score from usage count
    let score = data.usageCount * 10;

    // Bonus for recent usage (items used in last 7 days get bonus)
    if (daysSinceLastUsed <= 7) {
      score += 50;
    }

    // Bonus for search frequency
    score += data.searchCount * 5;

    // Bonus for being favorited
    score += data.favoriteCount * 20;

    // Bonus for being tracked
    score += data.trackCount * 15;

    // Decay for old items (items not used in 30+ days get penalty)
    if (daysSinceLastUsed > 30) {
      score *= 0.8;
    }

    return Math.round(score);
  }

  // Get smart ranking for a list of items
  getSmartRanking<
    T extends { toolId?: string; supplyId?: string; equipmentId?: string; hardwareId?: string },
  >(items: T[]): T[] {
    return [...items].sort((a, b) => {
      const aId = a.toolId || a.supplyId || a.equipmentId || a.hardwareId || '';
      const bId = b.toolId || b.supplyId || b.equipmentId || b.hardwareId || '';

      const aScore = this.calculateSmartScore(aId);
      const bScore = this.calculateSmartScore(bId);

      return bScore - aScore; // Higher scores first
    });
  }

  // Get usage statistics for debugging
  getUsageStats(): Record<string, UsageData> {
    return Object.fromEntries(this.usageData);
  }

  // Clear all usage data (for testing/reset)
  clearUsageData(): void {
    this.usageData.clear();
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const usageTrackingService = UsageTrackingService.getInstance();
export type { UsageData };
