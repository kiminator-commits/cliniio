import { supabase } from '@/lib/supabaseClient';

export async function runWorkflowAutomation({
  scanData,
  facilityId,
}: {
  scanData: Record<string, unknown>;
  facilityId: string;
}) {
  if (!scanData || !facilityId) return;

  try {
    switch (scanData.type) {
      case 'STERILIZATION_CYCLE_COMPLETE':
        await supabase
          .from('sterilization_events')
          .insert([
            { ...(scanData.payload as unknown), facility_id: facilityId },
          ]);
        break;

      case 'BI_FAILURE_DETECTED':
        await supabase
          .from('bi_failures')
          .insert([
            { ...(scanData.payload as unknown), facility_id: facilityId },
          ]);
        break;

      case 'CLEANING_TASK_COMPLETE':
        await supabase
          .from('environmental_cleaning_log')
          .insert([
            { ...(scanData.payload as unknown), facility_id: facilityId },
          ]);
        break;

      default:
        if (process.env.NODE_ENV === 'development') {
          console.debug(`Unknown workflow scan type: ${scanData.type}`);
        }
    }
  } catch (err: unknown) {
    console.error(
      'runWorkflowAutomation failed:',
      err instanceof Error ? err.message : String(err)
    );
  }
}
