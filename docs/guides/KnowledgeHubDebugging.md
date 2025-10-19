# Debugging

## 🛠️ Debugging Tools and Techniques

### **Request Logging**

#### **Basic Request Logger**

```typescript
const debugRequest = async (url: string, options: RequestInit) => {
  const requestId = Math.random().toString(36).substr(2, 9);

  console.log(`[${requestId}] Request:`, {
    url,
    method: options.method || 'GET',
    headers: options.headers,
    body: options.body,
    timestamp: new Date().toISOString(),
  });

  const startTime = Date.now();

  try {
    const response = await fetch(url, options);
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log(`[${requestId}] Response:`, {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    // Clone response to read body without consuming it
    const responseClone = response.clone();
    const responseBody = await responseClone.text();

    try {
      const parsedBody = JSON.parse(responseBody);
      console.log(`[${requestId}] Response Body:`, parsedBody);
    } catch {
      console.log(`[${requestId}] Response Body (raw):`, responseBody);
    }

    return response;
  } catch (error) {
    const endTime = Date.now();
    const duration = endTime - startTime;

    console.error(`[${requestId}] Request Failed:`, {
      error: error.message,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
};
```

#### **Advanced Request Logger with Levels**

```typescript
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
}

class APILogger {
  private level: LogLevel;
  private requestId: string;

  constructor(level: LogLevel = LogLevel.INFO) {
    this.level = level;
    this.requestId = Math.random().toString(36).substr(2, 9);
  }

  log(level: LogLevel, message: string, data?: any) {
    if (level <= this.level) {
      const timestamp = new Date().toISOString();
      const prefix = `[${this.requestId}] [${LogLevel[level]}]`;

      if (data) {
        console.log(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  }

  error(message: string, data?: any) {
    this.log(LogLevel.ERROR, message, data);
  }

  warn(message: string, data?: any) {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any) {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any) {
    this.log(LogLevel.DEBUG, message, data);
  }

  async logRequest(url: string, options: RequestInit) {
    this.info('API Request', { url, options });

    const startTime = Date.now();

    try {
      const response = await fetch(url, options);
      const duration = Date.now() - startTime;

      this.info('API Response', {
        status: response.status,
        duration: `${duration}ms`,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.error('API Request Failed', {
        error: error.message,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }
}
```

---

## 🔍 Error Monitoring

### **Error Tracking Service**

```typescript
interface ErrorContext {
  userId?: string;
  endpoint?: string;
  requestData?: any;
  userAgent?: string;
  timestamp: string;
}

class ErrorMonitor {
  private errors: Array<{ error: Error; context: ErrorContext }> = [];
  private maxErrors = 100;

  logError(error: Error, context: Partial<ErrorContext> = {}) {
    const errorEntry = {
      error,
      context: {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ...context,
      },
    };

    this.errors.push(errorEntry);

    // Keep only the latest errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors);
    }

    // Log to console
    console.error('API Error:', {
      message: error.message,
      stack: error.stack,
      context: errorEntry.context,
    });

    // Send to external monitoring service (e.g., Sentry)
    this.sendToMonitoringService(errorEntry);
  }

  getErrors() {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }

  getErrorSummary() {
    const errorCounts = this.errors.reduce(
      (acc, entry) => {
        const key = entry.error.message;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      totalErrors: this.errors.length,
      errorCounts,
      recentErrors: this.errors.slice(-10),
    };
  }

  private sendToMonitoringService(errorEntry: {
    error: Error;
    context: ErrorContext;
  }) {
    // Implementation for sending to external monitoring service
    // Example: Sentry, LogRocket, etc.
    console.log('Sending error to monitoring service:', errorEntry);
  }
}

// Global error monitor instance
const errorMonitor = new ErrorMonitor();
```

---

## 📊 Performance Monitoring

### **Request Performance Tracker**

```typescript
interface PerformanceMetrics {
  endpoint: string;
  method: string;
  duration: number;
  status: number;
  timestamp: string;
  userId?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000;

  trackRequest(
    endpoint: string,
    method: string,
    startTime: number,
    status: number,
    userId?: string
  ) {
    const duration = Date.now() - startTime;

    const metric: PerformanceMetrics = {
      endpoint,
      method,
      duration,
      status,
      timestamp: new Date().toISOString(),
      userId,
    };

    this.metrics.push(metric);

    // Keep only the latest metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Log slow requests
    if (duration > 1000) {
      console.warn(
        `Slow API request: ${method} ${endpoint} took ${duration}ms`
      );
    }
  }

  getPerformanceReport() {
    const endpointStats = this.metrics.reduce(
      (acc, metric) => {
        if (!acc[metric.endpoint]) {
          acc[metric.endpoint] = {
            count: 0,
            totalDuration: 0,
            averageDuration: 0,
            slowestRequest: 0,
            fastestRequest: Infinity,
            errorCount: 0,
          };
        }

        const stats = acc[metric.endpoint];
        stats.count++;
        stats.totalDuration += metric.duration;
        stats.averageDuration = stats.totalDuration / stats.count;
        stats.slowestRequest = Math.max(stats.slowestRequest, metric.duration);
        stats.fastestRequest = Math.min(stats.fastestRequest, metric.duration);

        if (metric.status >= 400) {
          stats.errorCount++;
        }

        return acc;
      },
      {} as Record<string, any>
    );

    return {
      totalRequests: this.metrics.length,
      endpointStats,
      averageResponseTime:
        this.metrics.reduce((sum, m) => sum + m.duration, 0) /
        this.metrics.length,
      errorRate:
        this.metrics.filter((m) => m.status >= 400).length /
        this.metrics.length,
    };
  }

  getSlowestEndpoints(limit = 10) {
    const endpointAverages = Object.entries(
      this.getPerformanceReport().endpointStats
    )
      .map(([endpoint, stats]) => ({
        endpoint,
        averageDuration: stats.averageDuration,
        count: stats.count,
      }))
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, limit);

    return endpointAverages;
  }
}

// Global performance monitor instance
const performanceMonitor = new PerformanceMonitor();
```

---

## 🧪 Testing and Validation

### **API Response Validator**

```typescript
interface ValidationRule {
  field: string;
  required?: boolean;
  type?: string;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
}

class APIValidator {
  private rules: ValidationRule[] = [];

  addRule(rule: ValidationRule) {
    this.rules.push(rule);
  }

  validateResponse(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    this.rules.forEach((rule) => {
      const value = this.getNestedValue(data, rule.field);

      // Required field check
      if (
        rule.required &&
        (value === undefined || value === null || value === '')
      ) {
        errors.push(`${rule.field} is required`);
        return;
      }

      if (value !== undefined && value !== null) {
        // Type check
        if (rule.type && typeof value !== rule.type) {
          errors.push(
            `${rule.field} should be ${rule.type}, got ${typeof value}`
          );
        }

        // Length checks for strings
        if (typeof value === 'string') {
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(
              `${rule.field} should be at least ${rule.minLength} characters`
            );
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(
              `${rule.field} should be at most ${rule.maxLength} characters`
            );
          }
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${rule.field} format is invalid`);
          }
        }

        // Custom validation
        if (rule.custom && !rule.custom(value)) {
          errors.push(`${rule.field} failed custom validation`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

// Example usage
const validator = new APIValidator();
validator.addRule({ field: 'data', required: true, type: 'object' });
validator.addRule({
  field: 'data.title',
  required: true,
  type: 'string',
  minLength: 1,
});
validator.addRule({
  field: 'data.progress',
  type: 'number',
  custom: (value) => value >= 0 && value <= 100,
});

const validation = validator.validateResponse(responseData);
if (!validation.isValid) {
  console.error('Response validation failed:', validation.errors);
}
```

---

## 🔧 Debugging Utilities

### **Request Interceptor**

```typescript
class RequestInterceptor {
  private originalFetch: typeof fetch;
  private isEnabled = false;

  constructor() {
    this.originalFetch = window.fetch;
  }

  enable() {
    if (this.isEnabled) return;

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      return this.intercept(input, init);
    };

    this.isEnabled = true;
    console.log('Request interceptor enabled');
  }

  disable() {
    if (!this.isEnabled) return;

    window.fetch = this.originalFetch;
    this.isEnabled = false;
    console.log('Request interceptor disabled');
  }

  private async intercept(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';

    console.group(`🌐 ${method} ${url}`);
    console.log('Request:', { url, method, init });

    try {
      const response = await this.originalFetch(input, init);

      console.log('Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      // Clone response to read body
      const responseClone = response.clone();
      const responseText = await responseClone.text();

      try {
        const responseJson = JSON.parse(responseText);
        console.log('Response Body:', responseJson);
      } catch {
        console.log('Response Body (raw):', responseText);
      }

      console.groupEnd();
      return response;
    } catch (error) {
      console.error('Request failed:', error);
      console.groupEnd();
      throw error;
    }
  }
}

// Usage
const interceptor = new RequestInterceptor();
interceptor.enable(); // Enable request logging
// ... make API calls ...
interceptor.disable(); // Disable when done
```

---

## 🔗 Related Documentation

- **[Common Issues](./common-issues.md)** - Frequently encountered problems
- **[Performance](./performance.md)** - Optimization and best practices
- **[Error Handling](../api/error-handling.md)** - Error codes and handling
- **[Testing](../guides/testing.md)** - Testing environments and tools
