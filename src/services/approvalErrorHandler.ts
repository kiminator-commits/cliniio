import { toast } from 'react-hot-toast';

export interface ApprovalError {
  code: string;
  message: string;
  details?: any;
  userMessage: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
}

export class ApprovalErrorHandler {
  /**
   * Handle errors from the approval workflow
   */
  static handleApprovalError(error: any, context: string): ApprovalError {
    console.error(`Approval error in ${context}:`, error);

    // Database errors
    if (error?.code?.startsWith('23')) {
      return {
        code: 'CONSTRAINT_VIOLATION',
        message: error.message,
        details: error,
        userMessage: 'This action conflicts with existing data. Please refresh and try again.',
        severity: 'medium',
        retryable: true
      };
    }

    if (error?.code === 'PGRST116') {
      return {
        code: 'NOT_FOUND',
        message: error.message,
        details: error,
        userMessage: 'The requested content or task could not be found. It may have been deleted.',
        severity: 'medium',
        retryable: false
      };
    }

    if (error?.code?.startsWith('42')) {
      return {
        code: 'DATABASE_ERROR',
        message: error.message,
        details: error,
        userMessage: 'A database error occurred. Please try again in a moment.',
        severity: 'high',
        retryable: true
      };
    }

    // Network errors
    if (error?.message?.includes('fetch')) {
      return {
        code: 'NETWORK_ERROR',
        message: error.message,
        details: error,
        userMessage: 'Network connection issue. Please check your internet connection and try again.',
        severity: 'medium',
        retryable: true
      };
    }

    // Permission errors
    if (error?.message?.includes('permission') || error?.message?.includes('unauthorized')) {
      return {
        code: 'PERMISSION_DENIED',
        message: error.message,
        details: error,
        userMessage: 'You do not have permission to perform this action.',
        severity: 'high',
        retryable: false
      };
    }

    // Concurrency errors
    if (error?.message?.includes('already') || error?.message?.includes('concurrent')) {
      return {
        code: 'CONCURRENT_MODIFICATION',
        message: error.message,
        details: error,
        userMessage: 'This content has already been processed by another user. Please refresh the page.',
        severity: 'medium',
        retryable: true
      };
    }

    // Content not found errors
    if (error?.message?.includes('not found') || error?.message?.includes('does not exist')) {
      return {
        code: 'CONTENT_NOT_FOUND',
        message: error.message,
        details: error,
        userMessage: 'The content you are trying to review no longer exists.',
        severity: 'medium',
        retryable: false
      };
    }

    // Validation errors
    if (error?.message?.includes('validation') || error?.message?.includes('invalid')) {
      return {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error,
        userMessage: 'Please check your input and try again.',
        severity: 'low',
        retryable: true
      };
    }

    // Default error
    return {
      code: 'UNKNOWN_ERROR',
      message: error?.message || 'An unexpected error occurred',
      details: error,
      userMessage: 'An unexpected error occurred. Please try again.',
      severity: 'high',
      retryable: true
    };
  }

  /**
   * Show error toast with appropriate styling
   */
  static showErrorToast(error: ApprovalError, customMessage?: string): void {
    const message = customMessage || error.userMessage;
    
    const toastOptions = {
      duration: error.severity === 'critical' ? 8000 : 5000,
      style: {
        background: error.severity === 'critical' ? '#dc2626' : 
                   error.severity === 'high' ? '#ea580c' :
                   error.severity === 'medium' ? '#d97706' : '#059669',
        color: '#ffffff',
        fontWeight: '500'
      }
    };

    if (error.retryable && error.severity !== 'critical') {
      toast.error(message, {
        ...toastOptions,
        // Note: Retry functionality would need to be handled by the calling component
        // as the toast library doesn't support action buttons in this version
      });
    } else {
      toast.error(message, toastOptions);
    }
  }

  /**
   * Handle approval-specific errors
   */
  static handleApprovalActionError(error: any, action: 'approve' | 'reject'): ApprovalError {
    const baseError = this.handleApprovalError(error, `content_${action}`);
    
    // Customize message based on action
    if (action === 'approve') {
      if (baseError.code === 'CONCURRENT_MODIFICATION') {
        baseError.userMessage = 'This content has already been approved by another reviewer.';
      } else if (baseError.code === 'CONTENT_NOT_FOUND') {
        baseError.userMessage = 'The content you are trying to approve no longer exists.';
      }
    } else if (action === 'reject') {
      if (baseError.code === 'CONCURRENT_MODIFICATION') {
        baseError.userMessage = 'This content has already been processed by another reviewer.';
      } else if (baseError.code === 'CONTENT_NOT_FOUND') {
        baseError.userMessage = 'The content you are trying to reject no longer exists.';
      }
    }

    return baseError;
  }

  /**
   * Handle task creation errors
   */
  static handleTaskCreationError(error: any): ApprovalError {
    const baseError = this.handleApprovalError(error, 'task_creation');
    
    if (baseError.code === 'PERMISSION_DENIED') {
      baseError.userMessage = 'No users found with approval permissions. Please check your user roles.';
    } else if (baseError.code === 'NOT_FOUND') {
      baseError.userMessage = 'The content to be reviewed could not be found.';
    }

    return baseError;
  }

  /**
   * Handle notification errors (non-critical)
   */
  static handleNotificationError(error: any): void {
    console.warn('Notification error (non-critical):', error);
    // Don't show toast for notification errors as they're not critical to the workflow
  }

  /**
   * Log error for monitoring/debugging
   */
  static logError(error: ApprovalError, context: string, userId?: string): void {
    const logData = {
      timestamp: new Date().toISOString(),
      context,
      userId,
      errorCode: error.code,
      errorMessage: error.message,
      severity: error.severity,
      retryable: error.retryable,
      details: error.details
    };

    // In production, this would be sent to a logging service
    console.error('Approval workflow error logged:', logData);
  }

  /**
   * Get user-friendly error message for specific error codes
   */
  static getUserMessage(errorCode: string, context?: string): string {
    const messages: Record<string, string> = {
      'CONSTRAINT_VIOLATION': 'This action conflicts with existing data. Please refresh and try again.',
      'NOT_FOUND': 'The requested item could not be found.',
      'DATABASE_ERROR': 'A database error occurred. Please try again in a moment.',
      'NETWORK_ERROR': 'Network connection issue. Please check your internet connection.',
      'PERMISSION_DENIED': 'You do not have permission to perform this action.',
      'CONCURRENT_MODIFICATION': 'This item has already been processed by another user.',
      'CONTENT_NOT_FOUND': 'The content you are looking for no longer exists.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'UNKNOWN_ERROR': 'An unexpected error occurred. Please try again.'
    };

    return messages[errorCode] || messages['UNKNOWN_ERROR'];
  }

  /**
   * Check if an error is retryable
   */
  static isRetryable(error: any): boolean {
    const approvalError = this.handleApprovalError(error, 'unknown');
    return approvalError.retryable;
  }

  /**
   * Get error severity level
   */
  static getSeverity(error: any): 'low' | 'medium' | 'high' | 'critical' {
    const approvalError = this.handleApprovalError(error, 'unknown');
    return approvalError.severity;
  }
}
