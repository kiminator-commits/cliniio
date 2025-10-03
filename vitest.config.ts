import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/hooks/useInventoryDataAccess': path.resolve(
        __dirname,
        'tests/__mocks__/useInventoryDataAccess.ts'
      ),
      '@/hooks/useInventoryDataManager': path.resolve(
        __dirname,
        'tests/__mocks__/useInventoryDataManager.ts'
      ),
      '@/tests/utils/testUtils': path.resolve(
        __dirname,
        'tests/utils/testUtils.ts'
      ),
    },
  },
  test: {
    setupFiles: './vitest.setup.ts',
    globals: true,
    environment: 'jsdom',
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
      '**/playwright/**',
      '**/*.spec.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      all: true,
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'src/**/*.d.ts',
        'src/**/__mocks__/**',
        'src/**/__tests__/**',
        'src/setupTests.ts',
      ],
    },
  },
});
