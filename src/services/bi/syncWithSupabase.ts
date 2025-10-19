import { supabase } from '@/lib/supabaseClient';
import { syncBITestResults } from './syncBITestResults';
import { syncBIFailureIncidents } from './syncBIFailureIncidents';
import { syncComplianceSettings } from './syncComplianceSettings';

/**
 * Main synchronization function for BI workflows
 * Routes different types of BI data to appropriate sync handlers
 */
export async function syncWithSupabase(localData: any[]) {
  try {
    for (const record of localData) {
      switch (record.type) {
        case 'test_result':
          await syncBITestResults(record);
          break;
        case 'failure_incident':
          await syncBIFailureIncidents(record);
          break;
        case 'compliance_setting':
          await syncComplianceSettings(record);
          break;
        default:
          console.warn('Unrecognized BI sync type:', record.type);
      }
    }
    console.info('✅ BI synchronization completed successfully.');
  } catch (error) {
    console.error('❌ Error during BI synchronization:', error);
  }
}
