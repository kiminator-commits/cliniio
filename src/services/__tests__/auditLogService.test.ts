import { insertSterilizationLog } from '../auditLogService';
import { supabase } from '@/lib/supabaseClient';

jest.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

describe('insertSterilizationLog', () => {
  it('should insert sterilization log without error', async () => {
    const event = {
      action: 'MOCK_LOG',
      operator: 'Tester',
      toolId: 'MOCK123',
      phase: 'autoclave',
      metadata: {},
      timestamp: new Date().toISOString(),
    };

    await insertSterilizationLog(event);
    expect(supabase.from).toHaveBeenCalledWith('sterilization_logs');
  });
});
