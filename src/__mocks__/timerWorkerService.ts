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

class MockTimerWorkerService {
  private static instances = new Map<string, TimerWorkerInstance>();
  private static config: TimerWorkerConfig = {
    updateInterval: 100,
    enableDebugLogging: false,
    fallbackToMainThread: true,
  };

  static configure(config: Partial<TimerWorkerConfig>) {
    this.config = { ...this.config, ...config };
  }

  static createWorker(timerId: string): TimerWorkerInstance {
    // Check if worker already exists
    if (this.instances.has(timerId)) {
      return this.instances.get(timerId)!;
    }

    // In test environment, we don't create actual workers
    // Instead, we create a mock instance that simulates fallback behavior
    const instance: TimerWorkerInstance = {
      worker: null,
      isSupported: false, // Workers not supported in test environment
      error: null, // Don't throw error, just indicate workers not supported
    };

    this.instances.set(timerId, instance);
    return instance;
  }

  static terminateWorker(timerId: string): void {
    if (this.instances.has(timerId)) {
      this.instances.delete(timerId);
    }
  }

  static isWorkerSupported(timerId: string): boolean {
    return (
      this.instances.has(timerId) && this.instances.get(timerId)!.isSupported
    );
  }

  static getWorkerError(timerId: string): Error | null {
    return this.instances.has(timerId)
      ? this.instances.get(timerId)!.error
      : null;
  }

  static getWorkerStats(): { totalWorkers: number; activeWorkers: number } {
    return {
      totalWorkers: this.instances.size,
      activeWorkers: Array.from(this.instances.values()).filter(
        (instance) => instance.worker !== null
      ).length,
    };
  }

  static measureTimerAccuracy(
    expectedInterval: number,
    actualInterval: number
  ): number {
    const difference = Math.abs(expectedInterval - actualInterval);
    return Math.max(0, 100 - (difference / expectedInterval) * 100);
  }
}

export default MockTimerWorkerService;
