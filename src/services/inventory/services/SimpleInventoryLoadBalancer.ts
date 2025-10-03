/**
 * Simplified inventory load balancer
 * Removes unnecessary complexity while maintaining interface compatibility
 */

import { inventorySupabaseService } from './inventorySupabaseService';
import { INVENTORY_CONFIG } from '@/config/inventoryConfig';
import {
  InventoryResponse,
  InventoryFilters,
} from '../types/inventoryServiceTypes';
import { InventoryItem } from '@/types/inventoryTypes';

export interface LoadBalancerConfig {
  maxConcurrentRequests: number;
  requestTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableCaching: boolean;
  cacheTTL: number;
  enableConnectionPooling: boolean;
  enableQueryOptimization: boolean;
}

/**
 * Simplified load balancer that removes excessive complexity
 * while maintaining the same interface for compatibility
 */
export class SimpleInventoryLoadBalancer {
  private static instance: SimpleInventoryLoadBalancer;
  private config: LoadBalancerConfig;

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

  static getInstance(): SimpleInventoryLoadBalancer {
    if (!SimpleInventoryLoadBalancer.instance) {
      SimpleInventoryLoadBalancer.instance = new SimpleInventoryLoadBalancer();
    }
    return SimpleInventoryLoadBalancer.instance;
  }

  /**
   * Get inventory items (simplified - direct call)
   */
  async getItems(
    filters?: InventoryFilters,
    _priority: 'high' | 'medium' | 'low' = 'medium'
  ): Promise<InventoryResponse> {
    return inventorySupabaseService.getItems(filters);
  }

  /**
   * Get item by ID (simplified - direct call)
   */
  async getItemById(
    id: string,
    _priority: 'high' | 'medium' | 'low' = 'high'
  ): Promise<InventoryItem | null> {
    return inventorySupabaseService.getItemById(id);
  }

  /**
   * Create item (simplified - direct call)
   */
  async createItem(
    item: Omit<InventoryItem, 'id' | 'lastUpdated'>,
    _priority: 'high' | 'medium' | 'low' = 'high'
  ): Promise<InventoryItem> {
    return inventorySupabaseService.createItem(item);
  }

  /**
   * Update item (simplified - direct call)
   */
  async updateItem(
    id: string,
    updates: Partial<InventoryItem>,
    _priority: 'high' | 'medium' | 'low' = 'high'
  ): Promise<InventoryItem> {
    return inventorySupabaseService.updateItem(id, updates);
  }

  /**
   * Delete item (simplified - direct call)
   */
  async deleteItem(
    id: string,
    _priority: 'high' | 'medium' | 'low' = 'high'
  ): Promise<void> {
    return inventorySupabaseService.deleteItem(id);
  }

  /**
   * Get categories (simplified - direct call)
   */
  async getCategories(
    _priority: 'high' | 'medium' | 'low' = 'low'
  ): Promise<string[]> {
    return inventorySupabaseService.getCategories();
  }

  /**
   * Get locations (simplified - direct call)
   */
  async getLocations(
    _priority: 'high' | 'medium' | 'low' = 'low'
  ): Promise<string[]> {
    return inventorySupabaseService.getLocations();
  }

  /**
   * Get analytics (simplified - direct call)
   */
  async getAnalytics(
    _priority: 'high' | 'medium' | 'low' = 'low'
  ): Promise<unknown> {
    return inventorySupabaseService.getAnalytics();
  }

  /**
   * Get load balancer statistics (simplified)
   */
  getStats(): {
    queueLength: number;
    activeRequests: number;
    cacheSize: number;
    maxConcurrentRequests: number;
  } {
    return {
      queueLength: 0, // No queue in simplified version
      activeRequests: 0, // No request tracking in simplified version
      cacheSize: 0, // No cache in simplified version
      maxConcurrentRequests: this.config.maxConcurrentRequests,
    };
  }

  /**
   * Clear cache (no-op for compatibility)
   */
  clearCache(): void {}

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LoadBalancerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const simpleInventoryLoadBalancer =
  SimpleInventoryLoadBalancer.getInstance();
