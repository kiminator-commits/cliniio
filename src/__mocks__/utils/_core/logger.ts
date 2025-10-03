// Mock logger for Vitest tests
import { vi } from 'vitest';

export const logger = {
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  verbose: vi.fn(),
  perf: vi.fn(),
  security: vi.fn(),
  audit: vi.fn(),
  realtime: vi.fn(),
  getLevel: vi.fn(() => 'DEBUG'),
  isEnabled: vi.fn(() => true),
};
