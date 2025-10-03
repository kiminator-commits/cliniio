import { supabase } from '../lib/supabaseClient';
import { Timer } from '../store/timerStore';

export interface TimerBackupService {
  loadTimerBackupFromDatabase: (cycleId: string) => Promise<Timer[]>;
  saveTimerBackupToDatabase: (
    cycleId: string,
    timers: Record<string, Timer>
  ) => Promise<void>;
  getActiveCyclePhases: (cycleId: string) => Promise<Record<string, unknown>[]>;
}

export class TimerBackupServiceClass implements TimerBackupService {
  async loadTimerBackupFromDatabase(cycleId: string): Promise<Timer[]> {
    try {
      const { data, error } = await supabase
        .from('sterilization_cycles')
        .select('status, start_time, duration_minutes')
        .eq('id', cycleId)
        .eq('status', 'bath1');

      if (error) {
        console.error('Failed to load timer backup:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      const backupTimers: Timer[] = [];
      data.forEach((cycle) => {
        if (cycle.start_time && cycle.duration_minutes) {
          const startTime = new Date(cycle.start_time as string);
          const now = new Date();
          const elapsedSeconds = Math.floor(
            (now.getTime() - startTime.getTime()) / 1000
          );
          const remainingSeconds = Math.max(
            0,
            (cycle.duration_minutes as number) * 60 - elapsedSeconds
          );

          backupTimers.push({
            id: cycle.status as string,
            timeRemaining: remainingSeconds,
            elapsedTime: elapsedSeconds,
            duration: (cycle.duration_minutes as number) * 60,
            isRunning: cycle.status === 'bath1',
            overexposed:
              elapsedSeconds > (cycle.duration_minutes as number) * 60,
          });
        }
      });

      return backupTimers;
    } catch (error) {
      console.error('Error loading timer backup:', error);
      return [];
    }
  }

  async saveTimerBackupToDatabase(
    cycleId: string,
    timers: Record<string, Timer>
  ): Promise<void> {
    try {
      // Only save if there are active timers
      if (Object.keys(timers).length === 0) {
        return;
      }

      // Update cycle phases with current timer states
      for (const [_phaseName, timer] of Object.entries(timers)) {
        if (timer.isRunning) {
          await supabase
            .from('sterilization_cycles')
            .update({
              status: 'bath1',
              start_time: new Date(
                Date.now() - timer.elapsedTime * 1000
              ).toISOString(),
              duration_minutes: Math.floor(timer.duration / 60),
            })
            .eq('id', cycleId);
        }
      }
    } catch (error) {
      console.error('Error saving timer backup:', error);
    }
  }

  async getActiveCyclePhases(
    cycleId: string
  ): Promise<Record<string, unknown>[]> {
    try {
      const { data, error } = await supabase
        .from('sterilization_cycles') // ✅ Change to correct table name if needed
        .select('*')
        .eq('cycle_id', cycleId)
        .eq('phase_status', 'running');

      if (error) {
        console.error('Failed to get active cycle phases:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting active cycle phases:', error);
      return [];
    }
  }
}

// Export singleton instance
export const timerBackupService = new TimerBackupServiceClass();
