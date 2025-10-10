// ============================================================================
// SERVICE PERFORMANCE DECORATOR - Automatic Performance Tracking
// ============================================================================

import { servicePerformanceMonitor } from './ServicePerformanceMonitor';

/**
 * Decorator to automatically track service method performance
 */
export function trackPerformance(serviceName: string) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const callId = servicePerformanceMonitor.startCall(
        serviceName,
        propertyName
      );

      try {
        const result = await method.apply(this, args);
        servicePerformanceMonitor.endCall(callId, true);
        return result;
      } catch (error) {
        servicePerformanceMonitor.endCall(
          callId,
          false,
          error instanceof Error ? error.message : String(error)
        );
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Decorator for synchronous methods
 */
export function trackPerformanceSync(serviceName: string) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const callId = servicePerformanceMonitor.startCall(
        serviceName,
        propertyName
      );

      try {
        const result = method.apply(this, args);
        servicePerformanceMonitor.endCall(callId, true);
        return result;
      } catch (error) {
        servicePerformanceMonitor.endCall(
          callId,
          false,
          error instanceof Error ? error.message : String(error)
        );
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Higher-order function to wrap service methods with performance tracking
 */
export function withPerformanceTracking<
  T extends (...args: unknown[]) => unknown,
>(serviceName: string, methodName: string, method: T): T {
  return (async (...args: unknown[]) => {
    const callId = servicePerformanceMonitor.startCall(serviceName, methodName);

    try {
      const result = await method(...args);
      servicePerformanceMonitor.endCall(callId, true);
      return result;
    } catch (error) {
      servicePerformanceMonitor.endCall(
        callId,
        false,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }) as T;
}

/**
 * Higher-order function for synchronous methods
 */
export function withPerformanceTrackingSync<
  T extends (...args: unknown[]) => unknown,
>(serviceName: string, methodName: string, method: T): T {
  return ((...args: unknown[]) => {
    const callId = servicePerformanceMonitor.startCall(serviceName, methodName);

    try {
      const result = method(...args);
      servicePerformanceMonitor.endCall(callId, true);
      return result;
    } catch (error) {
      servicePerformanceMonitor.endCall(
        callId,
        false,
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }) as T;
}

/**
 * Service wrapper class that automatically tracks all methods
 */
export class PerformanceTrackedService {
  private serviceName: string;
  private originalService: unknown;

  constructor(serviceName: string, originalService: unknown) {
    this.serviceName = serviceName;
    this.originalService = originalService;

    // Wrap all methods with performance tracking
    this.wrapMethods();
  }

  private wrapMethods(): void {
    const prototype = Object.getPrototypeOf(this.originalService);
    const methods = Object.getOwnPropertyNames(prototype);

    methods.forEach((methodName) => {
      if (
        typeof prototype[methodName] === 'function' &&
        methodName !== 'constructor'
      ) {
        const originalMethod = prototype[methodName];

        prototype[methodName] = (...args: unknown[]) => {
          const callId = servicePerformanceMonitor.startCall(
            this.serviceName,
            methodName
          );

          try {
            const result = originalMethod.apply(this.originalService, args);

            // Handle both sync and async methods
            if (result && typeof result.then === 'function') {
              return result
                .then((res: unknown) => {
                  servicePerformanceMonitor.endCall(callId, true);
                  return res;
                })
                .catch((error: unknown) => {
                  servicePerformanceMonitor.endCall(
                    callId,
                    false,
                    error instanceof Error ? error.message : String(error)
                  );
                  throw error;
                });
            } else {
              servicePerformanceMonitor.endCall(callId, true);
              return result;
            }
          } catch (error) {
            servicePerformanceMonitor.endCall(
              callId,
              false,
              error instanceof Error ? error.message : String(error)
            );
            throw error;
          }
        };
      }
    });
  }

  getService(): T {
    return this.originalService as T;
  }
}

/**
 * Factory function to create performance-tracked services
 */
export function createPerformanceTrackedService<T>(
  serviceName: string,
  service: T
): T {
  const trackedService = new PerformanceTrackedService(serviceName, service);
  return trackedService.getService();
}
