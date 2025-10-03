import { Checklist } from './ChecklistDataProvider';

export interface InventoryRequirement {
  id: string;
  name: string;
  required: number;
  available: number;
  used: number;
  unit?: string;
}

export interface InventoryUsage {
  checklistId: string;
  itemId: string;
  inventoryId: string;
  quantityUsed: number;
  timestamp: Date;
  userId?: string;
}

export interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'overuse' | 'expired';
  inventoryId: string;
  inventoryName: string;
  currentStock: number;
  requiredStock: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  checklistId?: string;
  itemId?: string;
  createdAt: Date;
}

export class ChecklistInventoryProvider {
  /**
   * Add inventory requirement to checklist item
   */
  addInventoryRequirement(
    checklists: Checklist[],
    checklistId: string,
    itemId: string,
    requirement: Omit<InventoryRequirement, 'used'>
  ): Checklist[] {
    return checklists.map((checklist) =>
      checklist.id === checklistId
        ? {
            ...checklist,
            items: checklist.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    requiredInventory: [
                      ...(item.requiredInventory || []),
                      { ...requirement, used: 0 },
                    ],
                  }
                : item
            ),
            updatedAt: new Date().toISOString(),
          }
        : checklist
    );
  }

  /**
   * Update inventory requirement
   */
  updateInventoryRequirement(
    checklists: Checklist[],
    checklistId: string,
    itemId: string,
    inventoryId: string,
    updates: Partial<InventoryRequirement>
  ): Checklist[] {
    return checklists.map((checklist) =>
      checklist.id === checklistId
        ? {
            ...checklist,
            items: checklist.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    requiredInventory: item.requiredInventory?.map((inv) =>
                      inv.id === inventoryId ? { ...inv, ...updates } : inv
                    ),
                  }
                : item
            ),
            updatedAt: new Date().toISOString(),
          }
        : checklist
    );
  }

  /**
   * Remove inventory requirement
   */
  removeInventoryRequirement(
    checklists: Checklist[],
    checklistId: string,
    itemId: string,
    inventoryId: string
  ): Checklist[] {
    return checklists.map((checklist) =>
      checklist.id === checklistId
        ? {
            ...checklist,
            items: checklist.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    requiredInventory: item.requiredInventory?.filter(
                      (inv) => inv.id !== inventoryId
                    ),
                  }
                : item
            ),
            updatedAt: new Date().toISOString(),
          }
        : checklist
    );
  }

  /**
   * Record inventory usage
   */
  recordInventoryUsage(
    checklists: Checklist[],
    checklistId: string,
    itemId: string,
    inventoryId: string,
    quantityUsed: number,
    userId?: string
  ): { checklists: Checklist[]; usage: InventoryUsage } {
    const usage: InventoryUsage = {
      checklistId,
      itemId,
      inventoryId,
      quantityUsed,
      timestamp: new Date(),
      userId,
    };

    const updatedChecklists = checklists.map((checklist) =>
      checklist.id === checklistId
        ? {
            ...checklist,
            items: checklist.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    requiredInventory: item.requiredInventory?.map((inv) =>
                      inv.id === inventoryId
                        ? { ...inv, used: inv.used + quantityUsed }
                        : inv
                    ),
                  }
                : item
            ),
            updatedAt: new Date().toISOString(),
          }
        : checklist
    );

    return { checklists: updatedChecklists, usage };
  }

  /**
   * Get inventory requirements for checklist
   */
  getInventoryRequirements(checklist: Checklist): InventoryRequirement[] {
    const requirements: InventoryRequirement[] = [];

    checklist.items.forEach((item) => {
      if (item.requiredInventory) {
        requirements.push(...item.requiredInventory);
      }
    });

    return requirements;
  }

  /**
   * Get inventory requirements for all checklists
   */
  getAllInventoryRequirements(checklists: Checklist[]): InventoryRequirement[] {
    const allRequirements: InventoryRequirement[] = [];

    checklists.forEach((checklist) => {
      const requirements = this.getInventoryRequirements(checklist);
      allRequirements.push(...requirements);
    });

    return allRequirements;
  }

  /**
   * Get inventory usage summary
   */
  getInventoryUsageSummary(checklists: Checklist[]): Record<string, {
    totalRequired: number;
    totalUsed: number;
    totalAvailable: number;
    remaining: number;
    usageRate: number;
  }> {
    const summary: Record<string, {
      totalRequired: number;
      totalUsed: number;
      totalAvailable: number;
      remaining: number;
      usageRate: number;
    }> = {};

    checklists.forEach((checklist) => {
      checklist.items.forEach((item) => {
        if (item.requiredInventory) {
          item.requiredInventory.forEach((inv) => {
            if (!summary[inv.id]) {
              summary[inv.id] = {
                totalRequired: 0,
                totalUsed: 0,
                totalAvailable: inv.available,
                remaining: inv.available,
                usageRate: 0,
              };
            }

            summary[inv.id].totalRequired += inv.required;
            summary[inv.id].totalUsed += inv.used;
            summary[inv.id].remaining = summary[inv.id].totalAvailable - summary[inv.id].totalUsed;
            summary[inv.id].usageRate = summary[inv.id].totalAvailable > 0 
              ? (summary[inv.id].totalUsed / summary[inv.id].totalAvailable) * 100 
              : 0;
          });
        }
      });
    });

    return summary;
  }

  /**
   * Check inventory availability
   */
  checkInventoryAvailability(
    checklists: Checklist[],
    checklistId: string,
    itemId: string
  ): {
    available: boolean;
    missingItems: Array<{
      inventoryId: string;
      inventoryName: string;
      required: number;
      available: number;
      shortfall: number;
    }>;
  } {
    const checklist = checklists.find((c) => c.id === checklistId);
    if (!checklist) {
      return { available: false, missingItems: [] };
    }

    const item = checklist.items.find((i) => i.id === itemId);
    if (!item || !item.requiredInventory) {
      return { available: true, missingItems: [] };
    }

    const missingItems: Array<{
      inventoryId: string;
      inventoryName: string;
      required: number;
      available: number;
      shortfall: number;
    }> = [];

    item.requiredInventory.forEach((inv) => {
      if (inv.available < inv.required) {
        missingItems.push({
          inventoryId: inv.id,
          inventoryName: inv.name,
          required: inv.required,
          available: inv.available,
          shortfall: inv.required - inv.available,
        });
      }
    });

    return {
      available: missingItems.length === 0,
      missingItems,
    };
  }

  /**
   * Generate inventory alerts
   */
  generateInventoryAlerts(checklists: Checklist[]): InventoryAlert[] {
    const alerts: InventoryAlert[] = [];
    const usageSummary = this.getInventoryUsageSummary(checklists);

    Object.entries(usageSummary).forEach(([inventoryId, summary]) => {
      // Low stock alert
      if (summary.remaining < summary.totalRequired * 0.2) {
        alerts.push({
          id: this.generateAlertId(),
          type: 'low_stock',
          inventoryId,
          inventoryName: this.getInventoryName(inventoryId, checklists),
          currentStock: summary.remaining,
          requiredStock: summary.totalRequired,
          severity: summary.remaining === 0 ? 'critical' : 'high',
          message: `Low stock alert: ${this.getInventoryName(inventoryId, checklists)} has ${summary.remaining} units remaining`,
          createdAt: new Date(),
        });
      }

      // Out of stock alert
      if (summary.remaining <= 0) {
        alerts.push({
          id: this.generateAlertId(),
          type: 'out_of_stock',
          inventoryId,
          inventoryName: this.getInventoryName(inventoryId, checklists),
          currentStock: summary.remaining,
          requiredStock: summary.totalRequired,
          severity: 'critical',
          message: `Out of stock: ${this.getInventoryName(inventoryId, checklists)} is completely depleted`,
          createdAt: new Date(),
        });
      }

      // Overuse alert
      if (summary.usageRate > 90) {
        alerts.push({
          id: this.generateAlertId(),
          type: 'overuse',
          inventoryId,
          inventoryName: this.getInventoryName(inventoryId, checklists),
          currentStock: summary.remaining,
          requiredStock: summary.totalRequired,
          severity: 'medium',
          message: `High usage rate: ${this.getInventoryName(inventoryId, checklists)} usage is at ${summary.usageRate.toFixed(1)}%`,
          createdAt: new Date(),
        });
      }
    });

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Get inventory statistics
   */
  getInventoryStatistics(checklists: Checklist[]): {
    totalInventoryItems: number;
    totalRequired: number;
    totalUsed: number;
    totalAvailable: number;
    averageUsageRate: number;
    lowStockItems: number;
    outOfStockItems: number;
    mostUsedItems: Array<{
      inventoryId: string;
      inventoryName: string;
      usageRate: number;
    }>;
  } {
    const usageSummary = this.getInventoryUsageSummary(checklists);
    const inventoryItems = Object.keys(usageSummary);
    const totalInventoryItems = inventoryItems.length;

    let totalRequired = 0;
    let totalUsed = 0;
    let totalAvailable = 0;
    let lowStockItems = 0;
    let outOfStockItems = 0;

    inventoryItems.forEach((inventoryId) => {
      const summary = usageSummary[inventoryId];
      totalRequired += summary.totalRequired;
      totalUsed += summary.totalUsed;
      totalAvailable += summary.totalAvailable;

      if (summary.remaining < summary.totalRequired * 0.2) {
        lowStockItems++;
      }
      if (summary.remaining <= 0) {
        outOfStockItems++;
      }
    });

    const averageUsageRate = totalAvailable > 0 ? (totalUsed / totalAvailable) * 100 : 0;

    const mostUsedItems = inventoryItems
      .map((inventoryId) => ({
        inventoryId,
        inventoryName: this.getInventoryName(inventoryId, checklists),
        usageRate: usageSummary[inventoryId].usageRate,
      }))
      .sort((a, b) => b.usageRate - a.usageRate)
      .slice(0, 5);

    return {
      totalInventoryItems,
      totalRequired,
      totalUsed,
      totalAvailable,
      averageUsageRate,
      lowStockItems,
      outOfStockItems,
      mostUsedItems,
    };
  }

  /**
   * Validate inventory requirement
   */
  validateInventoryRequirement(requirement: Partial<InventoryRequirement>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!requirement.id || requirement.id.trim() === '') {
      errors.push('Inventory ID is required');
    }

    if (!requirement.name || requirement.name.trim() === '') {
      errors.push('Inventory name is required');
    }

    if (requirement.required !== undefined && requirement.required <= 0) {
      errors.push('Required quantity must be greater than 0');
    }

    if (requirement.available !== undefined && requirement.available < 0) {
      errors.push('Available quantity cannot be negative');
    }

    if (requirement.used !== undefined && requirement.used < 0) {
      errors.push('Used quantity cannot be negative');
    }

    if (
      requirement.used !== undefined &&
      requirement.available !== undefined &&
      requirement.used > requirement.available
    ) {
      errors.push('Used quantity cannot exceed available quantity');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get inventory name by ID
   */
  private getInventoryName(inventoryId: string, checklists: Checklist[]): string {
    for (const checklist of checklists) {
      for (const item of checklist.items) {
        if (item.requiredInventory) {
          const inventory = item.requiredInventory.find((inv) => inv.id === inventoryId);
          if (inventory) return inventory.name;
        }
      }
    }
    return 'Unknown Inventory';
  }

  /**
   * Generate alert ID
   */
  private generateAlertId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Export inventory data
   */
  exportInventoryData(checklists: Checklist[]): string {
    const inventoryData = {
      requirements: this.getAllInventoryRequirements(checklists),
      usageSummary: this.getInventoryUsageSummary(checklists),
      statistics: this.getInventoryStatistics(checklists),
      alerts: this.generateInventoryAlerts(checklists),
    };

    return JSON.stringify(inventoryData, null, 2);
  }

  /**
   * Import inventory data
   */
  importInventoryData(
    jsonData: string,
    checklists: Checklist[]
  ): {
    success: boolean;
    updatedChecklists: Checklist[];
    errors: string[];
  } {
    try {
      const inventoryData = JSON.parse(jsonData);
      const errors: string[] = [];
      const updatedChecklists = [...checklists];

      if (inventoryData.requirements && Array.isArray(inventoryData.requirements)) {
        inventoryData.requirements.forEach((requirement: InventoryRequirement, index: number) => {
          const validation = this.validateInventoryRequirement(requirement);
          if (!validation.isValid) {
            errors.push(`Requirement ${index + 1}: ${validation.errors.join(', ')}`);
          }
        });
      }

      return {
        success: errors.length === 0,
        updatedChecklists,
        errors,
      };
    } catch {
      return {
        success: false,
        updatedChecklists: checklists,
        errors: ['Invalid JSON format'],
      };
    }
  }
}
