// Enhanced Supabase Mock Utilities
// This file provides enhanced mock functionality and re-exports from modules

// Re-export all functionality from extracted modules
export { PostgrestErrorTypes, generateMockError } from './errorSimulation';

// Explicitly export the interfaces
export type {
  ErrorSimulationConfig,
  EnhancedMockConfig,
} from './errorSimulation';

export {
  generateUUID,
  generateTimestamp,
  generateEmail,
  generateFacilityData,
  generateUserData,
  generateInventoryItemData,
  generateActivityFeedData,
  generateAIChallengeCompletionData,
  generateSterilizationCycleData,
  generateTableData,
  generateTableDataList,
} from './dataGenerators';

export { RealtimeEventSimulator } from './realtimeSimulator';

export {
  createRealisticMockConfig,
  createErrorTestingMockConfig,
  createPerformanceTestingMockConfig,
} from './configUtilities';
