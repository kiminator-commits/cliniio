// Secure API client for authentication and data operations
interface SecureApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  enableRequestSigning: boolean;
  enableResponseValidation: boolean;
  enableCaching: boolean;
  cacheTimeout: number;
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  signRequest?: boolean;
}

interface SecureResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  metadata?: {
    requestId: string;
    timestamp: number;
    processingTime: number;
    rateLimitInfo?: Record<string, unknown>;
  };
}

interface RequestSignature {
  timestamp: number;
  nonce: string;
  signature: string;
  algorithm: string;
}

class SecureApiClient {
  private config: SecureApiConfig;
  private requestCounter = 0;
  private cache = new Map<string, { data: unknown; expires: number }>();
  private pendingRequests = new Map<string, Promise<unknown>>();

  constructor(config: Partial<SecureApiConfig> = {}) {
    this.config = {
      baseUrl: config.baseUrl || '/functions/v1',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      enableRequestSigning: config.enableRequestSigning || true,
      enableResponseValidation: config.enableResponseValidation || true,
      enableCaching: config.enableCaching || true,
      cacheTimeout: config.cacheTimeout || 300000, // 5 minutes
    };
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${++this.requestCounter}`;
  }

  private generateNonce(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
      ''
    );
  }

  private async generateSignature(
    data: string,
    timestamp: number,
    nonce: string
  ): Promise<string> {
    if (!this.config.enableRequestSigning) {
      return '';
    }

    try {
      // In production, use a proper signing key from secure storage
      const signingKey = await this.getSigningKey();
      const message = `${data}:${timestamp}:${nonce}`;

      const encoder = new TextEncoder();
      const keyData = encoder.encode(signingKey);
      const messageData = encoder.encode(message);

      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', key, messageData);
      const signatureArray = new Uint8Array(signature);
      return Array.from(signatureArray, (byte) =>
        byte.toString(16).padStart(2, '0')
      ).join('');
    } catch (error) {
      console.warn('Failed to generate request signature:', error);
      return '';
    }
  }

  private async getSigningKey(): Promise<string> {
    // In production, retrieve from secure storage or generate per session
    const storedKey = sessionStorage.getItem('api_signing_key');
    if (storedKey) {
      return storedKey;
    }

    // Generate new signing key for this session
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const key = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('');

    sessionStorage.setItem('api_signing_key', key);
    return key;
  }

  private createRequestSignature(_data: string): RequestSignature {
    const timestamp = Date.now();
    const nonce = this.generateNonce();

    return {
      timestamp,
      nonce,
      signature: '', // Will be set asynchronously
      algorithm: 'HMAC-SHA256',
    };
  }

  private getCacheKey(endpoint: string, data: unknown): string {
    const dataString = JSON.stringify(data || {});
    return `${endpoint}:${this.calculateHash(dataString)}`;
  }

  private calculateHash(data: string): string {
    // Simple hash function for cache keys
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private async getFromCache<T>(key: string): Promise<T | null> {
    if (!this.config.enableCaching) {
      return null;
    }

    const cached = this.cache.get(key);
    if (cached && cached.expires > Date.now()) {
      return cached.data as T;
    }

    if (cached) {
      this.cache.delete(key);
    }

    return null;
  }

  private setCache<T>(key: string, data: T): void {
    if (!this.config.enableCaching) {
      return;
    }

    this.cache.set(key, {
      data,
      expires: Date.now() + this.config.cacheTimeout,
    });

    // Cleanup expired cache entries
    if (this.cache.size > 100) {
      const now = Date.now();
      for (const [cacheKey, entry] of this.cache.entries()) {
        if (entry.expires < now) {
          this.cache.delete(cacheKey);
        }
      }
    }
  }

  private async validateResponse<T>(
    response: Response,
    requestId: string
  ): Promise<SecureResponse<T>> {
    try {
      const data = await response.json();

      if (this.config.enableResponseValidation) {
        // Validate response structure
        if (typeof data !== 'object' || data === null) {
          throw new Error('Invalid response format');
        }

        if (!Object.prototype.hasOwnProperty.call(data, 'success')) {
          throw new Error('Missing success field in response');
        }
      }

      return {
        success: data.success,
        data: data.data,
        error: data.error,
        message: data.message,
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTime: 0, // Will be calculated by caller
          rateLimitInfo: data.rateLimitInfo,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: 'Invalid response format',
        message: error.message,
        metadata: {
          requestId,
          timestamp: Date.now(),
          processingTime: 0,
        },
      };
    }
  }

  private async makeRequest<T>(
    options: RequestOptions
  ): Promise<SecureResponse<T>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();

    // Check for pending identical requests
    const requestKey = `${options.method}:${options.endpoint}:${JSON.stringify(options.data || {})}`;
    if (this.pendingRequests.has(requestKey)) {
      return (await this.pendingRequests.get(requestKey)) as SecureResponse<T>;
    }

    const requestPromise = this.executeRequest<T>(
      options,
      requestId,
      startTime
    );
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  private async executeRequest<T>(
    options: RequestOptions,
    requestId: string,
    startTime: number
  ): Promise<SecureResponse<T>> {
    const url = `${this.config.baseUrl}${options.endpoint}`;
    const timeout = options.timeout || this.config.timeout;
    const retries = options.retries || this.config.retryAttempts;

    // Check cache for GET requests
    if (options.method === 'GET' && options.cache !== false) {
      const cacheKey = this.getCacheKey(options.endpoint, options.data);
      const cached = await this.getFromCache<T>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached,
          metadata: {
            requestId,
            timestamp: Date.now(),
            processingTime: Date.now() - startTime,
          },
        };
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.performHttpRequest(
          url,
          options,
          requestId,
          timeout
        );
        const result = await this.validateResponse<T>(response, requestId);

        result.metadata!.processingTime = Date.now() - startTime;

        // Cache successful GET responses
        if (
          options.method === 'GET' &&
          result.success &&
          options.cache !== false
        ) {
          const cacheKey = this.getCacheKey(options.endpoint, options.data);
          this.setCache(cacheKey, result.data);
        }

        return result;
      } catch (error) {
        lastError = error as Error;

        if (attempt < retries) {
          // Exponential backoff
          const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    return {
      success: false,
      error: 'Request failed after retries',
      message: lastError?.message || 'Unknown error',
      metadata: {
        requestId,
        timestamp: Date.now(),
        processingTime: Date.now() - startTime,
      },
    };
  }

  private async performHttpRequest(
    url: string,
    options: RequestOptions,
    requestId: string,
    timeout: number
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Request-ID': requestId,
        'X-Requested-With': 'XMLHttpRequest',
        ...options.headers,
      };

      // Add request signing if enabled
      if (options.signRequest !== false && this.config.enableRequestSigning) {
        const dataString = JSON.stringify(options.data || {});
        const signature = this.createRequestSignature(dataString);
        const actualSignature = await this.generateSignature(
          dataString,
          signature.timestamp,
          signature.nonce
        );

        headers['X-Request-Timestamp'] = signature.timestamp.toString();
        headers['X-Request-Nonce'] = signature.nonce;
        headers['X-Request-Signature'] = actualSignature;
        headers['X-Request-Algorithm'] = signature.algorithm;
      }

      // Prepare request body
      let body: string | undefined;
      if (options.data && ['POST', 'PUT', 'PATCH'].includes(options.method)) {
        body = JSON.stringify(options.data);
      }

      const response = await fetch(url, {
        method: options.method,
        headers,
        body,
        signal: controller.signal,
        credentials: 'same-origin',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }

      throw error;
    }
  }

  // Public API methods
  async get<T>(
    endpoint: string,
    data?: unknown,
    options: Partial<RequestOptions> = {}
  ): Promise<SecureResponse<T>> {
    return this.makeRequest<T>({
      method: 'GET',
      endpoint,
      data,
      ...options,
    });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    options: Partial<RequestOptions> = {}
  ): Promise<SecureResponse<T>> {
    return this.makeRequest<T>({
      method: 'POST',
      endpoint,
      data,
      ...options,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    options: Partial<RequestOptions> = {}
  ): Promise<SecureResponse<T>> {
    return this.makeRequest<T>({
      method: 'PUT',
      endpoint,
      data,
      ...options,
    });
  }

  async delete<T>(
    endpoint: string,
    data?: unknown,
    options: Partial<RequestOptions> = {}
  ): Promise<SecureResponse<T>> {
    return this.makeRequest<T>({
      method: 'DELETE',
      endpoint,
      data,
      ...options,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options: Partial<RequestOptions> = {}
  ): Promise<SecureResponse<T>> {
    return this.makeRequest<T>({
      method: 'PATCH',
      endpoint,
      data,
      ...options,
    });
  }

  // Authentication-specific methods
  async authenticate(credentials: {
    email: string;
    password: string;
    csrfToken?: string;
    rememberMe?: boolean;
  }): Promise<
    SecureResponse<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
      user: {
        id: string;
        email: string;
        role: string;
      };
    }>
  > {
    return this.post('/auth-login', credentials, {
      signRequest: true,
      cache: false,
    });
  }

  async refreshToken(refreshToken: string): Promise<
    SecureResponse<{
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }>
  > {
    return this.post(
      '/auth-refresh',
      { refreshToken },
      {
        signRequest: true,
        cache: false,
      }
    );
  }

  async logout(): Promise<SecureResponse<void>> {
    return this.post(
      '/auth-logout',
      {},
      {
        signRequest: true,
        cache: false,
      }
    );
  }

  // Utility methods
  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: 100,
      hitRate: 0, // Would need to track hits/misses
    };
  }

  updateConfig(updates: Partial<SecureApiConfig>): void {
    Object.assign(this.config, updates);
  }
}

// Export singleton instance
export const secureApiClient = new SecureApiClient({
  baseUrl: '/functions/v1',
  timeout: 30000,
  retryAttempts: 3,
  enableRequestSigning: true,
  enableResponseValidation: true,
  enableCaching: true,
  cacheTimeout: 300000,
});

// Export types and class for testing
export {
  SecureApiClient,
  type SecureApiConfig,
  type RequestOptions,
  type SecureResponse,
  type RequestSignature,
};
