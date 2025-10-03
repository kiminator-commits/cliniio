/**
 * Simplified cache invalidation service
 * Removes unnecessary complexity while maintaining interface compatibility
 */

export interface CacheManager {
  clearCache(): void;
  invalidatePattern?(pattern: string): void;
  invalidateKey?(key: string): void;
}

export type CacheInvalidationListener = (pattern: string) => void;

/**
 * Simplified cache invalidation service that removes excessive complexity
 * while maintaining the same interface for compatibility
 */
export class SimpleCacheInvalidationService {
  private static instance: SimpleCacheInvalidationService;
  private cacheManagers = new Map<string, CacheManager>();

  private constructor() {}

  static getInstance(): SimpleCacheInvalidationService {
    if (!this.instance) {
      this.instance = new SimpleCacheInvalidationService();
    }
    return this.instance;
  }

  /**
   * Register a cache manager (simplified)
   */
  registerCacheManager(name: string, manager: CacheManager): void {
    this.cacheManagers.set(name, manager);
    console.log(`📝 Registered cache manager: ${name}`);
  }

  /**
   * Unregister a cache manager
   */
  unregisterCacheManager(name: string): void {
    this.cacheManagers.delete(name);
    console.log(`📝 Unregistered cache manager: ${name}`);
  }

  /**
   * Add a listener (no-op for compatibility)
   */
  onInvalidation(): void {
    // Simplified - no listener management needed
    console.log('📝 Cache invalidation listener registered (simplified)');
  }

  /**
   * Remove a listener (no-op for compatibility)
   */
  offInvalidation(): void {
    // Simplified - no listener management needed
    console.log('📝 Cache invalidation listener removed (simplified)');
  }

  /**
   * Invalidate cache by pattern (simplified)
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
  }

  /**
   * Invalidate specific cache key (simplified)
   */
  invalidateKey(key: string): void {
    console.log(`🧹 Invalidating cache key: ${key}`);

    this.cacheManagers.forEach((manager) => {
      if (manager.invalidateKey) {
        manager.invalidateKey(key);
      }
    });
  }

  /**
   * Invalidate related caches based on operation type (simplified)
   */
  invalidateRelated(operation: string, entityId?: string): void {
    console.log(
      `🧹 Invalidating related caches for operation: ${operation}${entityId ? ` (${entityId})` : ''}`
    );

    // Simplified invalidation - just clear relevant caches
    if (operation.startsWith('inventory:')) {
      this.invalidatePattern('inventory');
    } else if (operation.startsWith('knowledge:')) {
      this.invalidatePattern('knowledge');
    } else if (operation.startsWith('cleaning:')) {
      this.invalidatePattern('cleaning');
    } else if (
      operation === 'user:login' ||
      operation === 'user:logout' ||
      operation === 'app:refresh'
    ) {
      this.clearAllCaches();
    }
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    console.log('🧹 Clearing all caches');

    this.cacheManagers.forEach((manager) => {
      manager.clearCache();
    });
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
export const simpleCacheInvalidationService =
  SimpleCacheInvalidationService.getInstance();
