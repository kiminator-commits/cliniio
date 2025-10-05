import { supabase } from '@/lib/supabaseClient'

export async function runWorkflowAutomation({ scanData, facilityId }: any) {
  if (!scanData || !facilityId) return

  try {
    switch (scanData.type) {
      case 'STERILIZATION_CYCLE_COMPLETE':
        await supabase
          .from('sterilization_events')
          .insert([{ ...scanData.payload, facility_id: facilityId }])
        break

      case 'BI_FAILURE_DETECTED':
        await supabase
          .from('bi_failures')
          .insert([{ ...scanData.payload, facility_id: facilityId }])
        break

      case 'CLEANING_TASK_COMPLETE':
        await supabase
          .from('environmental_cleaning_log')
          .insert([{ ...scanData.payload, facility_id: facilityId }])
        break

      default:
        if (process.env.NODE_ENV === 'development') {
          console.debug(`Unknown workflow scan type: ${scanData.type}`)
        }
    }
  } catch (err: any) {
    console.error('runWorkflowAutomation failed:', err.message)
  }
}
