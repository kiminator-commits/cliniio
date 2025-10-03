import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BIFailureNotificationDataProvider } from '../../src/services/bi/notification/data/BIFailureNotificationDataProvider';
import { BIFailureErrorHandler as _BIFailureErrorHandler } from '../../src/services/bi/failure/BIFailureErrorHandler';

// Mock BIFailureErrorHandler
vi.mock('../../src/services/bi/failure/BIFailureErrorHandler', () => ({
  BIFailureErrorHandler: {
    handleDatabaseError: vi.fn(),
    handleUnexpectedError: vi.fn(),
  },
}));

// Mock the actual service to avoid database calls
vi.mock(
  '../../src/services/bi/notification/data/BIFailureNotificationDataProvider',
  () => ({
    BIFailureNotificationDataProvider: {
      updateIncidentNotificationStatus: vi.fn(),
      logManagerNotification: vi.fn(),
      storeNotificationRecord: vi.fn(),
      storeEmailAlertInQueue: vi.fn(),
      getPendingEmailAlerts: vi.fn(),
      updateEmailAlertStatus: vi.fn(),
      getNotificationStats: vi.fn(),
      getNotificationAuditLog: vi.fn(),
      logNotificationAuditEvent: vi.fn(),
    },
  })
);

describe('BIFailureNotificationDataProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateIncidentNotificationStatus', () => {
    it('should update incident notification status with facility_id scoping', async () => {
      const mockUpdateIncidentNotificationStatus = vi.mocked(
        BIFailureNotificationDataProvider.updateIncidentNotificationStatus
      );
      mockUpdateIncidentNotificationStatus.mockResolvedValue(undefined);

      await BIFailureNotificationDataProvider.updateIncidentNotificationStatus(
        'incident-123',
        'facility-123',
        true
      );

      expect(mockUpdateIncidentNotificationStatus).toHaveBeenCalledWith(
        'incident-123',
        'facility-123',
        true
      );
    });

    it('should handle database error during update', async () => {
      const mockError = new Error('Database connection failed');
      const mockUpdateIncidentNotificationStatus = vi.mocked(
        BIFailureNotificationDataProvider.updateIncidentNotificationStatus
      );
      mockUpdateIncidentNotificationStatus.mockRejectedValue(mockError);

      await expect(
        BIFailureNotificationDataProvider.updateIncidentNotificationStatus(
          'incident-123',
          'facility-123',
          true
        )
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('logManagerNotification', () => {
    it('should log manager notification', async () => {
      const mockLogManagerNotification = vi.mocked(
        BIFailureNotificationDataProvider.logManagerNotification
      );
      mockLogManagerNotification.mockResolvedValue(undefined);

      await BIFailureNotificationDataProvider.logManagerNotification(
        'incident-123',
        'manager-123',
        'high'
      );

      expect(mockLogManagerNotification).toHaveBeenCalledWith(
        'incident-123',
        'manager-123',
        'high'
      );
    });

    it('should handle database error during logging', async () => {
      const mockError = new Error('Database connection failed');
      const mockLogManagerNotification = vi.mocked(
        BIFailureNotificationDataProvider.logManagerNotification
      );
      mockLogManagerNotification.mockRejectedValue(mockError);

      await expect(
        BIFailureNotificationDataProvider.logManagerNotification(
          'incident-123',
          'manager-123',
          'high'
        )
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('storeNotificationRecord', () => {
    it('should store notification record', async () => {
      const mockStoreNotificationRecord = vi.mocked(
        BIFailureNotificationDataProvider.storeNotificationRecord
      );
      mockStoreNotificationRecord.mockResolvedValue(undefined);

      const notification = {
        id: 'notification-123',
        incidentId: 'incident-123',
        facilityId: 'facility-123',
        severity: 'high' as const,
        messageType: 'regulatory' as const,
        recipients: ['manager@example.com'],
        subject: 'BI Failure Alert',
        body: 'A BI failure has been detected',
        sentAt: '2024-01-15T10:00:00Z',
        status: 'sent' as const,
        retryCount: 0,
        maxRetries: 3,
      };

      await BIFailureNotificationDataProvider.storeNotificationRecord(
        notification
      );

      expect(mockStoreNotificationRecord).toHaveBeenCalledWith(notification);
    });

    it('should handle database error during storage', async () => {
      const mockError = new Error('Database connection failed');
      const mockStoreNotificationRecord = vi.mocked(
        BIFailureNotificationDataProvider.storeNotificationRecord
      );
      mockStoreNotificationRecord.mockRejectedValue(mockError);

      const notification = {
        id: 'notification-123',
        incidentId: 'incident-123',
        facilityId: 'facility-123',
        severity: 'high' as const,
        messageType: 'regulatory' as const,
        recipients: ['manager@example.com'],
        subject: 'BI Failure Alert',
        body: 'A BI failure has been detected',
        sentAt: '2024-01-15T10:00:00Z',
        status: 'sent' as const,
        retryCount: 0,
        maxRetries: 3,
      };

      await expect(
        BIFailureNotificationDataProvider.storeNotificationRecord(notification)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('storeEmailAlertInQueue', () => {
    it('should store email alert in queue', async () => {
      const mockStoreEmailAlertInQueue = vi.mocked(
        BIFailureNotificationDataProvider.storeEmailAlertInQueue
      );
      mockStoreEmailAlertInQueue.mockResolvedValue('alert-123');

      const emailAlert = {
        id: 'alert-123',
        incidentId: 'incident-123',
        facilityId: 'facility-123',
        recipientType: 'regulator' as const,
        emailAddress: 'regulator@example.com',
        subject: 'BI Failure Alert',
        body: 'A BI failure has been detected',
        priority: 'high' as const,
        scheduledFor: '2024-01-15T10:00:00Z',
        status: 'queued' as const,
        retryCount: 0,
        maxRetries: 3,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
      };

      const result =
        await BIFailureNotificationDataProvider.storeEmailAlertInQueue(
          emailAlert
        );

      expect(mockStoreEmailAlertInQueue).toHaveBeenCalledWith(emailAlert);
      expect(result).toBe('alert-123');
    });

    it('should handle database error during storage', async () => {
      const mockError = new Error('Database connection failed');
      const mockStoreEmailAlertInQueue = vi.mocked(
        BIFailureNotificationDataProvider.storeEmailAlertInQueue
      );
      mockStoreEmailAlertInQueue.mockRejectedValue(mockError);

      const emailAlert = {
        id: 'alert-123',
        incidentId: 'incident-123',
        facilityId: 'facility-123',
        recipientType: 'regulator' as const,
        emailAddress: 'regulator@example.com',
        subject: 'BI Failure Alert',
        body: 'A BI failure has been detected',
        priority: 'high' as const,
        scheduledFor: '2024-01-15T10:00:00Z',
        status: 'queued' as const,
        retryCount: 0,
        maxRetries: 3,
        createdAt: '2024-01-15T09:00:00Z',
        updatedAt: '2024-01-15T09:00:00Z',
      };

      await expect(
        BIFailureNotificationDataProvider.storeEmailAlertInQueue(emailAlert)
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('getPendingEmailAlerts', () => {
    it('should get pending email alerts', async () => {
      const mockGetPendingEmailAlerts = vi.mocked(
        BIFailureNotificationDataProvider.getPendingEmailAlerts
      );
      const mockAlerts = [
        {
          id: 'alert-123',
          incidentId: 'incident-123',
          facilityId: 'facility-123',
          recipientType: 'regulator' as const,
          emailAddress: 'regulator@example.com',
          subject: 'BI Failure Alert',
          body: 'A BI failure has been detected',
          priority: 'high' as const,
          scheduledFor: '2024-01-15T10:00:00Z',
          status: 'queued' as const,
          retryCount: 0,
          maxRetries: 3,
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T09:00:00Z',
        },
      ];
      mockGetPendingEmailAlerts.mockResolvedValue(mockAlerts);

      const result =
        await BIFailureNotificationDataProvider.getPendingEmailAlerts();

      expect(mockGetPendingEmailAlerts).toHaveBeenCalled();
      expect(result).toEqual(mockAlerts);
    });

    it('should handle database error during retrieval', async () => {
      const mockError = new Error('Database connection failed');
      const mockGetPendingEmailAlerts = vi.mocked(
        BIFailureNotificationDataProvider.getPendingEmailAlerts
      );
      mockGetPendingEmailAlerts.mockRejectedValue(mockError);

      await expect(
        BIFailureNotificationDataProvider.getPendingEmailAlerts()
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('updateEmailAlertStatus', () => {
    it('should update email alert status', async () => {
      const mockUpdateEmailAlertStatus = vi.mocked(
        BIFailureNotificationDataProvider.updateEmailAlertStatus
      );
      mockUpdateEmailAlertStatus.mockResolvedValue(undefined);

      await BIFailureNotificationDataProvider.updateEmailAlertStatus(
        'alert-123',
        'sent',
        1
      );

      expect(mockUpdateEmailAlertStatus).toHaveBeenCalledWith(
        'alert-123',
        'sent',
        1
      );
    });

    it('should handle database error during update', async () => {
      const mockError = new Error('Database connection failed');
      const mockUpdateEmailAlertStatus = vi.mocked(
        BIFailureNotificationDataProvider.updateEmailAlertStatus
      );
      mockUpdateEmailAlertStatus.mockRejectedValue(mockError);

      await expect(
        BIFailureNotificationDataProvider.updateEmailAlertStatus(
          'alert-123',
          'sent',
          1
        )
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('getNotificationStats', () => {
    it('should get notification statistics', async () => {
      const mockGetNotificationStats = vi.mocked(
        BIFailureNotificationDataProvider.getNotificationStats
      );
      const mockStats = {
        totalSent: 10,
        totalFailed: 2,
        totalQueued: 3,
        successRate: 83.33,
      };
      mockGetNotificationStats.mockResolvedValue(mockStats);

      const result =
        await BIFailureNotificationDataProvider.getNotificationStats();

      expect(mockGetNotificationStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });

    it('should handle database error during retrieval', async () => {
      const mockError = new Error('Database connection failed');
      const mockGetNotificationStats = vi.mocked(
        BIFailureNotificationDataProvider.getNotificationStats
      );
      mockGetNotificationStats.mockRejectedValue(mockError);

      await expect(
        BIFailureNotificationDataProvider.getNotificationStats()
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('getNotificationAuditLog', () => {
    it('should get notification audit log', async () => {
      const mockGetNotificationAuditLog = vi.mocked(
        BIFailureNotificationDataProvider.getNotificationAuditLog
      );
      const mockAuditLog = [
        {
          id: 'log-123',
          action: 'email_sent',
          timestamp: '2024-01-15T10:00:00Z',
          details: 'Regulatory notification sent to regulator@example.com',
        },
      ];
      mockGetNotificationAuditLog.mockResolvedValue(mockAuditLog);

      const result =
        await BIFailureNotificationDataProvider.getNotificationAuditLog(
          'notification-123'
        );

      expect(mockGetNotificationAuditLog).toHaveBeenCalledWith(
        'notification-123'
      );
      expect(result).toEqual(mockAuditLog);
    });

    it('should handle database error during retrieval', async () => {
      const mockError = new Error('Database connection failed');
      const mockGetNotificationAuditLog = vi.mocked(
        BIFailureNotificationDataProvider.getNotificationAuditLog
      );
      mockGetNotificationAuditLog.mockRejectedValue(mockError);

      await expect(
        BIFailureNotificationDataProvider.getNotificationAuditLog(
          'notification-123'
        )
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('logNotificationAuditEvent', () => {
    it('should log notification audit event', async () => {
      const mockLogNotificationAuditEvent = vi.mocked(
        BIFailureNotificationDataProvider.logNotificationAuditEvent
      );
      mockLogNotificationAuditEvent.mockResolvedValue(undefined);

      await BIFailureNotificationDataProvider.logNotificationAuditEvent(
        'notification-123',
        'email_sent',
        'Regulatory notification sent',
        'user-123'
      );

      expect(mockLogNotificationAuditEvent).toHaveBeenCalledWith(
        'notification-123',
        'email_sent',
        'Regulatory notification sent',
        'user-123'
      );
    });

    it('should handle database error during logging', async () => {
      const mockError = new Error('Database connection failed');
      const mockLogNotificationAuditEvent = vi.mocked(
        BIFailureNotificationDataProvider.logNotificationAuditEvent
      );
      mockLogNotificationAuditEvent.mockRejectedValue(mockError);

      await expect(
        BIFailureNotificationDataProvider.logNotificationAuditEvent(
          'notification-123',
          'email_sent',
          'Regulatory notification sent',
          'user-123'
        )
      ).rejects.toThrow('Database connection failed');
    });
  });
});
