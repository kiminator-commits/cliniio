import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SMTPClient } from 'https://deno.land/x/denomailer@1.6.0/mod.ts';

// Dev team emails for product feedback
export const DEV_TEAM_EMAILS = [
  'kim.radomske@cliniio.com',
  // Add other dev team emails here as needed
];

// Email service interfaces
export interface EmailServiceConfig {
  enabled: boolean;
  provider: 'sendgrid' | 'supabase' | 'smtp' | 'none';
  fromEmail?: string;
  apiKey?: string;
  smtpConfig?: {
    host: string;
    port: number;
    username: string;
    password: string;
  };
}

export interface EmailRequest {
  to: string[];
  subject: string;
  body: string;
  fromEmail: string;
}

// Email service implementations
async function sendEmailViaSendGrid(
  request: EmailRequest,
  apiKey: string
): Promise<void> {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: request.to.map((email) => ({ email })) }],
      from: { email: request.fromEmail },
      subject: request.subject,
      content: [{ type: 'text/plain', value: request.body }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SendGrid error: ${response.status} - ${errorText}`);
  }
}

async function sendEmailViaSupabase(
  request: EmailRequest,
  config: EmailServiceConfig
): Promise<void> {
  // Supabase email implementation using admin API
  // This will use the configured SMTP settings from Supabase
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Send emails to multiple recipients using Supabase's admin API
    // Note: Supabase admin API sends to single recipient, so we loop through recipients
    for (const recipient of request.to) {
      const { error } = await supabaseClient.auth.admin.sendEmail({
        to: recipient,
        subject: request.subject,
        body: request.body,
        from: config.fromEmail || 'noreply@cliniio.com',
      });

      if (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
        throw new Error(
          `Supabase email error for ${recipient}: ${error.message}`
        );
      }
    }

    console.log(
      `✅ Successfully sent email via Supabase to ${request.to.length} recipients`
    );
  } catch (error) {
    console.error('Failed to send email via Supabase:', error);
    throw error;
  }
}

async function sendEmailViaSMTP(
  request: EmailRequest,
  config: EmailServiceConfig
): Promise<void> {
  if (!config.smtpConfig) {
    throw new Error('SMTP configuration not provided');
  }

  const { host, port, username, password } = config.smtpConfig;

  try {
    // For Deno Edge Functions, we'll use a direct SMTP implementation
    // This uses the native SMTP protocol over TCP
    const smtpClient = new SMTPClient({
      connection: {
        hostname: host,
        port: port,
        tls: port === 465, // Use TLS for port 465
        auth: {
          username: username,
          password: password,
        },
      },
    });

    // Send emails to all recipients
    for (const recipient of request.to) {
      await smtpClient.send({
        from: config.fromEmail || 'noreply@cliniio.com',
        to: recipient,
        subject: request.subject,
        content: request.body,
        html: `<pre>${request.body}</pre>`,
      });
    }

    await smtpClient.close();
    console.log(
      `✅ Successfully sent email via SMTP to ${request.to.length} recipients`
    );
  } catch (error) {
    console.error('Failed to send email via SMTP:', error);
    throw error;
  }
}

export async function sendEmail(
  request: EmailRequest,
  config: EmailServiceConfig
): Promise<void> {
  // TEMPORARILY DISABLED TO STOP EMAIL BOUNCES
  console.log('Email service disabled to prevent bounces, logging email:', {
    to: request.to,
    subject: request.subject,
  });
  return;

  if (!config.enabled || config.provider === 'none') {
    console.log('Email service disabled, logging email:', {
      to: request.to,
      subject: request.subject,
    });
    return;
  }

  try {
    switch (config.provider) {
      case 'sendgrid':
        if (!config.apiKey) {
          throw new Error('SendGrid API key not configured');
        }
        await sendEmailViaSendGrid(request, config.apiKey);
        break;
      case 'supabase':
        await sendEmailViaSupabase(request, config);
        break;
      case 'smtp':
        await sendEmailViaSMTP(request, config);
        break;
      default:
        console.log('No email provider configured, logging email:', {
          to: request.to,
          subject: request.subject,
          body: request.body,
        });
    }
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
}
