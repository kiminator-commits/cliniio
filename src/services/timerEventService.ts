import { supabase } from '../lib/supabaseClient';

export type TimerEventType =
  | 'start'
  | 'pause'
  | 'resume'
  | 'complete'
  | 'reset'
  | 'overexposure_start'
  | 'overexposure_end';

export interface LogTimerEventParams {
  cycleId: string;
  phaseName: string;
  eventType: TimerEventType;
  facilityId: string;
  durationMinutes?: number;
  elapsedSeconds?: number;
  remainingSeconds?: number;
  temperatureCelsius?: number;
  pressurePsi?: number;
  metadata?: Record<string, unknown>;
  notes?: string;
}

export async function logTimerEvent({
  cycleId,
  phaseName,
  eventType,
  _facilityId,
  _durationMinutes,
  elapsedSeconds,
  remainingSeconds,
  temperatureCelsius,
  pressurePsi,
  metadata,
  notes,
}: LogTimerEventParams): Promise<string | null> {
  // Log timer event to sterilization_cycles table instead of non-existent function
  const { data, error } = await supabase
    .from('sterilization_cycles')
    .update({
      status: phaseName,
      notes: notes || `Timer event: ${eventType}`,
      parameters: {
        event_type: eventType,
        elapsed_seconds: elapsedSeconds,
        remaining_seconds: remainingSeconds,
        temperature_celsius: temperatureCelsius,
        pressure_psi: pressurePsi,
        metadata: metadata,
      } as Record<string, unknown>, // Cast to Json type
    })
    .eq('id', cycleId);
  if (error) {
    console.error('Failed to log timer event:', error);
    return null;
  }
  return data as string;
}
