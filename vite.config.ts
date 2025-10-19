import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer for production builds
    process.env.ANALYZE === 'true' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  esbuild: {
    // Reduce TypeScript checking to improve performance
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Skip type checking during build for faster compilation
    target: 'es2015',
  },
  server: {
    port: 3001,
    strictPort: false,
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
        // Better code splitting strategy
        manualChunks: (id) => {
          // Vendor chunks for better caching
          if (id.includes('node_modules')) {
            // Core React ecosystem
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // UI libraries
            if (id.includes('@mdi') || id.includes('lucide-react') || id.includes('react-icons') || id.includes('bootstrap')) {
              return 'ui-vendor';
            }
            // Data management
            if (id.includes('@tanstack') || id.includes('zustand') || id.includes('@supabase')) {
              return 'data-vendor';
            }
            // Utilities
            if (id.includes('clsx') || id.includes('framer-motion') || id.includes('date-fns')) {
              return 'utils-vendor';
            }
            // AI/External services
            if (id.includes('openai') || id.includes('@zxing') || id.includes('jspdf')) {
              return 'services-vendor';
            }
            // Everything else
            return 'vendor';
          }
          
          // App chunks for better loading
          if (id.includes('/src/pages/Login')) {
            return 'login-page';
          }
          if (id.includes('/src/pages/Settings')) {
            return 'settings-pages';
          }
          if (id.includes('/src/pages/Inventory')) {
            return 'inventory-pages';
          }
          if (id.includes('/src/pages/Sterilization')) {
            return 'sterilization-pages';
          }
          if (id.includes('/src/pages/KnowledgeHub')) {
            return 'knowledgehub-pages';
          }
          if (id.includes('/src/components/')) {
            return 'components';
          }
          if (id.includes('/src/services/')) {
            return 'services';
          }
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
      'date-fns',
      'react-hot-toast',
    ],
    // Exclude problematic dependencies
    exclude: ['@mdi/js', 'framer-motion', 'redis'],
    // Force optimization for better tree-shaking
    force: true,
  },
  // Optimize for development performance
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
  },
});
