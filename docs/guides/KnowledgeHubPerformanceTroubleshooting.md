# Performance

## 🚀 Optimization and Best Practices

### **Request Caching**

#### **In-Memory Cache**

```typescript
class APICache {
  private cache = new Map<
    string,
    { data: any; timestamp: number; ttl: number }
  >();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cacheKey = this.normalizeKey(key);
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && now - cached.timestamp < (ttl || cached.ttl)) {
      console.log(`Cache hit: ${cacheKey}`);
      return cached.data;
    }

    console.log(`Cache miss: ${cacheKey}`);
    const data = await fetcher();

    this.cache.set(cacheKey, {
      data,
      timestamp: now,
      ttl: ttl || this.defaultTTL,
    });

    return data;
  }

  set(key: string, data: any, ttl?: number): void {
    const cacheKey = this.normalizeKey(key);
    this.cache.set(cacheKey, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    });
  }

  invalidate(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }

  private normalizeKey(key: string): string {
    return key.toLowerCase().trim();
  }
}

// Usage
const cache = new APICache();

const getCachedContent = async (category: string) => {
  return cache.get(
    `content:${category}`,
    () => api.content.getAll({ category }),
    10 * 60 * 1000 // 10 minutes TTL
  );
};
```

#### **Persistent Cache with IndexedDB**

```typescript
class PersistentCache {
  private dbName = 'cliniio-cache';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async get(key: string): Promise<any | null> {
    if (!this.db) throw new Error('Cache not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result && Date.now() - result.timestamp < result.ttl) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
    });
  }

  async set(key: string, data: any, ttl: number): Promise<void> {
    if (!this.db) throw new Error('Cache not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put({
        key,
        data,
        timestamp: Date.now(),
        ttl,
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async cleanup(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction(['cache'], 'readwrite');
    const store = transaction.objectStore('cache');
    const index = store.index('timestamp');
    const now = Date.now();

    const request = index.openCursor();
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const item = cursor.value;
        if (now - item.timestamp > item.ttl) {
          store.delete(cursor.key);
        }
        cursor.continue();
      }
    };
  }
}
```

---

## 📦 Request Batching

### **Batch API Requests**

```typescript
class RequestBatcher {
  private batchQueue: Array<{
    id: string;
    request: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchDelay = 50; // 50ms delay
  private maxBatchSize = 10;

  async add<T>(id: string, request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.batchQueue.push({ id, request, resolve, reject });

      if (this.batchQueue.length >= this.maxBatchSize) {
        this.processBatch();
      } else if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(
          () => this.processBatch(),
          this.batchDelay
        );
      }
    });
  }

  private async processBatch(): Promise<void> {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    if (this.batchQueue.length === 0) return;

    const currentBatch = [...this.batchQueue];
    this.batchQueue = [];

    try {
      // Process requests in parallel
      const results = await Promise.allSettled(
        currentBatch.map((item) => item.request())
      );

      // Resolve/reject each promise
      results.forEach((result, index) => {
        const item = currentBatch[index];
        if (result.status === 'fulfilled') {
          item.resolve(result.value);
        } else {
          item.reject(result.reason);
        }
      });
    } catch (error) {
      // If batch processing fails, reject all pending requests
      currentBatch.forEach((item) => item.reject(error));
    }
  }
}

// Usage
const batcher = new RequestBatcher();

const batchGetContent = async (ids: string[]) => {
  const promises = ids.map((id) =>
    batcher.add(`content:${id}`, () => api.content.getById(id))
  );

  return Promise.all(promises);
};
```

---

## 🔄 Optimistic Updates

### **Optimistic UI Updates**

```typescript
class OptimisticUpdater {
  private pendingUpdates = new Map<string, { data: any; timestamp: number }>();
  private rollbackQueue: Array<() => void> = [];

  async updateWithOptimism<T>(
    key: string,
    updateFn: () => Promise<T>,
    optimisticData: any,
    rollbackFn: () => void
  ): Promise<T> {
    // Store current state for rollback
    const currentData = this.getCurrentData(key);

    // Apply optimistic update immediately
    this.applyOptimisticUpdate(key, optimisticData);

    // Add rollback function to queue
    this.rollbackQueue.push(() => {
      this.applyOptimisticUpdate(key, currentData);
      rollbackFn();
    });

    try {
      // Perform actual update
      const result = await updateFn();

      // Update with real data
      this.applyOptimisticUpdate(key, result);

      // Remove from pending updates
      this.pendingUpdates.delete(key);

      return result;
    } catch (error) {
      // Rollback on error
      this.rollbackUpdate(key, currentData);
      throw error;
    }
  }

  private applyOptimisticUpdate(key: string, data: any): void {
    this.pendingUpdates.set(key, {
      data,
      timestamp: Date.now(),
    });

    // Trigger UI update
    this.notifyUpdate(key, data);
  }

  private rollbackUpdate(key: string, data: any): void {
    this.pendingUpdates.delete(key);
    this.notifyUpdate(key, data);
  }

  private getCurrentData(key: string): any {
    // Implementation to get current data from store/state
    return null;
  }

  private notifyUpdate(key: string, data: any): void {
    // Implementation to notify UI of data change
    console.log(`Data updated for ${key}:`, data);
  }

  rollbackAll(): void {
    this.rollbackQueue.forEach((rollback) => rollback());
    this.rollbackQueue = [];
    this.pendingUpdates.clear();
  }
}

// Usage example
const optimisticUpdater = new OptimisticUpdater();

const updateProgressOptimistically = async (
  courseId: string,
  newProgress: number
) => {
  const currentProgress = getCurrentProgress(courseId);

  return optimisticUpdater.updateWithOptimism(
    `progress:${courseId}`,
    () => api.content.updateProgress(courseId, { progress: newProgress }),
    { progress: newProgress },
    () => {
      // Rollback UI to previous progress
      updateProgressInUI(courseId, currentProgress);
    }
  );
};
```

---

## 🎯 Request Prioritization

### **Priority Queue for API Requests**

```typescript
interface QueuedRequest {
  id: string;
  priority: number; // Higher number = higher priority
  request: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

class PriorityRequestQueue {
  private queue: QueuedRequest[] = [];
  private processing = false;
  private maxConcurrent = 3;
  private activeRequests = 0;

  async add<T>(
    id: string,
    priority: number,
    request: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const queuedRequest: QueuedRequest = {
        id,
        priority,
        request,
        resolve,
        reject,
        timestamp: Date.now(),
      };

      this.queue.push(queuedRequest);
      this.queue.sort((a, b) => b.priority - a.priority);

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.activeRequests >= this.maxConcurrent) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const request = this.queue.shift();
      if (request) {
        this.activeRequests++;
        this.processRequest(request);
      }
    }

    this.processing = false;
  }

  private async processRequest(queuedRequest: QueuedRequest): Promise<void> {
    try {
      const result = await queuedRequest.request();
      queuedRequest.resolve(result);
    } catch (error) {
      queuedRequest.reject(error);
    } finally {
      this.activeRequests--;
      this.processQueue();
    }
  }

  getQueueStatus() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

// Usage
const priorityQueue = new PriorityRequestQueue();

// High priority: User interactions
const updateProgress = (courseId: string, progress: number) => {
  return priorityQueue.add(
    `progress:${courseId}`,
    10, // High priority
    () => api.content.updateProgress(courseId, { progress })
  );
};

// Low priority: Background sync
const syncUserData = () => {
  return priorityQueue.add(
    'sync-user-data',
    1, // Low priority
    () => api.users.syncData()
  );
};
```

---

## 📊 Performance Monitoring

### **Real-time Performance Dashboard**

```typescript
class PerformanceDashboard {
  private metrics: Array<{
    endpoint: string;
    method: string;
    duration: number;
    timestamp: number;
    status: number;
    userId?: string;
  }> = [];

  recordRequest(
    endpoint: string,
    method: string,
    duration: number,
    status: number,
    userId?: string
  ): void {
    this.metrics.push({
      endpoint,
      method,
      duration,
      timestamp: Date.now(),
      status,
      userId,
    });

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Alert on slow requests
    if (duration > 2000) {
      this.alertSlowRequest(endpoint, method, duration);
    }

    // Alert on high error rates
    this.checkErrorRate();
  }

  getPerformanceStats(timeWindow: number = 5 * 60 * 1000): any {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(
      (m) => now - m.timestamp < timeWindow
    );

    const endpointStats = recentMetrics.reduce(
      (acc, metric) => {
        if (!acc[metric.endpoint]) {
          acc[metric.endpoint] = {
            count: 0,
            totalDuration: 0,
            averageDuration: 0,
            errorCount: 0,
            successCount: 0,
          };
        }

        const stats = acc[metric.endpoint];
        stats.count++;
        stats.totalDuration += metric.duration;
        stats.averageDuration = stats.totalDuration / stats.count;

        if (metric.status >= 400) {
          stats.errorCount++;
        } else {
          stats.successCount++;
        }

        return acc;
      },
      {} as Record<string, any>
    );

    return {
      totalRequests: recentMetrics.length,
      timeWindow: `${timeWindow / 1000 / 60} minutes`,
      endpointStats,
      averageResponseTime:
        recentMetrics.reduce((sum, m) => sum + m.duration, 0) /
        recentMetrics.length,
      errorRate:
        recentMetrics.filter((m) => m.status >= 400).length /
        recentMetrics.length,
    };
  }

  private alertSlowRequest(
    endpoint: string,
    method: string,
    duration: number
  ): void {
    console.warn(
      `🚨 Slow request detected: ${method} ${endpoint} took ${duration}ms`
    );

    // Could send to monitoring service
    // this.sendToMonitoringService('slow_request', { endpoint, method, duration });
  }

  private checkErrorRate(): void {
    const recentMetrics = this.metrics.slice(-100);
    const errorRate =
      recentMetrics.filter((m) => m.status >= 400).length /
      recentMetrics.length;

    if (errorRate > 0.1) {
      // 10% error rate
      console.error(
        `🚨 High error rate detected: ${(errorRate * 100).toFixed(1)}%`
      );
    }
  }
}

// Usage
const dashboard = new PerformanceDashboard();

// Wrap fetch to automatically record metrics
const monitoredFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const startTime = Date.now();

  try {
    const response = await fetch(input, init);
    const duration = Date.now() - startTime;

    const url = typeof input === 'string' ? input : input.toString();
    dashboard.recordRequest(
      url,
      init?.method || 'GET',
      duration,
      response.status
    );

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    const url = typeof input === 'string' ? input : input.toString();
    dashboard.recordRequest(url, init?.method || 'GET', duration, 0);
    throw error;
  }
};
```

---

## 🔗 Related Documentation

- **[Common Issues](./common-issues.md)** - Frequently encountered problems
- **[Debugging](./debugging.md)** - Debugging tools and techniques
- **[Testing](../guides/testing.md)** - Performance testing
- **[API Reference](../api/README.md)** - Endpoint documentation
