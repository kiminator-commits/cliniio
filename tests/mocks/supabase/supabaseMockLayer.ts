export function getMockUser() {
  return { id: 'mock-user-123', name: 'Test User' };
}

export function getMockFacility() {
  return { id: 'mock-facility-456', name: 'Test Facility' };
}

export interface ErrorSimulationConfig {
  simulateAuthError?: boolean;
  simulateNetworkError?: boolean;
  simulatePermissionError?: boolean;
}

export function getDefaultErrorConfig(): ErrorSimulationConfig {
  return {
    simulateAuthError: false,
    simulateNetworkError: false,
    simulatePermissionError: false,
  };
}
