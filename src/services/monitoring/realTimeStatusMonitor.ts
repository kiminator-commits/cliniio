export interface ToolStatusChange {
  toolId: string;
  toolName: string;
  oldStatus: 'available' | 'unavailable' | 'in_use' | 'maintenance';
  newStatus: 'available' | 'unavailable' | 'in_use' | 'maintenance';
  timestamp: string;
  reason?: string;
}

export interface StatusChangeCallback {
  (change: ToolStatusChange): void;
}

class RealTimeStatusMonitor {
  private statusCallbacks: StatusChangeCallback[] = [];
  private toolStatuses: Map<string, string> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly MONITORING_INTERVAL = 30000; // 30 seconds - reduced frequency

  /**
   * Start monitoring tool status changes
   */
  startMonitoring(): void {
    if (this.monitoringInterval) {
      return; // Already monitoring
    }

    console.log('🔄 Starting real-time tool status monitoring...');

    this.monitoringInterval = setInterval(() => {
      this.checkToolStatuses();
    }, this.MONITORING_INTERVAL);
  }

  /**
   * Stop monitoring tool status changes
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('⏹️ Stopped real-time tool status monitoring');
    }
  }

  /**
   * Subscribe to status change events
   */
  subscribe(callback: StatusChangeCallback): () => void {
    this.statusCallbacks.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.statusCallbacks.indexOf(callback);
      if (index > -1) {
        this.statusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Simulate tool status changes (for demo purposes)
   * In a real implementation, this would connect to your inventory system
   */
  private checkToolStatuses(): void {
    // Simulate random status changes for demo
    const tools = Array.from(this.toolStatuses.keys());

    if (tools.length === 0) {
      // Initialize with some demo tools
      const demoTools = [
        { id: 'demo-tool-1', name: 'Surgical Scissors', status: 'available' },
        { id: 'demo-tool-2', name: 'Forceps', status: 'in_use' },
        { id: 'demo-tool-3', name: 'Scalpel', status: 'unavailable' },
      ];

      demoTools.forEach((tool) => {
        this.toolStatuses.set(tool.id, tool.status);
      });
      return;
    }

    // Randomly change status of some tools (5% chance per tool - reduced frequency)
    tools.forEach((toolId) => {
      if (Math.random() < 0.05) {
        // 5% chance - reduced from 10%
        const currentStatus = this.toolStatuses.get(toolId);
        const newStatus = this.getRandomStatus(currentStatus);

        if (newStatus !== currentStatus) {
          this.handleStatusChange(toolId, currentStatus!, newStatus);
        }
      }
    });
  }

  /**
   * Get a random status different from current
   */
  private getRandomStatus(currentStatus: string): string {
    const statuses = ['available', 'unavailable', 'in_use', 'maintenance'];
    const otherStatuses = statuses.filter((s) => s !== currentStatus);
    return otherStatuses[Math.floor(Math.random() * otherStatuses.length)];
  }

  /**
   * Handle a tool status change
   */
  private handleStatusChange(
    toolId: string,
    oldStatus: string,
    newStatus: string
  ): void {
    this.toolStatuses.set(toolId, newStatus);

    const change: ToolStatusChange = {
      toolId,
      toolName: `Tool ${toolId.slice(0, 8)}...`, // Simplified for demo
      oldStatus: oldStatus as 'available' | 'unavailable' | 'in_use' | 'maintenance',
      newStatus: newStatus as 'available' | 'unavailable' | 'in_use' | 'maintenance',
      timestamp: new Date().toISOString(),
      reason: this.getStatusChangeReason(oldStatus, newStatus),
    };

    // Only log significant status changes to reduce console noise
    if (
      oldStatus === 'unavailable' ||
      newStatus === 'unavailable' ||
      oldStatus === 'maintenance' ||
      newStatus === 'maintenance'
    ) {
      console.log('📊 Tool status changed:', change);
    }

    // Notify all subscribers
    this.statusCallbacks.forEach((callback) => {
      try {
        callback(change);
      } catch (error) {
        console.error('Error in status change callback:', error);
      }
    });
  }

  /**
   * Get a human-readable reason for status change
   */
  private getStatusChangeReason(oldStatus: string, newStatus: string): string {
    const reasons: Record<string, Record<string, string>> = {
      available: {
        in_use: 'Tool was checked out',
        unavailable: 'Tool was removed from inventory',
        maintenance: 'Tool sent for maintenance',
      },
      in_use: {
        available: 'Tool was returned',
        unavailable: 'Tool was damaged during use',
        maintenance: 'Tool requires maintenance after use',
      },
      unavailable: {
        available: 'Tool was repaired and returned',
        in_use: 'Tool was checked out despite being unavailable',
        maintenance: 'Tool sent for repair',
      },
      maintenance: {
        available: 'Maintenance completed successfully',
        unavailable: 'Tool requires replacement after maintenance',
        in_use: 'Tool checked out after maintenance',
      },
    };

    return reasons[oldStatus]?.[newStatus] || 'Status changed';
  }

  /**
   * Manually trigger a status change (for testing)
   */
  triggerStatusChange(
    toolId: string,
    newStatus: 'available' | 'unavailable' | 'in_use' | 'maintenance',
    toolName?: string
  ): void {
    const oldStatus = this.toolStatuses.get(toolId) || 'available';

    const change: ToolStatusChange = {
      toolId,
      toolName: toolName || `Tool ${toolId.slice(0, 8)}...`,
      oldStatus: oldStatus as 'available' | 'unavailable' | 'in_use' | 'maintenance',
      newStatus,
      timestamp: new Date().toISOString(),
      reason: this.getStatusChangeReason(oldStatus, newStatus),
    };

    this.toolStatuses.set(toolId, newStatus);

    // Notify all subscribers
    this.statusCallbacks.forEach((callback) => {
      try {
        callback(change);
      } catch (error) {
        console.error('Error in status change callback:', error);
      }
    });
  }

  /**
   * Get current status of a tool
   */
  getToolStatus(toolId: string): string | undefined {
    return this.toolStatuses.get(toolId);
  }

  /**
   * Get all tool statuses
   */
  getAllToolStatuses(): Map<string, string> {
    return new Map(this.toolStatuses);
  }

  /**
   * Check if monitoring is active
   */
  isMonitoring(): boolean {
    return this.monitoringInterval !== null;
  }
}

export const realTimeStatusMonitor = new RealTimeStatusMonitor();
