/**
 * Service for handling inventory item status logic
 * Extracted from main Inventory page component
 */
import { getStatusBadge, getStatusText } from '@/utils/inventory/statusUtils';

export class StatusService {
  /**
   * Get CSS classes for status badge styling
   */
  static getStatusBadge(phase: string): string {
    return getStatusBadge(phase);
  }

  /**
   * Get display text for status
   */
  static getStatusText(phase: string): string {
    return getStatusText(phase);
  }
}
