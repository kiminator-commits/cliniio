import { fetchWithProtection } from '@/utils/fetchWithProtection';

import { vi } from 'vitest';
global.fetch = vi.fn();

describe('fetchWithProtection', () => {
  beforeEach(() => {
    global.fetch = vi.fn(() => Promise.reject(new Error('fail'))) as vi.Mock;
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('resolves on first success', async () => {
    (fetch as vi.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });

    const res = await fetchWithProtection('/success');
    expect(res.ok).toBe(true);
  });

  it('retries on failure and succeeds', async () => {
    (fetch as vi.Mock)
      .mockRejectedValueOnce(new Error('Fail 1'))
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({}) });

    const res = await fetchWithProtection('/retry', { retries: 1 });
    expect(res.ok).toBe(true);
  });

  it('throws after all retries fail', async () => {
    (fetch as vi.Mock).mockRejectedValue(new Error('Fail again'));

    await expect(fetchWithProtection('/fail', { retries: 2 })).rejects.toThrow(
      'Fail again'
    );
  });
});
