import { supabase } from '@/lib/supabaseClient';

/**
 * Webhook Notification Service
 * Handles webhook processing and sending
 */
export class WebhookNotificationService {
  /**
   * Process webhook notification
   */
  static async processWebhookNotification(notification: {
    id: string;
    data: Record<string, unknown>;
  }): Promise<void> {
    const { webhookUrl, payload } = notification.data as {
      webhookUrl: string;
      payload: Record<string, unknown>;
    };

    await this.sendWebhook(webhookUrl, payload);
  }

  /**
   * Send webhook using configured webhook service
   */
  private static async sendWebhook(
    url: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    try {
      const webhookConfig = await this.getWebhookServiceConfig();

      if (!webhookConfig.enabled) {
        console.log('Webhook service disabled, skipping webhook:', { url });
        return;
      }

      await this.sendWebhookRequest(url, payload, webhookConfig);
    } catch (error) {
      console.error('Failed to send webhook:', error);
      throw error;
    }
  }

  /**
   * Get webhook service configuration
   */
  private static async getWebhookServiceConfig(): Promise<{
    enabled: boolean;
    timeout: number;
    retryAttempts: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('facility_notification_config')
        .select('webhook_service_config')
        .single();

      if (error || !data?.webhook_service_config) {
        return { enabled: true, timeout: 10000, retryAttempts: 3 };
      }

      return {
        enabled:
          (data.webhook_service_config as { enabled?: boolean })?.enabled ||
          true,
        timeout:
          (data.webhook_service_config as { timeout?: number })?.timeout ||
          10000,
        retryAttempts:
          (data.webhook_service_config as { retryAttempts?: number })
            ?.retryAttempts || 3,
      };
    } catch (error) {
      console.error('Error getting webhook service config:', error);
      return { enabled: true, timeout: 10000, retryAttempts: 3 };
    }
  }

  /**
   * Send webhook request with timeout and retry logic
   */
  private static async sendWebhookRequest(
    url: string,
    payload: Record<string, unknown>,
    config: Record<string, unknown>
  ): Promise<void> {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      (config.timeout as number) || 10000
    );

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Cliniio-Webhook/1.0',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Webhook request failed: ${response.statusText}`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
