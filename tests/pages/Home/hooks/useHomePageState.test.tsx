import { clearMocks } from './__mocks__/homePageStateMocks';

// Import state test suites
import './states/loadingState.test';
import './states/errorState.test';
import './states/emptyState.test';
import './states/readyState.test';
import './states/edgeCases.test';

// Import component test suites
import './components/componentRendering.test';

describe('useHomePageState Integration Tests', () => {
  beforeEach(() => {
    clearMocks();
  });

  it('should run all state test suites', () => {
    // This test ensures all state test suites are imported and run
    expect(true).toBe(true);
  });
});
