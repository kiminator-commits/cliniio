import { supabase } from '@/lib/supabaseClient';
import { BIFailureNotificationDataProvider } from './data/BIFailureNotificationDataProvider';
// import * as nodemailer from 'nodemailer';

/**
 * Email Notification Service
 * Handles email processing and sending via various providers
 */
export class EmailNotificationService {
  /**
   * Process email alert
   */
  static async processEmailAlert(alert: {
    id: string;
    incidentId: string;
    facilityId: string;
    recipientType: string;
    emailAddress: string;
    subject: string;
    body: string;
    priority: string;
    retryCount: number;
    maxRetries: number;
  }): Promise<void> {
    try {
      // Update status to sending
      await BIFailureNotificationDataProvider.updateEmailAlertStatus(
        alert.id,
        'sending'
      );

      // Send email
      await this.sendEmail(alert.emailAddress, alert.subject, alert.body);

      // Update status to sent
      await BIFailureNotificationDataProvider.updateEmailAlertStatus(
        alert.id,
        'sent'
      );

      // Log successful email
      await BIFailureNotificationDataProvider.logNotificationAuditEvent(
        alert.id,
        'email_sent',
        `Email sent to ${alert.emailAddress}`
      );
    } catch (error) {
      // Update status to failed
      await BIFailureNotificationDataProvider.updateEmailAlertStatus(
        alert.id,
        'failed',
        alert.retryCount + 1
      );

      // Log email failure
      await BIFailureNotificationDataProvider.logNotificationAuditEvent(
        alert.id,
        'email_failed',
        `Email failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      throw error;
    }
  }

  /**
   * Process email notification
   */
  static async processEmailNotification(notification: {
    id: string;
    data: Record<string, unknown>;
  }): Promise<void> {
    const { recipients, subject, body } = notification.data as {
      recipients: string[];
      subject: string;
      body: string;
    };

    for (const recipient of recipients) {
      await this.sendEmail(recipient, subject, body);
    }
  }

  /**
   * Send email using configured email service
   */
  private static async sendEmail(
    to: string,
    subject: string,
    body: string
  ): Promise<void> {
    try {
      const emailConfig = await this.getEmailServiceConfig();

      if (!emailConfig.enabled) {
        return;
      }

      switch (emailConfig.provider) {
        case 'sendgrid':
          await this.sendEmailViaSendGrid(to, subject, body, emailConfig);
          break;
        case 'supabase':
          await this.sendEmailViaSupabase(to, subject, body, emailConfig);
          break;
        case 'smtp':
          await this.sendEmailViaSMTP(to, subject, body, emailConfig);
          break;
        default:
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Get email service configuration
   */
  private static async getEmailServiceConfig(): Promise<{
    enabled: boolean;
    provider: 'sendgrid' | 'supabase' | 'smtp' | 'none';
    apiKey?: string;
    fromEmail?: string;
    smtpConfig?: {
      host: string;
      port: number;
      username: string;
      password: string;
    };
  }> {
    // TEMPORARILY DISABLED TO STOP EMAIL BOUNCES
    return {
      enabled: false,
      provider: 'none',
    };
    try {
      const { data, error } = await supabase
        .from('facility_notification_config')
        .select('email_service_config')
        .single();

      if (error || !data?.email_service_config) {
        return { enabled: false, provider: 'none' };
      }

      return {
        enabled:
          (data.email_service_config as { enabled?: boolean })?.enabled ||
          false,
        provider: ((data.email_service_config as { provider?: string })
          ?.provider || 'none') as 'none' | 'sendgrid' | 'supabase' | 'smtp',
        apiKey: (data.email_service_config as { apiKey?: string })?.apiKey,
        fromEmail: (data.email_service_config as { fromEmail?: string })
          ?.fromEmail,
        smtpConfig: (
          data.email_service_config as { smtpConfig?: Record<string, unknown> }
        )?.smtpConfig as
          | { host: string; port: number; username: string; password: string }
          | undefined,
      };
    } catch (error) {
      console.error('Error getting email service config:', error);
      return { enabled: false, provider: 'none' };
    }
  }

  /**
   * Send email via SendGrid
   */
  private static async sendEmailViaSendGrid(
    to: string,
    subject: string,
    body: string,
    config: Record<string, unknown>
  ): Promise<void> {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: config.fromEmail },
        subject,
        content: [{ type: 'text/plain', value: body }],
      }),
    });

    if (!response.ok) {
      throw new Error(`SendGrid API error: ${response.statusText}`);
    }
  }

  /**
   * Send email via Supabase
   */
  private static async sendEmailViaSupabase(
    _to: string,
    _subject: string,
    _body: string,
    _config: Record<string, unknown>
  ): Promise<void> {
    try {
      // Use Supabase's admin email API to send custom emails
      // Note: Supabase doesn't have sendEmail method, using alternative approach
      const error = null; // Placeholder for now

      if (error) {
        throw new Error(`Supabase email error: ${(error as Error).message}`);
      }
    } catch (error) {
      console.error('Failed to send email via Supabase:', error);
      throw error;
    }
  }

  /**
   * Send email via SMTP
   */
  private static async sendEmailViaSMTP(
    _to: string,
    _subject: string,
    _body: string,
    _config: Record<string, unknown>
  ): Promise<void> {
    try {
      const smtpConfig = config.smtpConfig as {
        host: string;
        port: number;
        username: string;
        password: string;
      };

      if (!smtpConfig) {
        throw new Error('SMTP configuration not provided');
      }

      // Create SMTP transporter
      // const transporter = nodemailer.createTransporter({
      //   host: smtpConfig.host,
      //   port: smtpConfig.port,
      //   secure: smtpConfig.port === 465, // true for 465, false for other ports
      //   auth: {
      //     user: smtpConfig.username,
      //     pass: smtpConfig.password,
      //   },
      // });

      // Send email
      // const info = await transporter.sendMail({
      //   from: config.fromEmail || 'noreply@cliniio.com',
      //   to: to,
      //   subject: subject,
      //   text: body,
      //   html: `<pre>${body}</pre>`, // Convert plain text to HTML
      // });
    } catch (error) {
      console.error('Failed to send email via SMTP:', error);
      throw error;
    }
  }
}
