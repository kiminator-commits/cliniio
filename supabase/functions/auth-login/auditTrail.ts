// Immutable audit trail with cryptographic signatures
import {
  createHash,
  createHmac,
  randomBytes,
} from 'https://deno.land/std@0.168.0/crypto/mod.ts';

interface AuditEvent {
  id: string;
  timestamp: number;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actor: string; // user ID, system, or service
  action: string;
  resource: string;
  outcome: 'success' | 'failure' | 'error';
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  previousHash?: string;
  hash: string;
  signature: string;
  chainIndex: number;
}

interface AuditChain {
  events: AuditEvent[];
  totalEvents: number;
  lastHash: string;
  chainIntegrity: boolean;
  createdAt: number;
  lastUpdated: number;
}

interface AuditConfig {
  enableSignatures: boolean;
  enableChaining: boolean;
  retentionDays: number;
  maxEventsPerChain: number;
  signatureKey: string;
  hashAlgorithm: 'sha256' | 'sha512';
  compressionEnabled: boolean;
}

class ImmutableAuditTrail {
  private config: AuditConfig;
  private chains: Map<string, AuditChain> = new Map();
  private currentChain: AuditChain | null = null;
  private eventCounter = 0;

  constructor(config: Partial<AuditConfig> = {}) {
    this.config = {
      enableSignatures: config.enableSignatures || true,
      enableChaining: config.enableChaining || true,
      retentionDays: config.retentionDays || 2555, // 7 years
      maxEventsPerChain: config.maxEventsPerChain || 10000,
      signatureKey:
        config.signatureKey ||
        Deno.env.get('AUDIT_SIGNATURE_KEY') ||
        'default-key-change-in-production',
      hashAlgorithm: config.hashAlgorithm || 'sha256',
      compressionEnabled: config.compressionEnabled || false,
    };

    this.initializeChain();
  }

  private initializeChain(): void {
    const chainId = this.generateChainId();
    this.currentChain = {
      events: [],
      totalEvents: 0,
      lastHash: '',
      chainIntegrity: true,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };
    this.chains.set(chainId, this.currentChain);
  }

  private generateChainId(): string {
    const timestamp = Date.now();
    const random = randomBytes(16);
    return `chain_${timestamp}_${random.toString('hex')}`;
  }

  private generateEventId(): string {
    return `event_${Date.now()}_${++this.eventCounter}`;
  }

  private calculateHash(data: string): string {
    const hash = createHash(this.config.hashAlgorithm);
    hash.update(data);
    return hash.toString('hex');
  }

  private generateSignature(data: string): string {
    if (!this.config.enableSignatures) {
      return '';
    }

    const hmac = createHmac(
      this.config.hashAlgorithm,
      this.config.signatureKey
    );
    hmac.update(data);
    return hmac.toString('hex');
  }

  private createEventHash(
    event: Omit<AuditEvent, 'hash' | 'signature' | 'chainIndex'>
  ): string {
    const eventData = {
      id: event.id,
      timestamp: event.timestamp,
      eventType: event.eventType,
      severity: event.severity,
      actor: event.actor,
      action: event.action,
      resource: event.resource,
      outcome: event.outcome,
      details: event.details,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      sessionId: event.sessionId,
      previousHash: event.previousHash,
    };

    const dataString = JSON.stringify(eventData, Object.keys(eventData).sort());
    return this.calculateHash(dataString);
  }

  private createChainHash(event: AuditEvent, previousHash: string): string {
    const chainData = {
      eventHash: event.hash,
      previousHash,
      timestamp: event.timestamp,
      chainIndex: event.chainIndex,
    };

    const dataString = JSON.stringify(chainData);
    return this.calculateHash(dataString);
  }

  async recordEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    actor: string,
    action: string,
    resource: string,
    outcome: 'success' | 'failure' | 'error',
    details: Record<string, any> = {},
    metadata: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
    } = {}
  ): Promise<string> {
    if (!this.currentChain) {
      this.initializeChain();
    }

    const eventId = this.generateEventId();
    const timestamp = Date.now();
    const previousHash = this.currentChain.lastHash;

    const event: Omit<AuditEvent, 'hash' | 'signature' | 'chainIndex'> = {
      id: eventId,
      timestamp,
      eventType,
      severity,
      actor,
      action,
      resource,
      outcome,
      details,
      ipAddress: metadata.ipAddress,
      userAgent: metadata.userAgent,
      sessionId: metadata.sessionId,
      previousHash,
    };

    // Calculate event hash
    const eventHash = this.createEventHash(event);

    // Create complete event with hash and signature
    const completeEvent: AuditEvent = {
      ...event,
      hash: eventHash,
      signature: this.generateSignature(eventHash),
      chainIndex: this.currentChain.totalEvents,
    };

    // Create chain hash
    const chainHash = this.createChainHash(completeEvent, previousHash);

    // Add to current chain
    this.currentChain.events.push(completeEvent);
    this.currentChain.totalEvents++;
    this.currentChain.lastHash = chainHash;
    this.currentChain.lastUpdated = timestamp;

    // Check if chain needs to be rotated
    if (this.currentChain.totalEvents >= this.config.maxEventsPerChain) {
      await this.rotateChain();
    }

    // Store in database (in production)
    await this.persistEvent(completeEvent);

    console.log(`Audit event recorded: ${eventId} (${eventType})`);
    return eventId;
  }

  private async rotateChain(): Promise<void> {
    if (!this.currentChain) return;

    // Finalize current chain
    this.currentChain.chainIntegrity = await this.verifyChainIntegrity(
      this.currentChain
    );

    // Create new chain
    this.initializeChain();

    console.log(
      `Audit chain rotated. Previous chain had ${this.currentChain.totalEvents} events`
    );
  }

  async verifyChainIntegrity(chain: AuditChain): Promise<boolean> {
    if (chain.events.length === 0) return true;

    let previousHash = '';

    for (let i = 0; i < chain.events.length; i++) {
      const event = chain.events[i];

      // Verify event hash
      const expectedEventHash = this.createEventHash({
        id: event.id,
        timestamp: event.timestamp,
        eventType: event.eventType,
        severity: event.severity,
        actor: event.actor,
        action: event.action,
        resource: event.resource,
        outcome: event.outcome,
        details: event.details,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        sessionId: event.sessionId,
        previousHash: event.previousHash,
      });

      if (event.hash !== expectedEventHash) {
        console.error(`Event hash mismatch at index ${i}: ${event.id}`);
        return false;
      }

      // Verify signature
      if (this.config.enableSignatures) {
        const expectedSignature = this.generateSignature(event.hash);
        if (event.signature !== expectedSignature) {
          console.error(`Event signature mismatch at index ${i}: ${event.id}`);
          return false;
        }
      }

      // Verify chain hash
      const expectedChainHash = this.createChainHash(event, previousHash);
      if (i === chain.events.length - 1) {
        if (chain.lastHash !== expectedChainHash) {
          console.error(`Chain hash mismatch at index ${i}: ${event.id}`);
          return false;
        }
      }

      previousHash = expectedChainHash;
    }

    return true;
  }

  async verifyAllChains(): Promise<{
    totalChains: number;
    validChains: number;
    invalidChains: string[];
    totalEvents: number;
  }> {
    const result = {
      totalChains: this.chains.size,
      validChains: 0,
      invalidChains: [] as string[],
      totalEvents: 0,
    };

    for (const [chainId, chain] of this.chains) {
      const isValid = await this.verifyChainIntegrity(chain);
      if (isValid) {
        result.validChains++;
      } else {
        result.invalidChains.push(chainId);
      }
      result.totalEvents += chain.totalEvents;
    }

    return result;
  }

  async queryEvents(
    filters: {
      eventType?: string;
      severity?: string;
      actor?: string;
      resource?: string;
      outcome?: string;
      startTime?: number;
      endTime?: number;
      limit?: number;
    } = {}
  ): Promise<AuditEvent[]> {
    const results: AuditEvent[] = [];

    for (const chain of this.chains.values()) {
      for (const event of chain.events) {
        // Apply filters
        if (filters.eventType && event.eventType !== filters.eventType)
          continue;
        if (filters.severity && event.severity !== filters.severity) continue;
        if (filters.actor && event.actor !== filters.actor) continue;
        if (filters.resource && event.resource !== filters.resource) continue;
        if (filters.outcome && event.outcome !== filters.outcome) continue;
        if (filters.startTime && event.timestamp < filters.startTime) continue;
        if (filters.endTime && event.timestamp > filters.endTime) continue;

        results.push(event);

        if (filters.limit && results.length >= filters.limit) {
          break;
        }
      }

      if (filters.limit && results.length >= filters.limit) {
        break;
      }
    }

    // Sort by timestamp (newest first)
    return results.sort((a, b) => b.timestamp - a.timestamp);
  }

  async getEventById(eventId: string): Promise<AuditEvent | null> {
    for (const chain of this.chains.values()) {
      const event = chain.events.find((e) => e.id === eventId);
      if (event) return event;
    }
    return null;
  }

  async getEventChain(eventId: string): Promise<AuditEvent[]> {
    for (const chain of this.chains.values()) {
      const eventIndex = chain.events.findIndex((e) => e.id === eventId);
      if (eventIndex !== -1) {
        return chain.events.slice(0, eventIndex + 1);
      }
    }
    return [];
  }

  async cleanupOldEvents(): Promise<number> {
    const cutoffTime =
      Date.now() - this.config.retentionDays * 24 * 60 * 60 * 1000;
    let removedEvents = 0;

    for (const [chainId, chain] of this.chains) {
      const oldEvents = chain.events.filter((e) => e.timestamp < cutoffTime);
      const newEvents = chain.events.filter((e) => e.timestamp >= cutoffTime);

      if (oldEvents.length > 0) {
        chain.events = newEvents;
        chain.totalEvents = newEvents.length;
        removedEvents += oldEvents.length;

        // If chain is empty, remove it
        if (chain.events.length === 0) {
          this.chains.delete(chainId);
        }
      }
    }

    console.log(`Cleaned up ${removedEvents} old audit events`);
    return removedEvents;
  }

  async exportEvents(format: 'json' | 'csv' = 'json'): Promise<string> {
    const allEvents: AuditEvent[] = [];

    for (const chain of this.chains.values()) {
      allEvents.push(...chain.events);
    }

    allEvents.sort((a, b) => a.timestamp - b.timestamp);

    if (format === 'csv') {
      const headers = [
        'id',
        'timestamp',
        'eventType',
        'severity',
        'actor',
        'action',
        'resource',
        'outcome',
        'ipAddress',
        'userAgent',
        'sessionId',
        'hash',
      ];

      const csvRows = [headers.join(',')];

      for (const event of allEvents) {
        const row = headers.map((header) => {
          const value = event[header as keyof AuditEvent];
          return typeof value === 'string'
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        });
        csvRows.push(row.join(','));
      }

      return csvRows.join('\n');
    }

    return JSON.stringify(allEvents, null, 2);
  }

  private async persistEvent(event: AuditEvent): Promise<void> {
    // In production, this would save to a secure database
    // For now, we'll just log it
    console.log(`Persisting audit event: ${event.id}`);
  }

  getStatistics(): {
    totalChains: number;
    totalEvents: number;
    eventsBySeverity: Record<string, number>;
    eventsByType: Record<string, number>;
    oldestEvent: number;
    newestEvent: number;
    chainIntegrity: boolean;
  } {
    const stats = {
      totalChains: this.chains.size,
      totalEvents: 0,
      eventsBySeverity: {} as Record<string, number>,
      eventsByType: {} as Record<string, number>,
      oldestEvent: Date.now(),
      newestEvent: 0,
      chainIntegrity: true,
    };

    for (const chain of this.chains.values()) {
      stats.totalEvents += chain.totalEvents;
      stats.chainIntegrity = stats.chainIntegrity && chain.chainIntegrity;

      for (const event of chain.events) {
        stats.eventsBySeverity[event.severity] =
          (stats.eventsBySeverity[event.severity] || 0) + 1;
        stats.eventsByType[event.eventType] =
          (stats.eventsByType[event.eventType] || 0) + 1;

        if (event.timestamp < stats.oldestEvent) {
          stats.oldestEvent = event.timestamp;
        }
        if (event.timestamp > stats.newestEvent) {
          stats.newestEvent = event.timestamp;
        }
      }
    }

    return stats;
  }
}

// Export singleton instance
let immutableAuditTrail: ImmutableAuditTrail | null = null;

export function getImmutableAuditTrail(): ImmutableAuditTrail {
  if (!immutableAuditTrail) {
    immutableAuditTrail = new ImmutableAuditTrail({
      enableSignatures: Deno.env.get('ENABLE_AUDIT_SIGNATURES') === 'true',
      enableChaining: Deno.env.get('ENABLE_AUDIT_CHAINING') === 'true',
      retentionDays: parseInt(Deno.env.get('AUDIT_RETENTION_DAYS') || '2555'),
      maxEventsPerChain: parseInt(
        Deno.env.get('MAX_EVENTS_PER_CHAIN') || '10000'
      ),
      signatureKey:
        Deno.env.get('AUDIT_SIGNATURE_KEY') ||
        'default-key-change-in-production',
      hashAlgorithm:
        (Deno.env.get('AUDIT_HASH_ALGORITHM') as 'sha256' | 'sha512') ||
        'sha256',
    });
  }

  return immutableAuditTrail;
}

export { ImmutableAuditTrail, type AuditEvent, type AuditChain };
