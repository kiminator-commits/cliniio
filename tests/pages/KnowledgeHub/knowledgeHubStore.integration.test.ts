import { resetStoreState } from './__mocks__/knowledgeHubMocks';
import { describe, test, expect, beforeEach, it } from 'vitest';

// Import store test suites
import './store/initialization.test';
import './store/contentFetching.test';
import './store/contentStatusUpdates.test';
import './store/contentUpdates.test';
import './store/contentDeletion.test';
import './store/categoryManagement.test';
import './store/errorHandling.test';
import './store/permissions.test';
import './store/stateSynchronization.test';
import './store/loadingStates.test';

describe('KnowledgeHub Store Integration Tests', () => {
  beforeEach(() => {
    resetStoreState();
  });

  it('should run all store test suites', () => {
    // This test ensures all store test suites are imported and run
    expect(true).toBe(true);
  });
});
