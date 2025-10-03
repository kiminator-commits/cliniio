import { BulkProgress, ProgressFormatterResult } from './types';

export class ProgressFormatterService {
  /**
   * Create a progress formatter for UI display
   */
  static formatProgress(progress: BulkProgress): ProgressFormatterResult {
    const status = `${progress.completed}/${progress.total} items processed`;
    const details = `Batch ${progress.currentBatch}/${progress.totalBatches} • ${progress.percentage}% complete`;

    let timeRemaining: string | undefined;
    if (progress.estimatedTimeRemaining) {
      const minutes = Math.floor(progress.estimatedTimeRemaining / 60000);
      const seconds = Math.floor(
        (progress.estimatedTimeRemaining % 60000) / 1000
      );
      timeRemaining =
        minutes > 0
          ? `${minutes}m ${seconds}s remaining`
          : `${seconds}s remaining`;
    }

    let performance: string | undefined;
    if (progress.processingRate && progress.memoryUsage) {
      const memoryMB = Math.round(progress.memoryUsage / (1024 * 1024));
      performance = `${progress.processingRate} items/sec • ${memoryMB}MB RAM • ${progress.concurrentWorkers} workers`;
    }

    return { status, details, timeRemaining, performance };
  }

  /**
   * Format progress as a simple string
   */
  static formatProgressSimple(progress: BulkProgress): string {
    return `${progress.completed}/${progress.total} (${progress.percentage}%)`;
  }

  /**
   * Format progress as a detailed string
   */
  static formatProgressDetailed(progress: BulkProgress): string {
    const base = `${progress.completed}/${progress.total} items processed`;
    const batch = `Batch ${progress.currentBatch}/${progress.totalBatches}`;
    const percentage = `${progress.percentage}% complete`;

    let details = `${base} • ${batch} • ${percentage}`;

    if (progress.estimatedTimeRemaining) {
      const minutes = Math.floor(progress.estimatedTimeRemaining / 60000);
      const seconds = Math.floor(
        (progress.estimatedTimeRemaining % 60000) / 1000
      );
      const time =
        minutes > 0
          ? `${minutes}m ${seconds}s remaining`
          : `${seconds}s remaining`;
      details += ` • ${time}`;
    }

    if (progress.processingRate) {
      details += ` • ${progress.processingRate} items/sec`;
    }

    return details;
  }
}
