import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';

// Extend Vitest expect with jest-axe accessibility matchers
import 'jest-axe/extend-expect';

// Polyfills for Node
global.TextEncoder = TextEncoder as any;
global.TextDecoder = TextDecoder as any;

// Cleanup after each test
afterEach(() => {
  cleanup();
});
