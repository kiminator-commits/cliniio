import { logEvent, trackUserAction } from '@/utils/monitoring';
import { AnalyticsTrackingService } from '../../../shared/analyticsTrackingService';

export interface AnalyticsEvent {
  eventType: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, unknown>;
}

export interface UserAction {
  action: string;
  module: string;
  properties?: Record<string, unknown>;
}

export class InventoryAnalyticsProvider {
  private adapterType: string;

  constructor(adapterType: string) {
    this.adapterType = adapterType;
  }

  /**
   * Track inventory item creation
   */
  trackItemCreated(itemId: string, itemName: string, category: string): void {
    const event: AnalyticsEvent = {
      eventType: 'inventory_item_created',
      category: 'inventory',
      action: 'create_item',
      label: itemName,
      properties: {
        itemId,
        itemName,
        category,
        adapterType: this.adapterType,
      },
    };

    this.logEvent(
      'inventory',
      'item_created',
      `Inventory item created: ${itemName}`,
      'info',
      event.properties
    );
    this.trackUserAction('create_item', 'inventory', {
      itemId,
      itemName,
      category,
    });
    this.trackAnalyticsEvent('inventory_item_created', event.properties as any);
  }

  /**
   * Track inventory item update
   */
  trackItemUpdated(itemId: string, updates: string[]): void {
    const event: AnalyticsEvent = {
      eventType: 'inventory_item_updated',
      category: 'inventory',
      action: 'update_item',
      properties: {
        itemId,
        updates,
        adapterType: this.adapterType,
      },
    };

    this.logEvent(
      'inventory',
      'item_updated',
      `Inventory item updated: ${itemId}`,
      'info',
      event.properties
    );
    this.trackUserAction('update_item', 'inventory', {
      itemId,
      updates,
    });
    this.trackAnalyticsEvent('inventory_item_updated', event.properties as any);
  }

  /**
   * Track inventory item deletion
   */
  trackItemDeleted(itemId: string): void {
    const event: AnalyticsEvent = {
      eventType: 'inventory_item_deleted',
      category: 'inventory',
      action: 'delete_item',
      properties: {
        itemId,
        adapterType: this.adapterType,
      },
    };

    this.logEvent(
      'inventory',
      'item_deleted',
      `Inventory item deleted: ${itemId}`,
      'info',
      event.properties
    );
    this.trackUserAction('delete_item', 'inventory', { itemId });
    this.trackAnalyticsEvent('inventory_item_deleted', event.properties as any);
  }

  /**
   * Track category creation
   */
  trackCategoryCreated(category: string): void {
    const event: AnalyticsEvent = {
      eventType: 'inventory_category_created',
      category: 'inventory',
      action: 'create_category',
      label: category,
      properties: {
        category,
        adapterType: this.adapterType,
      },
    };

    this.logEvent(
      'inventory',
      'category_created',
      `Category created: ${category}`,
      'info',
      event.properties
    );
    this.trackUserAction('create_category', 'inventory', { category });
    this.trackAnalyticsEvent('inventory_category_created', event.properties as any);
  }

  /**
   * Track category deletion
   */
  trackCategoryDeleted(category: string): void {
    const event: AnalyticsEvent = {
      eventType: 'inventory_category_deleted',
      category: 'inventory',
      action: 'delete_category',
      label: category,
      properties: {
        category,
        adapterType: this.adapterType,
      },
    };

    this.logEvent(
      'inventory',
      'category_deleted',
      `Category deleted: ${category}`,
      'info',
      event.properties
    );
    this.trackUserAction('delete_category', 'inventory', { category });
    this.trackAnalyticsEvent('inventory_category_deleted', event.properties as any);
  }

  /**
   * Track bulk operations
   */
  trackBulkOperation(
    operation: string,
    totalItems: number,
    successCount: number,
    errorCount: number,
    additionalProperties?: Record<string, unknown>
  ): void {
    const event: AnalyticsEvent = {
      eventType: `inventory_bulk_${operation}`,
      category: 'inventory',
      action: `bulk_${operation}`,
      value: successCount,
      properties: {
        totalItems,
        successCount,
        errorCount,
        adapterType: this.adapterType,
        ...additionalProperties,
      },
    };

    this.logEvent(
      'inventory',
      `bulk_${operation}`,
      `Bulk ${operation}: ${successCount} successful, ${errorCount} failed`,
      'info',
      event.properties
    );
    this.trackUserAction(`bulk_${operation}`, 'inventory', {
      totalItems,
      successCount,
      errorCount,
      ...additionalProperties,
    });
    this.trackAnalyticsEvent(`inventory_bulk_${operation}`, event.properties as any);
  }

  /**
   * Track search operations
   */
  trackSearch(
    query: string,
    resultCount: number,
    filters?: Record<string, unknown>
  ): void {
    const event: AnalyticsEvent = {
      eventType: 'inventory_search',
      category: 'inventory',
      action: 'search_items',
      label: query,
      value: resultCount,
      properties: {
        query,
        resultCount,
        filters,
        adapterType: this.adapterType,
      },
    };

    this.logEvent(
      'inventory',
      'search_performed',
      `Search: "${query}" returned ${resultCount} results`,
      'info',
      event.properties
    );
    this.trackUserAction('search_items', 'inventory', {
      query,
      resultCount,
      filters,
    });
    this.trackAnalyticsEvent('inventory_search', event.properties as any);
  }

  /**
   * Track filter operations
   */
  trackFilter(filters: Record<string, unknown>, resultCount: number): void {
    const event: AnalyticsEvent = {
      eventType: 'inventory_filter',
      category: 'inventory',
      action: 'filter_items',
      value: resultCount,
      properties: {
        filters,
        resultCount,
        adapterType: this.adapterType,
      },
    };

    this.logEvent(
      'inventory',
      'filter_applied',
      `Filter applied, returned ${resultCount} results`,
      'info',
      event.properties
    );
    this.trackUserAction('filter_items', 'inventory', {
      filters,
      resultCount,
    });
    this.trackAnalyticsEvent('inventory_filter', event.properties as any);
  }

  /**
   * Track item duplication
   */
  trackItemDuplicated(originalItemId: string, newItemId: string): void {
    const event: AnalyticsEvent = {
      eventType: 'inventory_item_duplicated',
      category: 'inventory',
      action: 'duplicate_item',
      properties: {
        originalItemId,
        newItemId,
        adapterType: this.adapterType,
      },
    };

    this.logEvent(
      'inventory',
      'item_duplicated',
      `Item duplicated: ${originalItemId} -> ${newItemId}`,
      'info',
      event.properties
    );
    this.trackUserAction('duplicate_item', 'inventory', {
      originalItemId,
      newItemId,
    });
    this.trackAnalyticsEvent('inventory_item_duplicated', event.properties as any);
  }

  /**
   * Track item archival
   */
  trackItemArchived(itemId: string, reason?: string): void {
    const event: AnalyticsEvent = {
      eventType: 'inventory_item_archived',
      category: 'inventory',
      action: 'archive_item',
      properties: {
        itemId,
        reason,
        adapterType: this.adapterType,
      },
    };

    this.logEvent(
      'inventory',
      'item_archived',
      `Item archived: ${itemId}`,
      'info',
      event.properties
    );
    this.trackUserAction('archive_item', 'inventory', {
      itemId,
      reason,
    });
    this.trackAnalyticsEvent('inventory_item_archived', event.properties as any);
  }

  /**
   * Track item restoration
   */
  trackItemRestored(itemId: string): void {
    const event: AnalyticsEvent = {
      eventType: 'inventory_item_restored',
      category: 'inventory',
      action: 'restore_item',
      properties: {
        itemId,
        adapterType: this.adapterType,
      },
    };

    this.logEvent(
      'inventory',
      'item_restored',
      `Item restored: ${itemId}`,
      'info',
      event.properties
    );
    this.trackUserAction('restore_item', 'inventory', { itemId });
    this.trackAnalyticsEvent('inventory_item_restored', event.properties as any);
  }

  /**
   * Track category merge
   */
  trackCategoryMerged(
    sourceCategory: string,
    targetCategory: string,
    itemsUpdated: number
  ): void {
    const event: AnalyticsEvent = {
      eventType: 'inventory_category_merged',
      category: 'inventory',
      action: 'merge_category',
      value: itemsUpdated,
      properties: {
        sourceCategory,
        targetCategory,
        itemsUpdated,
        adapterType: this.adapterType,
      },
    };

    this.logEvent(
      'inventory',
      'category_merged',
      `Category merged: ${sourceCategory} -> ${targetCategory}`,
      'info',
      event.properties
    );
    this.trackUserAction('merge_category', 'inventory', {
      sourceCategory,
      targetCategory,
      itemsUpdated,
    });
    this.trackAnalyticsEvent('inventory_category_merged', event.properties as any);
  }

  /**
   * Track adapter initialization
   */
  trackAdapterInitialized(adapterType: string): void {
    const event: AnalyticsEvent = {
      eventType: 'inventory_adapter_initialized',
      category: 'inventory',
      action: 'initialize_adapter',
      label: adapterType,
      properties: {
        adapterType,
      },
    };

    this.logEvent(
      'inventory',
      'adapter_initialized',
      `Adapter initialized: ${adapterType}`,
      'info',
      event.properties
    );
    this.trackUserAction('initialize_adapter', 'inventory', { adapterType });
    this.trackAnalyticsEvent('inventory_adapter_initialized', event.properties as any);
  }

  /**
   * Track error events
   */
  trackError(
    operation: string,
    error: Error,
    context?: Record<string, unknown>
  ): void {
    const event: AnalyticsEvent = {
      eventType: 'inventory_error',
      category: 'inventory',
      action: 'error_occurred',
      label: operation,
      properties: {
        operation,
        errorMessage: error.message,
        errorStack: error.stack,
        adapterType: this.adapterType,
        ...context,
      },
    };

    this.logEvent(
      'inventory',
      'error_occurred',
      `Error in ${operation}: ${error.message}`,
      'error',
      event.properties
    );
    this.trackUserAction('error_occurred', 'inventory', {
      operation,
      errorMessage: error.message,
      ...context,
    });
    this.trackAnalyticsEvent('inventory_error', event.properties as any);
  }

  /**
   * Track performance metrics
   */
  trackPerformance(
    operation: string,
    duration: number,
    itemCount?: number
  ): void {
    const event: AnalyticsEvent = {
      eventType: 'inventory_performance',
      category: 'inventory',
      action: 'performance_metric',
      label: operation,
      value: duration,
      properties: {
        operation,
        duration,
        itemCount,
        adapterType: this.adapterType,
      },
    };

    this.logEvent(
      'inventory',
      'performance_metric',
      `${operation} took ${duration}ms`,
      'info',
      event.properties
    );
    this.trackUserAction('performance_metric', 'inventory', {
      operation,
      duration,
      itemCount,
    });
    this.trackAnalyticsEvent('inventory_performance', event.properties as any);
  }

  /**
   * Private method to log events
   */
  private logEvent(
    module: string,
    event: string,
    message: string,
    level: 'info' | 'warn' | 'error',
    properties?: Record<string, unknown>
  ): void {
    logEvent(module, event, message, level, properties);
  }

  /**
   * Private method to track user actions
   */
  private trackUserAction(
    action: string,
    module: string,
    properties?: Record<string, unknown>
  ): void {
    trackUserAction(action, module, properties);
  }

  /**
   * Private method to track analytics events
   */
  private trackAnalyticsEvent(
    eventName: string,
    properties?: any
  ): void {
    AnalyticsTrackingService.trackEvent(eventName, properties as any);
  }

  /**
   * Create custom analytics event
   */
  createCustomEvent(
    eventType: string,
    category: string,
    action: string,
    label?: string,
    value?: number,
    properties?: any
  ): AnalyticsEvent {
    return {
      eventType,
      category,
      action,
      label,
      value,
      properties: {
        ...properties,
        adapterType: this.adapterType,
      } as any,
    };
  }

  /**
   * Track custom event
   */
  trackCustomEvent(event: AnalyticsEvent): void {
    this.logEvent(
      event.category,
      event.action,
      event.label || event.action,
      'info',
      event.properties
    );
    this.trackUserAction(event.action, event.category, event.properties as any);
    this.trackAnalyticsEvent(event.eventType, event.properties as any);
  }
}
