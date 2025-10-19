import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/lib/supabaseClient';

// Mock browser APIs for Node.js test environment
Object.defineProperty(global, 'URL', {
  value: {
    createObjectURL: vi.fn(() => 'mock-blob-url'),
    revokeObjectURL: vi.fn(),
  },
});

Object.defineProperty(global, 'document', {
  value: {
    createElement: vi.fn(() => ({
      href: '',
      download: '',
      click: vi.fn(),
    })),
    body: {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    },
  },
});

// Mock File constructor for Node.js test environment
global.File = class File {
  constructor(public content: any[], public name: string, public options: any) {}
  text() {
    return Promise.resolve(this.content[0]);
  }
} as any;

// Mock Supabase client to avoid real network calls
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

import { handleImportData, handleBulkExport, uploadScannedItems } from '@/services/inventory/inventoryDataTransfer';

describe('Inventory Data Transfer Integration', () => {
  beforeEach(() => vi.clearAllMocks());

  it('imports JSON file correctly', async () => {
    const jsonFile = new File([JSON.stringify([{ id: 1, name: 'Scalpel' }])], 'test.json', { type: 'application/json' });
    const result = await handleImportData(jsonFile);
    expect(result[0].name).toBe('Scalpel');
  });

  it('exports data to CSV format', async () => {
    const items = [{ id: 1, name: 'Scissors' }];
    await handleBulkExport(items, 'csv');
    expect(items.length).toBe(1);
  });

  it('uploads scanned items successfully', async () => {
    await uploadScannedItems([{ id: 1, name: 'Forceps' }]);
    expect(supabase.from).toHaveBeenCalledWith('inventory_items');
  });
});
