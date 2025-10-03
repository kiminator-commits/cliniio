/**
 * Centralized cache invalidation service
 * Provides consistent cache invalidation patterns across all modules
 */

export interface CacheManager {
  clearCache(): void;
  invalidatePattern?(pattern: string): void;
  invalidateKey?(key: string): void;
}

export type CacheInvalidationListener = (pattern: string) => void;

export class CacheInvalidationService {
  private static instance: CacheInvalidationService;
  private cacheManagers = new Map<string, CacheManager>();
  private invalidationListeners = new Set<CacheInvalidationListener>();

  private constructor() {}

  static getInstance(): CacheInvalidationService {
    if (!this.instance) {
      this.instance = new CacheInvalidationService();
    }
    return this.instance;
  }

  /**
   * Register a cache manager for centralized invalidation
   */
  registerCacheManager(name: string, manager: CacheManager): void {
    this.cacheManagers.set(name, manager);
  }

  /**
   * Unregister a cache manager
   */
  unregisterCacheManager(name: string): void {
    this.cacheManagers.delete(name);
  }

  /**
   * Add a listener for cache invalidation events
   */
  onInvalidation(listener: CacheInvalidationListener): void {
    this.invalidationListeners.add(listener);
  }

  /**
   * Remove a listener for cache invalidation events
   */
  offInvalidation(listener: CacheInvalidationListener): void {
    this.invalidationListeners.delete(listener);
  }

  /**
   * Notify all listeners of cache invalidation
   */
  private notifyListeners(pattern: string): void {
    this.invalidationListeners.forEach((listener) => {
      try {
        listener(pattern);
      } catch (error) {
        console.error('Error in cache invalidation listener:', error);
      }
    });
  }

  /**
   * Invalidate cache by pattern
   */
  invalidatePattern(pattern: string): void {
    console.log(`🧹 Invalidating cache pattern: ${pattern}`);

    this.cacheManagers.forEach((manager, name) => {
      if (name.includes(pattern) || pattern === 'all') {
        if (manager.invalidatePattern) {
          manager.invalidatePattern(pattern);
        } else {
          manager.clearCache();
        }
      }
    });

    // Notify listeners of the invalidation
    this.notifyListeners(pattern);
  }

  /**
   * Invalidate specific cache key
   */
  invalidateKey(key: string): void {
    console.log(`🧹 Invalidating cache key: ${key}`);

    this.cacheManagers.forEach((manager) => {
      if (manager.invalidateKey) {
        manager.invalidateKey(key);
      }
    });

    // Notify listeners of the invalidation
    this.notifyListeners(key);
  }

  /**
   * Invalidate related caches based on operation type
   */
  invalidateRelated(operation: string, entityId?: string): void {
    console.log(
      `🧹 Invalidating related caches for operation: ${operation}${entityId ? ` (${entityId})` : ''}`
    );

    // Define invalidation rules for different operations
    const rules: Record<string, string[]> = {
      // Inventory operations
      'inventory:create': [
        'inventory_data',
        'inventory_stats',
        'inventory_list',
      ],
      'inventory:update': [
        'inventory_data',
        'inventory_stats',
        `inventory_item_${entityId}`,
        'inventory_list',
      ],
      'inventory:delete': [
        'inventory_data',
        'inventory_stats',
        `inventory_item_${entityId}`,
        'inventory_list',
      ],
      'inventory:bulk_update': [
        'inventory_data',
        'inventory_stats',
        'inventory_list',
      ],
      'inventory:bulk_delete': [
        'inventory_data',
        'inventory_stats',
        'inventory_list',
      ],

      // Knowledge Hub operations
      'knowledge:create': [
        'knowledge_content',
        'knowledge_stats',
        'knowledge_list',
      ],
      'knowledge:update': [
        'knowledge_content',
        'knowledge_stats',
        `knowledge_item_${entityId}`,
        'knowledge_list',
      ],
      'knowledge:delete': [
        'knowledge_content',
        'knowledge_stats',
        `knowledge_item_${entityId}`,
        'knowledge_list',
      ],
      'knowledge:bulk_update': [
        'knowledge_content',
        'knowledge_stats',
        'knowledge_list',
      ],
      'knowledge:bulk_delete': [
        'knowledge_content',
        'knowledge_stats',
        'knowledge_list',
      ],

      // Cleaning Schedule operations
      'cleaning:create': ['cleaning_schedule', 'cleaning_stats'],
      'cleaning:update': ['cleaning_schedule', 'cleaning_stats'],
      'cleaning:delete': ['cleaning_schedule', 'cleaning_stats'],

      // General operations
      'user:login': ['all'],
      'user:logout': ['all'],
      'app:refresh': ['all'],
    };

    const patterns = rules[operation] || [];
    patterns.forEach((pattern) => this.invalidatePattern(pattern));
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    console.log('🧹 Clearing all caches');

    this.cacheManagers.forEach((manager) => {
      manager.clearCache();
    });

    // Notify listeners of the 'all' invalidation
    this.notifyListeners('all');
  }

  /**
   * Get registered cache managers
   */
  getRegisteredManagers(): string[] {
    return Array.from(this.cacheManagers.keys());
  }

  /**
   * Check if a cache manager is registered
   */
  isRegistered(name: string): boolean {
    return this.cacheManagers.has(name);
  }
}

// Export singleton instance
export const cacheInvalidationService = CacheInvalidationService.getInstance();
