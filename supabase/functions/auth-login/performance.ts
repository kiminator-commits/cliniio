// Performance optimization utilities for authentication system
interface PerformanceMetrics {
  requestId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  operation: string;
  success: boolean;
  error?: string;
  metadata?: any;
}

interface CacheConfig {
  enabled: boolean;
  ttlSeconds: number;
  maxSize: number;
  cleanupIntervalMs: number;
}

class PerformanceOptimizer {
  private metrics: PerformanceMetrics[] = [];
  private cache = new Map<string, { value: any; expires: number }>();
  private config: CacheConfig;
  private cleanupInterval: number | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      enabled: config.enabled || true,
      ttlSeconds: config.ttlSeconds || 300, // 5 minutes
      maxSize: config.maxSize || 1000,
      cleanupIntervalMs: config.cleanupIntervalMs || 60000, // 1 minute
    };

    if (this.config.enabled) {
      this.startCleanup();
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredCache();
    }, this.config.cleanupIntervalMs);
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expires < now) {
        this.cache.delete(key);
      }
    }
  }

  startOperation(requestId: string, operation: string): PerformanceMetrics {
    const metric: PerformanceMetrics = {
      requestId,
      startTime: Date.now(),
      operation,
      success: false,
    };

    this.metrics.push(metric);
    return metric;
  }

  endOperation(requestId: string, success: boolean, error?: string, metadata?: any): void {
    const metric = this.metrics.find(m => m.requestId === requestId);
    if (!metric) return;

    metric.endTime = Date.now();
    metric.duration = metric.endTime - metric.startTime;
    metric.success = success;
    metric.error = error;
    metric.metadata = metadata;
  }

  async withCache<T>(
    key: string,
    operation: () => Promise<T>,
    ttlSeconds?: number
  ): Promise<T> {
    if (!this.config.enabled) {
      return await operation();
    }

    // Check cache first
    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.value;
    }

    // Execute operation
    const result = await operation();

    // Cache the result
    const expires = Date.now() + ((ttlSeconds || this.config.ttlSeconds) * 1000);
    this.cache.set(key, { value: result, expires });

    // Cleanup if cache is too large
    if (this.cache.size > this.config.maxSize) {
      this.cleanupExpiredCache();
    }

    return result;
  }

  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError;
  }

  async withTimeout<T>(
    operation: Promise<T>,
    timeoutMs: number = 5000
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs);
    });

    return Promise.race([operation, timeoutPromise]);
  }

  async batchOperations<T, R>(
    items: T[],
    operation: (item: T) => Promise<R>,
    batchSize: number = 10,
    delayMs: number = 100
  ): Promise<R[]> {
    const results: R[] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchPromises = batch.map(item => operation(item));
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.error('Batch operation failed:', result.reason);
        }
      }

      // Add delay between batches to prevent overwhelming the system
      if (i + batchSize < items.length && delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }

    return results;
  }

  getMetrics(timeRangeMinutes: number = 60): {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    averageDuration: number;
    operationsByType: Record<string, number>;
    slowestOperations: PerformanceMetrics[];
    errorRate: number;
  } {
    const cutoff = Date.now() - (timeRangeMinutes * 60 * 1000);
    const recentMetrics = this.metrics.filter(m => m.startTime >= cutoff);

    const totalOperations = recentMetrics.length;
    const successfulOperations = recentMetrics.filter(m => m.success).length;
    const failedOperations = totalOperations - successfulOperations;
    
    const totalDuration = recentMetrics
      .filter(m => m.duration)
      .reduce((sum, m) => sum + (m.duration || 0), 0);
    const averageDuration = totalDuration / totalOperations || 0;

    const operationsByType: Record<string, number> = {};
    recentMetrics.forEach(m => {
      operationsByType[m.operation] = (operationsByType[m.operation] || 0) + 1;
    });

    const slowestOperations = recentMetrics
      .filter(m => m.duration)
      .sort((a, b) => (b.duration || 0) - (a.duration || 0))
      .slice(0, 10);

    const errorRate = totalOperations > 0 ? failedOperations / totalOperations : 0;

    return {
      totalOperations,
      successfulOperations,
      failedOperations,
      averageDuration,
      operationsByType,
      slowestOperations,
      errorRate,
    };
  }

  getCacheStats(): {
    size: number;
    hitRate: number;
    maxSize: number;
    enabled: boolean;
  } {
    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses
      maxSize: this.config.maxSize,
      enabled: this.config.enabled,
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
    this.metrics = [];
  }
}

// Database connection pooling and optimization
class DatabaseOptimizer {
  private connectionPool: any[] = [];
  private maxConnections: number;
  private activeConnections: number = 0;

  constructor(maxConnections: number = 10) {
    this.maxConnections = maxConnections;
  }

  async getConnection(): Promise<any> {
    if (this.connectionPool.length > 0) {
      return this.connectionPool.pop();
    }

    if (this.activeConnections < this.maxConnections) {
      this.activeConnections++;
      // Create new connection
      return this.createConnection();
    }

    // Wait for available connection
    return new Promise((resolve) => {
      const checkForConnection = () => {
        if (this.connectionPool.length > 0) {
          resolve(this.connectionPool.pop());
        } else {
          setTimeout(checkForConnection, 100);
        }
      };
      checkForConnection();
    });
  }

  private async createConnection(): Promise<any> {
    // This would create a new database connection
    // For Supabase, this would be a new client instance
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    
    return createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
  }

  releaseConnection(connection: any): void {
    if (this.connectionPool.length < this.maxConnections) {
      this.connectionPool.push(connection);
    } else {
      this.activeConnections--;
    }
  }

  async withConnection<T>(operation: (connection: any) => Promise<T>): Promise<T> {
    const connection = await this.getConnection();
    try {
      return await operation(connection);
    } finally {
      this.releaseConnection(connection);
    }
  }
}

// Export singleton instances
let performanceOptimizer: PerformanceOptimizer | null = null;
let databaseOptimizer: DatabaseOptimizer | null = null;

export function getPerformanceOptimizer(): PerformanceOptimizer {
  if (!performanceOptimizer) {
    performanceOptimizer = new PerformanceOptimizer({
      enabled: Deno.env.get('ENABLE_PERFORMANCE_CACHE') === 'true',
      ttlSeconds: parseInt(Deno.env.get('CACHE_TTL_SECONDS') || '300'),
      maxSize: parseInt(Deno.env.get('CACHE_MAX_SIZE') || '1000'),
    });
  }
  return performanceOptimizer;
}

export function getDatabaseOptimizer(): DatabaseOptimizer {
  if (!databaseOptimizer) {
    databaseOptimizer = new DatabaseOptimizer(
      parseInt(Deno.env.get('MAX_DB_CONNECTIONS') || '10')
    );
  }
  return databaseOptimizer;
}

export { PerformanceOptimizer, DatabaseOptimizer, type PerformanceMetrics };
