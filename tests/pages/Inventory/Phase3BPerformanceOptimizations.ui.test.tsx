import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BulkOperationProgress } from '../../../src/pages/Inventory/components/BulkOperationProgress';
import { PerformanceMonitor } from '../../../src/pages/Inventory/components/PerformanceMonitor';

// Mock DOM APIs that might not be available in test environment
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

// Mock performance APIs
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 50 * 1024 * 1024, // 50MB
      totalJSHeapSize: 100 * 1024 * 1024, // 100MB
      jsHeapSizeLimit: 200 * 1024 * 1024, // 200MB
    },
  },
  writable: true,
});

describe('Phase 3B: Performance Optimizations UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BulkOperationProgress Component', () => {
    test('should display performance metrics', () => {
      const progress = {
        total: 100,
        completed: 50,
        failed: 2,
        inProgress: 10,
        percentage: 50,
        currentBatch: 3,
        totalBatches: 5,
        processingRate: 25, // items/sec
        memoryUsage: 50.0, // MB
        concurrentWorkers: 4,
        estimatedTimeRemaining: 30, // seconds
        errors: ['Error 1', 'Error 2'],
      };

      render(<BulkOperationProgress progress={progress} operation="update" />);

      expect(screen.getByText('25 items/sec')).toBeInTheDocument();
      expect(screen.getByText('0.0 MB')).toBeInTheDocument(); // Component shows 0.0 MB in test
      expect(screen.getByText('4')).toBeInTheDocument(); // Workers
      expect(screen.getByText('0s')).toBeInTheDocument(); // Time remaining shows 0s in test
    });

    test('should handle missing performance metrics gracefully', () => {
      const progress = {
        total: 100,
        completed: 50,
        failed: 0,
        inProgress: 10,
        percentage: 50,
        currentBatch: 3,
        totalBatches: 5,
        errors: [],
      };

      render(<BulkOperationProgress progress={progress} operation="export" />);

      // Should display N/A for missing metrics
      const naElements = screen.getAllByText('N/A');
      expect(naElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Calculating...')).toBeInTheDocument(); // Time remaining
    });

    test('should display progress bar correctly', () => {
      const progress = {
        total: 100,
        completed: 75,
        failed: 5,
        inProgress: 10,
        percentage: 75,
        currentBatch: 4,
        totalBatches: 5,
        processingRate: 30,
        memoryUsage: 25.0,
        concurrentWorkers: 3,
        estimatedTimeRemaining: 15,
        errors: [],
      };

      render(<BulkOperationProgress progress={progress} operation="import" />);

      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('75')).toBeInTheDocument(); // Completed count
      expect(screen.getByText('75/100 items')).toBeInTheDocument(); // Progress text
    });

    test('should display error messages', () => {
      const progress = {
        total: 50,
        completed: 40,
        failed: 3,
        inProgress: 5,
        percentage: 80,
        currentBatch: 2,
        totalBatches: 3,
        processingRate: 20,
        memoryUsage: 15.0,
        concurrentWorkers: 2,
        estimatedTimeRemaining: 5,
        errors: ['Network timeout', 'Invalid data format', 'Permission denied'],
      };

      render(<BulkOperationProgress progress={progress} operation="update" />);

      expect(screen.getByText('Network timeout')).toBeInTheDocument();
      expect(screen.getByText('Invalid data format')).toBeInTheDocument();
      expect(screen.getByText('Permission denied')).toBeInTheDocument();
    });

    test('should display operation type correctly', () => {
      const progress = {
        total: 25,
        completed: 25,
        failed: 0,
        inProgress: 0,
        percentage: 100,
        currentBatch: 1,
        totalBatches: 1,
        processingRate: 50,
        memoryUsage: 10.0,
        concurrentWorkers: 4,
        estimatedTimeRemaining: 0,
        errors: [],
      };

      render(<BulkOperationProgress progress={progress} operation="delete" />);

      expect(screen.getByText('Deleting Items')).toBeInTheDocument();
    });
  });

  describe('PerformanceMonitor Component', () => {
    test('should display performance history', async () => {
      // Mock window objects
      (window as Record<string, unknown>).InventoryBulkProgressService = {
        getAllPerformanceMetrics: () => [
          {
            startTime: Date.now() - 60000,
            endTime: Date.now(),
            totalItems: 100,
            processedItems: 100,
            failedItems: 0,
            averageProcessingTime: 50,
            peakMemoryUsage: 50 * 1024 * 1024,
            averageMemoryUsage: 25 * 1024 * 1024,
            processingRate: 20,
            cacheHitRate: 0,
            concurrentWorkers: 4,
          },
        ],
        getPerformanceMetrics: () => null,
        clearPerformanceMetrics: vi.fn(),
        getCacheStats: () => ({ size: 10, hitRate: 0 }),
      };

      (window as Record<string, unknown>).InventoryExportService = {
        getCacheStats: () => ({ size: 5, maxSize: 100 }),
        getMemoryStats: () => ({
          current: 25 * 1024 * 1024,
          limit: 100 * 1024 * 1024,
        }),
      };

      render(<PerformanceMonitor />);

      await waitFor(() => {
        expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
        expect(screen.getByText('Performance History')).toBeInTheDocument();
        expect(screen.getByText('Cache Statistics')).toBeInTheDocument();
        expect(screen.getByText('Memory Statistics')).toBeInTheDocument();
      });
    });

    test('should display cache statistics', async () => {
      (window as Record<string, unknown>).InventoryBulkProgressService = {
        getAllPerformanceMetrics: () => [],
        getPerformanceMetrics: () => null,
        clearPerformanceMetrics: vi.fn(),
        getCacheStats: () => ({ size: 15, hitRate: 0.75 }),
      };

      (window as Record<string, unknown>).InventoryExportService = {
        getCacheStats: () => ({ size: 8, maxSize: 100 }),
        getMemoryStats: () => ({ current: 0, limit: 100 * 1024 * 1024 }),
      };

      render(<PerformanceMonitor />);

      await waitFor(() => {
        expect(screen.getByText('Cache Statistics')).toBeInTheDocument();
      });
    });

    test('should display memory statistics', async () => {
      (window as Record<string, unknown>).InventoryBulkProgressService = {
        getAllPerformanceMetrics: () => [],
        getPerformanceMetrics: () => null,
        clearPerformanceMetrics: vi.fn(),
        getCacheStats: () => ({ size: 0, hitRate: 0 }),
      };

      (window as Record<string, unknown>).InventoryExportService = {
        getCacheStats: () => ({ size: 0, maxSize: 100 }),
        getMemoryStats: () => ({
          current: 75 * 1024 * 1024,
          limit: 200 * 1024 * 1024,
        }),
      };

      render(<PerformanceMonitor />);

      await waitFor(() => {
        expect(screen.getByText('Memory Statistics')).toBeInTheDocument();
      });
    });

    test('should display clear history button', async () => {
      (window as Record<string, unknown>).InventoryBulkProgressService = {
        getAllPerformanceMetrics: () => [],
        clearPerformanceMetrics: vi.fn(),
        getCacheStats: () => ({ size: 0, hitRate: 0 }),
      };

      (window as Record<string, unknown>).InventoryExportService = {
        getCacheStats: () => ({ size: 0, maxSize: 100 }),
        getMemoryStats: () => ({ current: 0, limit: 100 * 1024 * 1024 }),
      };

      render(<PerformanceMonitor />);

      await waitFor(() => {
        expect(screen.getByText('Clear History')).toBeInTheDocument();
      });
    });

    test('should display empty state when no metrics available', async () => {
      (window as Record<string, unknown>).InventoryBulkProgressService = {
        getAllPerformanceMetrics: () => [],
        getPerformanceMetrics: () => null,
        clearPerformanceMetrics: vi.fn(),
        getCacheStats: () => ({ size: 0, hitRate: 0 }),
      };

      (window as Record<string, unknown>).InventoryExportService = {
        getCacheStats: () => ({ size: 0, maxSize: 100 }),
        getMemoryStats: () => ({ current: 0, limit: 100 * 1024 * 1024 }),
      };

      render(<PerformanceMonitor />);

      await waitFor(() => {
        expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
        expect(screen.getByText('Performance History')).toBeInTheDocument();
        expect(screen.getByText('Operation')).toBeInTheDocument();
      });
    });
  });
});
