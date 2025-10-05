import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    // Reduce TypeScript checking to improve performance
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Skip type checking during build for faster compilation
    target: 'es2015',
  },
  server: {
    port: 3001,
    strictPort: true,
    watch: {
      ignored: [
        '**/node_modules/**',
        '**/.next/**',
        '**/.vercel/**',
        '**/dist/**',
        '**/.turbo/**',
        '**/.cache/**',
        '**/.git/**',
        '**/coverage/**',
        '**/__tests__/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/docs/**',
        '**/scripts/**',
        '**/*.md',
        '**/supabase/**',
        '**/.husky/**',
        '**/.github/**',
        '**/full_codebase_backup.bundle',
        '**/test-results/**',
        '**/playwright-report/**',
        '**/load-tests/**',
        '**/k6/**',
        '**/api/**',
      ],
      // Reduce polling frequency to prevent excessive reloads
      usePolling: false,
      interval: 3000, // Increased to reduce file system pressure
    },
    // Optimize HMR to reduce unnecessary reloads
    hmr: {
      overlay: false, // Disable error overlay to reduce reloads
      timeout: 30000, // Increase timeout to prevent connection issues
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  build: {
    // Optimize build performance
    target: 'es2015',
    minify: 'esbuild',
    // Exclude API routes from build
    rollupOptions: {
      external: ['/api/**', './src/lib/redisClient.server'],
      input: {
        main: path.resolve(__dirname, 'index.html'),
      },
      output: {
        // Better code splitting
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@mdi/react', 'lucide-react', 'react-icons'],
          utils: ['clsx', 'framer-motion', 'react-hot-toast'],
          data: ['@tanstack/react-query', 'zustand'],
          // Separate login page for faster initial load
          login: ['./src/pages/Login'],
          // Separate error handling for lazy loading
          errors: [
            './src/components/UserFriendlyErrorHandler',
            './src/components/SupportContact',
          ],
        },
        // Optimize chunk naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Enable source maps for debugging
    sourcemap: process.env.NODE_ENV === 'development',
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster dev server
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'zustand',
      'clsx',
    ],
    // Exclude problematic dependencies
    exclude: ['@mdi/js', 'framer-motion', 'redis'],
  },
  // Optimize for development performance
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
  },
});
