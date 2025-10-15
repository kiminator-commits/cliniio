/**
 * Shared batch code generation service
 * Extracted to break circular dependency between sterilizationStore and batchSlice
 */

export interface BatchCodeGenerationResult {
  batchCode: string;
  success: boolean;
  error?: string;
}

export class BatchCodeService {
  /**
   * Generate a batch code for a sterilization batch
   */
  static async generateBatchCode(
    operator: string,
    toolCount: number
  ): Promise<BatchCodeGenerationResult> {
    try {
      // Generate batch code logic
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const operatorCode = operator.slice(0, 3).toUpperCase();
      const toolCode = toolCount.toString().padStart(2, '0');

      const batchCode = `${operatorCode}${timestamp}${toolCode}`;

      return {
        batchCode,
        success: true,
      };
    } catch (error) {
      return {
        batchCode: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
