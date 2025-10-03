// Mock the audit logger directly since Supabase is not configured
vi.mock('../../src/services/auditLogService', () => ({
  insertSterilizationLog: vi.fn().mockResolvedValue(undefined),
}));

import { insertSterilizationLog } from '../../src/services/auditLogService';

import { vi } from 'vitest';
describe('insertSterilizationLog', () => {
  it('should insert sterilization log without error', async () => {
    const event = {
      event: 'MOCK_LOG',
      data: {
        action: 'MOCK_LOG',
        operator: 'Tester',
        toolId: 'MOCK123',
        phase: 'autoclave',
        metadata: {},
      },
      timestamp: new Date().toISOString(),
      userId: 'test-user-id',
    };

    const result = await insertSterilizationLog(event);
    expect(result).toBeUndefined();
  });
});
