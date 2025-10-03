// Custom error class for Environmental Clean service errors
export class EnvironmentalCleanServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'EnvironmentalCleanServiceError';
  }
}

// Error message mapping for user-friendly messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR:
    'Unable to connect to the server. Please check your internet connection.',
  TIMEOUT_ERROR: 'The request took too long to complete. Please try again.',
  UNAUTHORIZED:
    "You don't have permission to perform this action. Please contact your administrator.",
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR:
    'The provided data is invalid. Please check your input and try again.',
  SERVER_ERROR: 'A server error occurred. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
} as const;

// Helper function to create user-friendly error messages
export const createUserFriendlyError = (
  error: unknown,
  context: string
): EnvironmentalCleanServiceError => {
  if (error instanceof EnvironmentalCleanServiceError) {
    return error;
  }

  const errorMessage = error instanceof Error ? error.message : String(error);

  // Categorize errors based on message content
  if (
    errorMessage.includes('fetch') ||
    errorMessage.includes('network') ||
    errorMessage.includes('ENOTFOUND')
  ) {
    return new EnvironmentalCleanServiceError(
      ERROR_MESSAGES.NETWORK_ERROR,
      'NETWORK_ERROR',
      undefined,
      { originalError: errorMessage, context }
    );
  }

  if (errorMessage.includes('timeout') || errorMessage.includes('ETIMEDOUT')) {
    return new EnvironmentalCleanServiceError(
      ERROR_MESSAGES.TIMEOUT_ERROR,
      'TIMEOUT_ERROR',
      undefined,
      { originalError: errorMessage, context }
    );
  }

  if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
    return new EnvironmentalCleanServiceError(
      ERROR_MESSAGES.UNAUTHORIZED,
      'UNAUTHORIZED',
      401,
      {
        originalError: errorMessage,
        context,
      }
    );
  }

  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return new EnvironmentalCleanServiceError(
      ERROR_MESSAGES.NOT_FOUND,
      'NOT_FOUND',
      404,
      {
        originalError: errorMessage,
        context,
      }
    );
  }

  if (errorMessage.includes('422') || errorMessage.includes('validation')) {
    return new EnvironmentalCleanServiceError(
      ERROR_MESSAGES.VALIDATION_ERROR,
      'VALIDATION_ERROR',
      422,
      { originalError: errorMessage, context }
    );
  }

  if (errorMessage.includes('500') || errorMessage.includes('server error')) {
    return new EnvironmentalCleanServiceError(
      ERROR_MESSAGES.SERVER_ERROR,
      'SERVER_ERROR',
      500,
      {
        originalError: errorMessage,
        context,
      }
    );
  }

  return new EnvironmentalCleanServiceError(
    ERROR_MESSAGES.UNKNOWN_ERROR,
    'UNKNOWN_ERROR',
    undefined,
    { originalError: errorMessage, context }
  );
};
