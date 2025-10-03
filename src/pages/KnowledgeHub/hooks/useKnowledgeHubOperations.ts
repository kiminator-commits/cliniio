import { useCallback } from 'react';
import { ContentStatus } from '../types';
import { useInputValidation } from '../utils/inputValidation';
import { useKnowledgeHubStore } from '../store/knowledgeHubStore';
import { useKnowledgeHubLogger } from '../services/knowledgeHubLogger';

export const useKnowledgeHubOperations = () => {
  const {
    setValidationError,
    canDeleteContent,
    canUpdateStatus,
    currentUser,
    updateContentStatus: storeUpdateContentStatus,
    deleteContent: storeDeleteContent,
  } = useKnowledgeHubStore();
  const { validateAndSanitizeStatusUpdate } = useInputValidation();

  // Initialize logger with user context
  const logger = useKnowledgeHubLogger(currentUser?.id);

  const handleDeleteContent = useCallback(
    (id: string) => {
      // Check authentication and permissions
      if (!currentUser) {
        logger.auditDenied(
          'DELETE_CONTENT',
          'Authentication required',
          undefined,
          'content',
          id,
          {
            operation: 'deleteContent',
          }
        );
        setValidationError('Authentication required for this operation');
        return;
      }

      if (!canDeleteContent()) {
        logger.auditDenied(
          'DELETE_CONTENT',
          'Insufficient permissions',
          ['canDeleteContent'],
          'content',
          id,
          {
            userId: currentUser.id,
            userRole: currentUser.role,
            operation: 'deleteContent',
          }
        );
        setValidationError('Insufficient permissions to delete content');
        return;
      }

      // Validate and sanitize input
      const validation = validateAndSanitizeStatusUpdate(
        id,
        'Not Started',
        currentUser.id
      );
      if (!validation.isValid) {
        logger.validationError('contentId', id, 'format', {
          userId: currentUser.id,
          operation: 'deleteContent',
          error: validation.error,
        });
        setValidationError(validation.error || 'Invalid content ID');
        return;
      }

      // Log successful validation
      logger.validationSuccess('contentId', validation.sanitizedId!, {
        userId: currentUser.id,
        operation: 'deleteContent',
      });

      // Log the operation
      logger.auditSuccess(
        'DELETE_CONTENT',
        'content',
        validation.sanitizedId!,
        {
          userId: currentUser.id,
          userRole: currentUser.role,
          operation: 'deleteContent',
        }
      );

      // Clear any previous validation errors
      setValidationError(null);

      // Perform the operation
      storeDeleteContent(validation.sanitizedId!);
    },
    [
      storeDeleteContent,
      currentUser,
      canDeleteContent,
      validateAndSanitizeStatusUpdate,
      setValidationError,
      logger,
    ]
  );

  const handleStatusUpdate = useCallback(
    (id: string, status: ContentStatus) => {
      // Check authentication and permissions
      if (!currentUser) {
        logger.auditDenied(
          'UPDATE_STATUS',
          'Authentication required',
          undefined,
          'content',
          id,
          {
            operation: 'updateStatus',
            status,
          }
        );
        setValidationError('Authentication required for this operation');
        return;
      }

      if (!canUpdateStatus()) {
        logger.auditDenied(
          'UPDATE_STATUS',
          'Insufficient permissions',
          ['canUpdateStatus'],
          'content',
          id,
          {
            userId: currentUser.id,
            userRole: currentUser.role,
            operation: 'updateStatus',
            status,
          }
        );
        setValidationError('Insufficient permissions to update content status');
        return;
      }

      // Validate and sanitize input
      const validation = validateAndSanitizeStatusUpdate(
        id,
        status,
        currentUser.id
      );
      if (!validation.isValid) {
        logger.validationError('statusUpdate', `${id}:${status}`, 'format', {
          userId: currentUser.id,
          operation: 'updateStatus',
          error: validation.error,
        });
        setValidationError(validation.error || 'Invalid input data');
        return;
      }

      // Log successful validation
      logger.validationSuccess(
        'statusUpdate',
        `${validation.sanitizedId}:${validation.status}`,
        {
          userId: currentUser.id,
          operation: 'updateStatus',
        }
      );

      // Log the operation
      logger.auditSuccess('UPDATE_STATUS', 'content', validation.sanitizedId!, {
        userId: currentUser.id,
        userRole: currentUser.role,
        operation: 'updateStatus',
        status: validation.status,
      });

      // Clear any previous validation errors
      setValidationError(null);

      // Perform the operation
      storeUpdateContentStatus(validation.sanitizedId!, validation.status!);
    },
    [
      storeUpdateContentStatus,
      currentUser,
      canUpdateStatus,
      validateAndSanitizeStatusUpdate,
      setValidationError,
      logger,
    ]
  );

  return {
    handleDeleteContent,
    handleStatusUpdate,
  };
};
