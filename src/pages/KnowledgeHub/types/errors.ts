// Knowledge Hub Error Types
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',
  OPERATION_FAILED = 'OPERATION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR = 'SERVER_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface KnowledgeHubError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: unknown;
  retryable: boolean;
  severity: ErrorSeverity;
  timestamp: Date;
  context?: {
    component?: string;
    operation?: string;
    userId?: string;
    action?: string;
    contentId?: string;
  };
}

export class ApiError extends Error {
  public readonly type: ErrorType;
  public readonly code?: string;
  public readonly retryable: boolean;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, unknown>;

  constructor(
    type: ErrorType,
    message: string,
    options: {
      code?: string;
      retryable?: boolean;
      severity?: ErrorSeverity;
      context?: Record<string, unknown>;
    } = {}
  ) {
    super(message);
    this.name = 'ApiError';
    this.type = type;
    this.code = options.code;
    this.retryable = options.retryable ?? this.isRetryableByDefault(type);
    this.severity = options.severity ?? this.getSeverityByType(type);
    this.context = options.context;
  }

  private isRetryableByDefault(type: ErrorType): boolean {
    switch (type) {
      case ErrorType.NETWORK_ERROR:
      case ErrorType.TIMEOUT_ERROR:
      case ErrorType.SERVER_ERROR:
        return true;
      case ErrorType.VALIDATION_ERROR:
      case ErrorType.CONTENT_NOT_FOUND:
      case ErrorType.UNAUTHORIZED:
      case ErrorType.RATE_LIMIT_EXCEEDED:
        return false;
      default:
        return false;
    }
  }

  private getSeverityByType(type: ErrorType): ErrorSeverity {
    switch (type) {
      case ErrorType.UNAUTHORIZED:
        return ErrorSeverity.CRITICAL;
      case ErrorType.NETWORK_ERROR:
      case ErrorType.SERVER_ERROR:
        return ErrorSeverity.HIGH;
      case ErrorType.VALIDATION_ERROR:
      case ErrorType.RATE_LIMIT_EXCEEDED:
        return ErrorSeverity.MEDIUM;
      case ErrorType.CONTENT_NOT_FOUND:
      case ErrorType.TIMEOUT_ERROR:
        return ErrorSeverity.LOW;
      default:
        return ErrorSeverity.MEDIUM;
    }
  }

  toKnowledgeHubError(context?: Record<string, unknown>): KnowledgeHubError {
    return {
      type: this.type,
      message: this.message,
      code: this.code,
      details: this.context,
      retryable: this.retryable,
      severity: this.severity,
      timestamp: new Date(),
      context: {
        ...this.context,
        ...context,
      },
    };
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(ErrorType.VALIDATION_ERROR, message, {
      severity: ErrorSeverity.MEDIUM,
      context: { details },
    });
    this.name = 'ValidationError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(ErrorType.NETWORK_ERROR, message, {
      severity: ErrorSeverity.HIGH,
      context,
    });
    this.name = 'NetworkError';
  }
}

export class ContentNotFoundError extends ApiError {
  constructor(contentId: string) {
    super(
      ErrorType.CONTENT_NOT_FOUND,
      `Content with ID ${contentId} not found`,
      {
        severity: ErrorSeverity.LOW,
        context: { contentId },
      }
    );
    this.name = 'ContentNotFoundError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized access') {
    super(ErrorType.UNAUTHORIZED, message, {
      severity: ErrorSeverity.CRITICAL,
    });
    this.name = 'UnauthorizedError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message = 'Rate limit exceeded', retryAfter?: number) {
    super(ErrorType.RATE_LIMIT_EXCEEDED, message, {
      severity: ErrorSeverity.MEDIUM,
      context: { retryAfter },
    });
    this.name = 'RateLimitError';
  }
}

// Error utility functions
export const createErrorFromResponse = (
  response: Response,
  context?: Record<string, unknown>
): ApiError => {
  const status = response.status;

  switch (status) {
    case 400:
      return new ValidationError('Invalid request data', context);
    case 401:
      return new UnauthorizedError();
    case 404:
      return new ContentNotFoundError(
        (context?.contentId as string) || 'unknown'
      );
    case 429: {
      const retryAfter = response.headers.get('Retry-After');
      return new RateLimitError(
        'Rate limit exceeded',
        retryAfter ? parseInt(retryAfter) : undefined
      );
    }
    case 500:
      return new ApiError(ErrorType.SERVER_ERROR, 'Internal server error', {
        severity: ErrorSeverity.HIGH,
        context,
      });
    default:
      return new ApiError(
        ErrorType.NETWORK_ERROR,
        `HTTP ${status}: ${response.statusText}`,
        {
          severity: ErrorSeverity.MEDIUM,
          context,
        }
      );
  }
};

export const isRetryableError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    return error.retryable;
  }
  return false;
};

export const getErrorSeverity = (error: unknown): ErrorSeverity => {
  if (error instanceof ApiError) {
    return error.severity;
  }
  return ErrorSeverity.MEDIUM;
};
