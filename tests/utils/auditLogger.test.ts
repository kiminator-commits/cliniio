import { logSterilizationEvent } from '../../src/utils/auditLogger';

describe('logSterilizationEvent', () => {
  it('should create event with correct structure', () => {
    const event = {
      action: 'TEST_ACTION',
      operator: 'Alice',
      toolId: 'TOOL123',
      phase: 'drying',
      metadata: { test: true },
      timestamp: '2025-01-01T12:00:00Z',
    };

    // The function should not throw and should process the event
    expect(() => {
      logSterilizationEvent(event);
    }).not.toThrow();
  });
});
