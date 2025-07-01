import { logSterilizationEvent } from '../auditLogger';

describe('logSterilizationEvent', () => {
  it('should log event with correct structure', () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});

    logSterilizationEvent({
      action: 'TEST_ACTION',
      operator: 'Alice',
      toolId: 'TOOL123',
      phase: 'drying',
      metadata: { test: true },
      timestamp: '2025-01-01T12:00:00Z',
    });

    expect(spy).toHaveBeenCalledWith('[AUDIT]', expect.stringContaining('"action":"TEST_ACTION"'));
    spy.mockRestore();
  });
});
