interface TimerWorkerConfig {
  updateInterval?: number;
  enableDebugLogging?: boolean;
  fallbackToMainThread?: boolean;
}

interface TimerWorkerInstance {
  worker: Worker | null;
  isSupported: boolean;
  error: Error | null;
}

class TimerWorkerService {
  private static instances = new Map<string, TimerWorkerInstance>();
  private static config: TimerWorkerConfig = {
    updateInterval: 100,
    enableDebugLogging: process.env.NODE_ENV === 'development',
    fallbackToMainThread: true,
  };

  static configure(config: Partial<TimerWorkerConfig>) {
    this.config = { ...this.config, ...config };
  }

  static createWorker(id: string): TimerWorkerInstance {
    // Check if worker already exists
    if (this.instances.has(id)) {
      return this.instances.get(id)!;
    }

    let worker: Worker | null = null;
    let error: Error | null = null;
    let isSupported = false;

    try {
      // Check if Web Workers are supported
      if (typeof Window !== 'undefined' && 'Worker' in window) {
        worker = new Worker(
          new URL('../workers/timerWorker.ts', import.meta.url),
          {
            type: 'module',
          }
        );

        // Set up error handling
        worker.onerror = (event) => {
          error = new Error(`Timer Worker Error: ${event.message}`);
          if (this.config.enableDebugLogging) {
            console.error('Timer Worker Error:', event);
          }
        };

        worker.onmessageerror = (event) => {
          error = new Error(`Timer Worker Message Error: ${event.toString()}`);
          if (this.config.enableDebugLogging) {
            console.error('Timer Worker Message Error:', event);
          }
        };

        isSupported = true;

        if (this.config.enableDebugLogging) {
          console.debug('Web Worker created successfully for timer:', id);
        }
      } else {
        error = new Error('Web Workers not supported in this environment');
        if (this.config.enableDebugLogging) {
          console.warn('Web Workers not supported, will use fallback timer');
        }
      }
    } catch (err) {
      error =
        err instanceof Error ? err : new Error('Failed to create Timer Worker');
      if (this.config.enableDebugLogging) {
        console.warn('Failed to create Timer Worker:', err);
      }
    }

    const instance: TimerWorkerInstance = {
      worker,
      isSupported,
      error,
    };

    this.instances.set(id, instance);
    return instance;
  }

  static getWorker(id: string): TimerWorkerInstance | null {
    return this.instances.get(id) || null;
  }

  static terminateWorker(id: string): void {
    const instance = this.instances.get(id);
    if (instance?.worker) {
      instance.worker.terminate();
      if (this.config.enableDebugLogging) {
        console.debug('Web Worker terminated for timer:', id);
      }
    }
    this.instances.delete(id);
  }

  static terminateAllWorkers(): void {
    this.instances.forEach((instance) => {
      if (instance.worker) {
        instance.worker.terminate();
      }
    });
    this.instances.clear();

    if (this.config.enableDebugLogging) {
      console.debug('All Web Workers terminated');
    }
  }

  static isWorkerSupported(id: string): boolean {
    const instance = this.instances.get(id);
    return instance?.isSupported || false;
  }

  static getWorkerError(id: string): Error | null {
    const instance = this.instances.get(id);
    return instance?.error || null;
  }

  static getActiveWorkerCount(): number {
    return this.instances.size;
  }

  static getWorkerStats(): {
    total: number;
    supported: number;
    withErrors: number;
  } {
    let supported = 0;
    let withErrors = 0;

    this.instances.forEach((instance) => {
      if (instance.isSupported) supported++;
      if (instance.error) withErrors++;
    });

    return {
      total: this.instances.size,
      supported,
      withErrors,
    };
  }

  // Performance monitoring
  static measureTimerAccuracy(
    expectedInterval: number,
    actualInterval: number
  ): number {
    const deviation = Math.abs(actualInterval - expectedInterval);
    const accuracy = Math.max(0, 100 - (deviation / expectedInterval) * 100);
    return Math.round(accuracy * 100) / 100; // Round to 2 decimal places
  }

  // Memory management
  static cleanupUnusedWorkers(): void {
    this.instances.forEach((instance, id) => {
      // This is a simplified cleanup - in a real implementation,
      // you'd track when workers were last used
      if (instance.worker && !instance.isSupported) {
        this.terminateWorker(id);
      }
    });
  }
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    TimerWorkerService.terminateAllWorkers();
  });
}

export default TimerWorkerService;
