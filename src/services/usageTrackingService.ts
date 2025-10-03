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
        const data = JSON.parse(stored) as Record<string, unknown>;
        // Convert date strings back to Date objects
        const convertedData = Object.fromEntries(
          Object.entries(data).map(([key, value]) => {
            const typedValue = value as { lastUsed: string } & Record<
              string,
              unknown
            >;
            return [
              key,
              {
                ...typedValue,
                lastUsed: new Date(typedValue.lastUsed),
              },
            ];
          })
        );
        this.usageData = new Map(
          Object.entries(convertedData) as [string, UsageData][]
        );
      }
    } catch (err) {
      console.error(err);
      console.warn('Failed to load usage data:');
    }
  }

  private saveUsageData(): void {
    try {
      const data = Object.fromEntries(this.usageData);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error(err);
      console.warn('Failed to save usage data:');
    }
  }

  private getOrCreateUsageData(itemId: string): UsageData {
    const existing = this.usageData.get(itemId);
    if (!existing) {
      const newData: UsageData = {
        itemId,
        usageCount: 0,
        lastUsed: new Date(),
        searchCount: 0,
        favoriteCount: 0,
        trackCount: 0,
      };
      this.usageData.set(itemId, newData);
      return newData;
    }
    return existing;
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
      lastUsed =
        data.lastUsed instanceof Date ? data.lastUsed : new Date(data.lastUsed);
      if (isNaN(lastUsed.getTime())) {
        lastUsed = new Date(); // Fallback to current date if invalid
      }
    } catch (err) {
      console.error(err);
      lastUsed = new Date(); // Fallback to current date if error
    }

    const daysSinceLastUsed =
      (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);

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
    T extends {
      toolId?: string;
      supplyId?: string;
      equipmentId?: string;
      hardwareId?: string;
      data?: Record<string, unknown>;
    },
  >(items: T[]): T[] {
    return [...items].sort((a, b) => {
      const aId =
        a.toolId ||
        a.supplyId ||
        a.equipmentId ||
        a.hardwareId ||
        a.data?.toolId ||
        a.data?.supplyId ||
        a.data?.equipmentId ||
        a.data?.hardwareId ||
        '';
      const bId =
        b.toolId ||
        b.supplyId ||
        b.equipmentId ||
        b.hardwareId ||
        b.data?.toolId ||
        b.data?.supplyId ||
        b.data?.equipmentId ||
        b.data?.hardwareId ||
        '';

      const aScore = this.calculateSmartScore(aId as string);
      const bScore = this.calculateSmartScore(bId as string);

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
