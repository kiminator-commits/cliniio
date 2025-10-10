import { supabase } from '../lib/supabaseClient';

export interface BarcodeCount {
  id: string;
  code: string;
  count: number;
  created_at: string | null;
}

export interface BarcodeCountResult {
  success: boolean;
  message: string;
  count?: number;
  isMaxReached?: boolean;
}

export class BarcodeCountService {
  private static readonly MAX_SCANS = 200;

  /**
   * Get current count for a barcode
   */
  static async getBarcodeCount(barcode: string): Promise<number> {
    try {
      const { data: _data, error } = await supabase
        .from('barcode_counts')
        .select('count')
        .eq('code', barcode)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found"
        throw new Error(`Failed to get barcode count: ${error.message}`);
      }

      return _data?.count || 0;
    } catch (error) {
      console.error('Error getting barcode count:', error);
      return 0;
    }
  }

  /**
   * Increment barcode count and check if max is reached
   */
  static async incrementBarcodeCount(
    barcode: string
  ): Promise<BarcodeCountResult> {
    try {
      // Get current count
      const currentCount = await this.getBarcodeCount(barcode);

      if (currentCount >= this.MAX_SCANS) {
        return {
          success: false,
          message: `Maximum scan count (${this.MAX_SCANS}) reached for barcode ${barcode}`,
          count: currentCount,
          isMaxReached: true,
        };
      }

      const newCount = currentCount + 1;
      const now = new Date().toISOString();

      // Upsert the barcode count
      const { data: _data, error } = await supabase
        .from('barcode_counts')
        .upsert({
          code: barcode,
          count: newCount,
          created_at: now,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update barcode count: ${error.message}`);
      }

      return {
        success: true,
        message: `Barcode ${barcode} scanned. Count: ${newCount}/${this.MAX_SCANS}`,
        count: newCount,
        isMaxReached: newCount >= this.MAX_SCANS,
      };
    } catch (error) {
      console.error('Error incrementing barcode count:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update barcode count',
      };
    }
  }

  /**
   * Reset barcode count (for admin use)
   */
  static async resetBarcodeCount(barcode: string): Promise<BarcodeCountResult> {
    try {
      const { data: _data, error } = await supabase
        .from('barcode_counts')
        .upsert({
          code: barcode,
          count: 0,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to reset barcode count: ${error.message}`);
      }

      return {
        success: true,
        message: `Barcode ${barcode} count reset to 0`,
        count: 0,
        isMaxReached: false,
      };
    } catch (error) {
      console.error('Error resetting barcode count:', error);
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to reset barcode count',
      };
    }
  }

  /**
   * Get all barcode counts for a facility
   */
  static async getAllBarcodeCounts(): Promise<BarcodeCount[]> {
    try {
      const { data: _data, error } = await supabase
        .from('barcode_counts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to get barcode counts: ${error.message}`);
      }

      return (_data || []).map((item) => ({
        id: item.id,
        code: item.code,
        count: item.count,
        created_at: item.created_at,
      }));
    } catch (error) {
      console.error('Error getting all barcode counts:', error);
      return [];
    }
  }
}
