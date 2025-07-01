import { generateAuditSignature } from './sterilizationUtils';

export interface SterilizationEvent {
  timestamp: string;
  action: string;
  operator?: string;
  toolId?: string;
  phase?: string;
  metadata?: Record<string, string | number | boolean>;
  electronicSignature?: string;
}

export const logSterilizationEvent = (event: SterilizationEvent) => {
  const electronicSignature = `${event.operator || 'unknown'}-${Date.now()}`;
  const eventWithSignature = {
    ...event,
    signature: generateAuditSignature(event),
    electronicSignature,
  };
  console.log(
    '[AUDIT]',
    JSON.stringify({ ...eventWithSignature, timestamp: new Date().toISOString() })
  );
  // Placeholder — replace with Supabase insert in future phase
};

export const useAuditLogger = () => {
  const logAuditEvent = (category: string, data: Record<string, unknown>) => {
    const auditEvent = {
      category,
      data,
      timestamp: new Date().toISOString(),
    };
    console.log('[AUDIT]', JSON.stringify(auditEvent));
    // Placeholder — replace with Supabase insert in future phase
  };

  return { logAuditEvent };
};

export const auditLogger = {
  log: (category: string, action: string, data?: Record<string, unknown>) => {
    const auditEvent = {
      category,
      action,
      data,
      timestamp: new Date().toISOString(),
    };
    console.log('[AUDIT]', JSON.stringify(auditEvent));
    // Placeholder — replace with Supabase insert in future phase
  },
};
