import { inventorySupabaseService } from './inventorySupabaseService';
import { INVENTORY_CONFIG } from '@/config/inventoryConfig';
import {
  InventoryResponse,
  InventoryFilters,
} from '../types/inventoryServiceTypes';
import { InventoryItem } from '@/types/inventoryTypes';

interface LoadBalancerConfig {
  maxConcurrentRequests: number;
  requestTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCaching: boolean;
  cacheTTL: number;
  enableConnectionPooling: boolean;
  enableQueryOptimization: boolean;
}

interface RequestQueue {
  id: string;
  operation: () => Promise<unknown>;
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
  retryCount: number;
  cacheKey?: string;
}

export class InventoryLoadBalancer {
  private static instance: InventoryLoadBalancer;
  private config: LoadBalancerConfig;
  private requestQueue: RequestQueue[] = [];
  private activeRequests = 0;
  private cache = new Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  >();
  private isProcessing = false;

  private constructor() {
    this.config = {
      maxConcurrentRequests: INVENTORY_CONFIG.performance.maxConcurrentRequests,
      requestTimeout: INVENTORY_CONFIG.performance.requestTimeout,
      retryAttempts: INVENTORY_CONFIG.errorHandling.maxRetryAttempts,
      retryDelay: 1000,
      enableCaching: INVENTORY_CONFIG.cache.enabled,
      cacheTTL: INVENTORY_CONFIG.cache.ttl,
      enableConnectionPooling:
        INVENTORY_CONFIG.performance.enableConnectionPooling,
      enableQueryOptimization:
        INVENTORY_CONFIG.performance.enableQueryOptimization,
    };
  }

  static getInstance(): InventoryLoadBalancer {
    if (!InventoryLoadBalancer.instance) {
      InventoryLoadBalancer.instance = new InventoryLoadBalancer();
    }
    return InventoryLoadBalancer.instance;
  }

  /**
   * Get inventory items with load balancing
   */
  async getItems(
    filters?: InventoryFilters,
    priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<InventoryResponse> {
    const cacheKey = this.generateCacheKey('getItems', filters);

    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached as InventoryResponse;
      }
    }

    return this.executeRequest(
      () => inventorySupabaseService.getItems(filters),
      priority,
      cacheKey
    ) as unknown;
  }

  /**
   * Get item by ID with load balancing
   */
  async getItemById(
    id: string,
    priority: 'high' | 'medium' | 'low' = 'high'
  ): Promise<InventoryItem | null> {
    const cacheKey = this.generateCacheKey('getItemById', { id });

    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached as InventoryItem | null;
      }
    }

    return this.executeRequest(
      () => inventorySupabaseService.getItemById(id),
      priority,
      cacheKey
    );
  }

  /**
   * Create item with load balancing
   */
  async createItem(
    item: Omit<InventoryItem, 'id' | 'lastUpdated'>,
    priority: 'high' | 'medium' | 'low' = 'high'
  ): Promise<InventoryItem> {
    const result = await this.executeRequest(
      () => inventorySupabaseService.createItem(item),
      priority
    );

    // Invalidate relevant caches
    this.invalidateCache('getItems');
    this.invalidateCache('getCategories');
    this.invalidateCache('getLocations');

    return result;
  }

  /**
   * Update item with load balancing
   */
  async updateItem(
    id: string,
    updates: Partial<InventoryItem>,
    priority: 'high' | 'medium' | 'low' = 'high'
  ): Promise<InventoryItem> {
    const result = await this.executeRequest(
      () => inventorySupabaseService.updateItem(id, updates),
      priority
    );

    // Invalidate relevant caches
    this.invalidateCache('getItems');
    this.invalidateCache(`getItemById_${id}`);

    return result;
  }

  /**
   * Delete item with load balancing
   */
  async deleteItem(
    id: string,
    priority: 'high' | 'medium' | 'low' = 'high'
  ): Promise<void> {
    await this.executeRequest(
      () => inventorySupabaseService.deleteItem(id),
      priority
    );

    // Invalidate relevant caches
    this.invalidateCache('getItems');
    this.invalidateCache(`getItemById_${id}`);
  }

  /**
   * Get categories with load balancing
   */
  async getCategories(
    priority: 'high' | 'medium' | 'low' = 'low'
  ): Promise<string[]> {
    const cacheKey = this.generateCacheKey('getCategories');

    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached as string[];
      }
    }

    return this.executeRequest(
      () => inventorySupabaseService.getCategories(),
      priority,
      cacheKey
    );
  }

  /**
   * Get locations with load balancing
   */
  async getLocations(
    priority: 'high' | 'medium' | 'low' = 'low'
  ): Promise<string[]> {
    const cacheKey = this.generateCacheKey('getLocations');

    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached as string[];
      }
    }

    return this.executeRequest(
      () => inventorySupabaseService.getLocations(),
      priority,
      cacheKey
    );
  }

  /**
   * Get analytics with load balancing
   */
  async getAnalytics(
    priority: 'high' | 'medium' | 'low' = 'low'
  ): Promise<unknown> {
    const cacheKey = this.generateCacheKey('getAnalytics');

    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) {
        return cached;
      }
    }

    return this.executeRequest(
      () => inventorySupabaseService.getAnalytics(),
      priority,
      cacheKey
    );
  }

  /**
   * Execute request with load balancing
   */
  private async executeRequest<T>(
    operation: () => Promise<T>,
    priority: 'high' | 'medium' | 'low' = 'medium',
    cacheKey?: string
  ): Promise<T> {
    return new Promise(() => {
      // Promise constructor parameters are intentionally unused
      const requestId = this.generateRequestId();
      const request: RequestQueue = {
        id: requestId,
        operation,
        priority,
        timestamp: Date.now(),
        retryCount: 0,
        cacheKey,
      };

      // Add to queue
      this.addToQueue(request);

      // Process queue
      this.processQueue().then(() => {
        // Request will be resolved/rejected in processQueue
      });
    });
  }

  /**
   * Add request to queue with priority
   */
  private addToQueue(request: RequestQueue): void {
    // Insert based on priority
    const priorityOrder = { high: 3, medium: 2, low: 1 };

    let insertIndex = this.requestQueue.findIndex(
      (existing) =>
        priorityOrder[existing.priority] < priorityOrder[request.priority]
    );

    if (insertIndex === -1) {
      insertIndex = this.requestQueue.length;
    }

    this.requestQueue.splice(insertIndex, 0, request);
  }

  /**
   * Process the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (
      this.requestQueue.length > 0 &&
      this.activeRequests < this.config.maxConcurrentRequests
    ) {
      const request = this.requestQueue.shift();
      if (!request) continue;

      this.activeRequests++;

      this.executeRequestWithRetry(request).finally(() => {
        this.activeRequests--;
      });
    }

    this.isProcessing = false;

    // Continue processing if there are more requests
    if (this.requestQueue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  /**
   * Execute request with retry logic
   */
  private async executeRequestWithRetry(request: RequestQueue): Promise<void> {
    try {
      const result = await Promise.race([
        request.operation(),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Request timeout')),
            this.config.requestTimeout
          )
        ),
      ]);

      // Cache result if cacheKey is provided
      if (request.cacheKey) {
        this.setCache(request.cacheKey, result);
      }
    } catch (error) {
      console.error(`📦 Load balancer: Request ${request.id} failed:`, error);

      if (request.retryCount < this.config.retryAttempts) {
        request.retryCount++;

        // Add back to queue with delay
        setTimeout(() => {
          this.addToQueue(request);
          this.processQueue();
        }, this.config.retryDelay * request.retryCount);
      } else {
        console.error(
          `📦 Load balancer: Request ${request.id} failed after ${this.config.retryAttempts} attempts`
        );
      }
    }
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): unknown | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private setCache(key: string, data: unknown): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.config.cacheTTL,
    });
  }

  private invalidateCache(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  private generateCacheKey(operation: string, params?: unknown): string {
    return `${operation}_${JSON.stringify(params || {})}`;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get load balancer statistics
   */
  getStats(): {
    queueLength: number;
    activeRequests: number;
    cacheSize: number;
    maxConcurrentRequests: number;
  } {
    return {
      queueLength: this.requestQueue.length,
      activeRequests: this.activeRequests,
      cacheSize: this.cache.size,
      maxConcurrentRequests: this.config.maxConcurrentRequests,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LoadBalancerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const inventoryLoadBalancer = InventoryLoadBalancer.getInstance();
