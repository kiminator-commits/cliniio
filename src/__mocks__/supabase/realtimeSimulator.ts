// Realtime Event Simulation
import { TableName } from '../types/supabaseMockTypes';
import type { EnhancedMockConfig } from './errorSimulation';
import { generateTableData } from './dataGenerators';

/**
 * Realtime event simulator
 */
export class RealtimeEventSimulator {
  private config: EnhancedMockConfig;
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: EnhancedMockConfig) {
    this.config = config;
  }

  /**
   * Start simulating realtime events for a channel
   */
  startSimulation(channelName: string, tableName: TableName): void {
    if (!this.config.realtime?.simulateEvents) return;

    const interval = this.config.realtime.eventInterval || 5000;
    const eventTypes = this.config.realtime.eventTypes || [
      'INSERT',
      'UPDATE',
      'DELETE',
    ];

    const simulationInterval = setInterval(() => {
      const eventType = eventTypes[
        Math.floor(Math.random() * eventTypes.length)
      ] as 'INSERT' | 'UPDATE' | 'DELETE';
      this.simulateEvent(channelName, tableName, eventType);
    }, interval);

    this.intervals.set(channelName, simulationInterval);
  }

  /**
   * Stop simulating events for a channel
   */
  stopSimulation(channelName: string): void {
    const interval = this.intervals.get(channelName);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(channelName);
    }
  }

  /**
   * Stop all simulations
   */
  stopAllSimulations(): void {
    this.intervals.forEach((interval) => clearInterval(interval));
    this.intervals.clear();
  }

  /**
   * Simulate a specific event
   */
  private simulateEvent(
    channelName: string,
    tableName: TableName,
    eventType: 'INSERT' | 'UPDATE' | 'DELETE'
  ): void {
    if (this.config.enableLogging) {
      // console.log(
      //   `[MOCK] Simulating ${eventType} event for ${tableName} on channel ${channelName}`
      // );
    }

    // In a real implementation, this would trigger actual realtime callbacks
    // For now, we just log the event
    const eventData = {
      schema: 'public',
      table: tableName,
      commit_timestamp: new Date().toISOString(),
      eventType,
      new: eventType !== 'DELETE' ? generateTableData(tableName) : null,
      old: eventType !== 'INSERT' ? generateTableData(tableName) : null,
      errors: null,
    };

    if (this.config.enableLogging) {
      // console.log(`[MOCK] Event data:`, eventData);
    }
  }
}
