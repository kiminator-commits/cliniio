/**
 * Centralized service access utilities
 * Provides consistent access patterns and prevents duplicate instances
 */

import { serviceRegistry } from './ServiceRegistry';

/**
 * Service access utilities
 */
export class ServiceAccess {
  /**
   * Get inventory service
   */
  static async getInventoryService() {
    return serviceRegistry.get('inventoryService');
  }

  /**
   * Get error handling service
   */
  static getErrorHandlingService() {
    return serviceRegistry.get('errorHandling');
  }

  /**
   * Get settings service
   */
  static getSettingsService() {
    return serviceRegistry.get('settings');
  }

  /**
   * Get performance monitor
   */
  static getPerformanceMonitor() {
    return serviceRegistry.get('performanceMonitor');
  }

  /**
   * Get usage tracking service
   */
  static getUsageTrackingService() {
    return serviceRegistry.get('usageTracking');
  }

  /**
   * Get learning progress service
   */
  static getLearningProgressService() {
    return serviceRegistry.get('learningProgress');
  }

  /**
   * Get cleaning schedule service
   */
  static getCleaningScheduleService() {
    return serviceRegistry.get('cleaningSchedule');
  }

  /**
   * Get duplicate prevention service
   */
  static getDuplicatePreventionService() {
    return serviceRegistry.get('duplicatePrevention');
  }
}

// Export convenience functions
export const getInventoryService = ServiceAccess.getInventoryService;
export const getErrorHandlingService = ServiceAccess.getErrorHandlingService;
export const getSettingsService = ServiceAccess.getSettingsService;
export const getPerformanceMonitor = ServiceAccess.getPerformanceMonitor;
export const getUsageTrackingService = ServiceAccess.getUsageTrackingService;
export const getLearningProgressService =
  ServiceAccess.getLearningProgressService;
export const getCleaningScheduleService =
  ServiceAccess.getCleaningScheduleService;
export const getDuplicatePreventionService =
  ServiceAccess.getDuplicatePreventionService;
