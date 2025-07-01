// Polyfills for Node
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Set Supabase test environment defaults
process.env.SUPABASE_URL = 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = 'test-anon-key';

// Mock browser APIs
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserver;

class IntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = IntersectionObserver;

// Mock Vite's import.meta.env
global.import = {
  meta: {
    env: {
      VITE_SUPABASE_URL: 'https://psqwgebhxfuzqqgdzcmm.supabase.co',
      VITE_SUPABASE_ANON_KEY:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzcXdnZWJoeGZ1enFxZ2R6Y21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg2ODAzNDIsImV4cCI6MjA2NDI1NjM0Mn0.fIXLOK-TsgDtFo4Y483v4xVUH8msaESJm8_2rLw5sys',
    },
  },
};
