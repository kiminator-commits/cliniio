import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PerformanceMonitor } from '../../../src/pages/Inventory/components/PerformanceMonitor';

// Mock DOM APIs that might not be available in test environment
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('Phase 3B: Performance Optimizations Interactions', () => {
  describe('PerformanceMonitor Component Interactions', () => {
    test('should handle clear history button click', async () => {
      const mockClearMetrics = vi.fn();

      (window as Record<string, unknown>).InventoryBulkProgressService = {
        getAllPerformanceMetrics: () => [],
        clearPerformanceMetrics: mockClearMetrics,
        getCacheStats: () => ({ size: 0, hitRate: 0 }),
      };

      (window as Record<string, unknown>).InventoryExportService = {
        getCacheStats: () => ({ size: 0, maxSize: 100 }),
        getMemoryStats: () => ({ current: 0, limit: 100 * 1024 * 1024 }),
      };

      render(<PerformanceMonitor />);

      await waitFor(() => {
        expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
      });

      const clearButton = screen.getByText('Clear History');
      fireEvent.click(clearButton);

      expect(mockClearMetrics).toHaveBeenCalled();
    });

    test('should display performance metrics when available', async () => {
      (window as Record<string, unknown>).InventoryBulkProgressService = {
        getAllPerformanceMetrics: () => [
          {
            startTime: Date.now() - 60000,
            endTime: Date.now(),
            totalItems: 100,
            processedItems: 100,
            failedItems: 0,
            averageProcessingTime: 50,
            processingRate: 2,
            peakMemoryUsage: 25 * 1024 * 1024,
            concurrentWorkers: 4,
            operationType: 'export',
          },
        ],
        getCacheStats: () => ({ size: 5, hitRate: 85 }),
        getMemoryStats: () => ({
          current: 25 * 1024 * 1024,
          limit: 100 * 1024 * 1024,
        }),
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
        expect(screen.getByText('Performance History')).toBeInTheDocument();
        expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
      });
    });

    test('should display cache statistics correctly', async () => {
      (window as Record<string, unknown>).InventoryBulkProgressService = {
        getAllPerformanceMetrics: () => [],
        getCacheStats: () => ({ size: 10, hitRate: 75 }),
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
        expect(screen.getByText('Cache Statistics')).toBeInTheDocument();
        expect(screen.getByText('10')).toBeInTheDocument(); // Bulk Cache Size
        expect(screen.getByText('75%')).toBeInTheDocument(); // Cache Hit Rate
      });
    });

    test('should display memory statistics correctly', async () => {
      (window as Record<string, unknown>).InventoryBulkProgressService = {
        getAllPerformanceMetrics: () => [],
        getCacheStats: () => ({ size: 0, hitRate: 0 }),
      };

      (window as Record<string, unknown>).InventoryExportService = {
        getCacheStats: () => ({ size: 0, maxSize: 100 }),
        getMemoryStats: () => ({
          current: 50 * 1024 * 1024,
          limit: 200 * 1024 * 1024,
        }),
      };

      render(<PerformanceMonitor />);

      await waitFor(() => {
        expect(screen.getByText('Memory Statistics')).toBeInTheDocument();
        expect(screen.getByText('50.0 MB')).toBeInTheDocument(); // Current Memory
        expect(screen.getByText('200.0 MB')).toBeInTheDocument(); // Memory Limit
      });
    });
  });
});
