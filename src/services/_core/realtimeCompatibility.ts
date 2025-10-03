// Compatibility layer to maintain existing imports
// This allows us to use the simplified versions without breaking existing code

export { SimpleRealtimeManager as RealtimeManager } from './simpleRealtimeManager';
export { SimpleRealtimeAutoOptimizer as RealtimeAutoOptimizer } from './simpleRealtimeAutoOptimizer';
export { SimpleRealtimeOptimizer as RealtimeOptimizer } from './simpleRealtimeOptimizer';

// Re-export the types for compatibility
export type { RealtimeSubscription } from './simpleRealtimeManager';
export type { RealtimeOptimizationConfig } from './simpleRealtimeOptimizer';
