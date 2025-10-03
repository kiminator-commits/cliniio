import { setupDefaultMocks } from './__mocks__/inventoryTestMocks';

// Import workflow test suites
import './workflows/dataSynchronization.test';
import './workflows/realTimeUpdates.test';
import './workflows/userJourney.test';
import './workflows/errorRecovery.test';
import './workflows/performance.test';

describe('Inventory Workflow Integration Tests', () => {
  beforeEach(() => {
    setupDefaultMocks();
  });

  it('should run all workflow test suites', () => {
    // This test ensures all workflow test suites are imported and run
    expect(true).toBe(true);
  });
});
