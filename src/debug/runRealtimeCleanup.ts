import { RealtimeManager } from '@/services/_core/realtimeManager';

// Run this file once (e.g. `import "@/debug/runRealtimeCleanup"` in App.tsx temporarily)
RealtimeManager.forceCleanup();
console.log('✅ All realtime subscriptions cleaned up');
