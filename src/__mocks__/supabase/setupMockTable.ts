export function setupMockTable(
  table: string,
  options: { single?: boolean; empty?: boolean; rows?: any[] } = {}
) {
  const { single = false, empty = false, rows } = options;

  const data = empty ? [] : (rows ?? [{ id: 1 }]);

  return {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ data, error: null }),
    update: vi.fn().mockResolvedValue({ data, error: null }),
    delete: vi.fn().mockResolvedValue({ data, error: null }),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => {
      return { data: single ? data[0] : null, error: null };
    }),
  };
}
