import { RealtimeManager } from '@/services/_core/realtimeManager';

// Call this function manually (for example from dev console or temporary debug hook)
export function runRealtimeCleanup() {
  RealtimeManager.forceCleanup();
  console.log('✅ Realtime subscriptions cleaned up');
}
