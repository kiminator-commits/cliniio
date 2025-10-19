import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client to avoid real network calls
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

import { syncBITestResults } from '@/services/bi/syncBITestResults';
import { syncBIFailureIncidents } from '@/services/bi/syncBIFailureIncidents';
import { syncComplianceSettings } from '@/services/bi/syncComplianceSettings';

describe('BI Synchronization Integration', () => {
  beforeEach(() => vi.clearAllMocks());

  it('syncs BI test results successfully', async () => {
    const result = await syncBITestResults({ id: '1', value: 'pass' });
    expect(result).toBeUndefined();
  });

  it('handles BI failure incident sync gracefully', async () => {
    const result = await syncBIFailureIncidents({ id: '1', reason: 'error' });
    expect(result).toBeUndefined();
  });

  it('persists compliance settings', async () => {
    const result = await syncComplianceSettings({ facility_id: 'fac123', level: 'high' });
    expect(result.success).toBe(true);
  });
});
