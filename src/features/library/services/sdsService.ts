import { SDSSheet } from '../libraryTypes';
import { supabase } from '@/lib/supabase';

// Live SDS data integration - queries real Supabase data

export interface SDSService {
  getAllSDSSheets(): Promise<SDSSheet[]>;
  getSDSSheetById(id: string): Promise<SDSSheet | null>;
  searchSDSSheets(query: string): Promise<SDSSheet[]>;
  getSDSSheetsByCategory(): Promise<SDSSheet[]>;
}

class SDSServiceImpl implements SDSService {
  async getAllSDSSheets(): Promise<SDSSheet[]> {
    try {
      const { data, error } = await supabase
        .from('sds_sheets')
        .select(
          'id, title, chemical_name, cas_number, health_hazards, physical_hazards, status'
        )
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching SDS sheets:', error);
        return [];
      }

      return (data || []).map((row: Record<string, unknown>) =>
        this.mapDatabaseRowToSDSSheet(
          row as {
            id: string;
            title?: string;
            chemical_name?: string;
            cas_number?: string;
            health_hazards?: string[];
            physical_hazards?: string[];
          }
        )
      );
    } catch (error) {
      console.error('Error in getAllSDSSheets:', error);
      return [];
    }
  }

  async getSDSSheetById(id: string): Promise<SDSSheet | null> {
    try {
      const { data, error } = await supabase
        .from('sds_sheets')
        .select(
          'id, title, chemical_name, cas_number, health_hazards, physical_hazards, status'
        )
        .eq('id', id)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Error fetching SDS sheet by ID:', error);
        return null;
      }

      return data
        ? this.mapDatabaseRowToSDSSheet(
            data as {
              id: string;
              title?: string;
              chemical_name?: string;
              cas_number?: string;
              health_hazards?: string[];
              physical_hazards?: string[];
            }
          )
        : null;
    } catch (error) {
      console.error('Error in getSDSSheetById:', error);
      return null;
    }
  }

  async searchSDSSheets(query: string): Promise<SDSSheet[]> {
    try {
      if (!query.trim()) {
        return this.getAllSDSSheets();
      }

      const { data, error } = await supabase
        .from('sds_sheets')
        .select(
          'id, title, chemical_name, cas_number, health_hazards, physical_hazards, status'
        )
        .eq('status', 'published')
        .or(
          `title.ilike.%${query}%,chemical_name.ilike.%${query}%,cas_number.ilike.%${query}%`
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error searching SDS sheets:', error);
        return [];
      }

      return (data || []).map((row: Record<string, unknown>) =>
        this.mapDatabaseRowToSDSSheet(
          row as {
            id: string;
            title?: string;
            chemical_name?: string;
            cas_number?: string;
            health_hazards?: string[];
            physical_hazards?: string[];
          }
        )
      );
    } catch (error) {
      console.error('Error in searchSDSSheets:', error);
      return [];
    }
  }

  async getSDSSheetsByCategory(): Promise<SDSSheet[]> {
    try {
      // For now, return all sheets since we don't have category filtering in the current schema
      // In a real implementation, you would filter by category if the schema supports it
      return this.getAllSDSSheets();
    } catch (error) {
      console.error('Error in getSDSSheetsByCategory:', error);
      return [];
    }
  }

  /**
   * Maps database row to SDSSheet interface
   */
  private mapDatabaseRowToSDSSheet(row: {
    id: string;
    title?: string;
    chemical_name?: string;
    cas_number?: string;
    health_hazards?: string[];
    physical_hazards?: string[];
  }): SDSSheet {
    // Combine health and physical hazards into a single hazards array
    const hazards = [
      ...(Array.isArray(row.health_hazards) ? row.health_hazards : []),
      ...(Array.isArray(row.physical_hazards) ? row.physical_hazards : []),
    ].filter(Boolean);

    return {
      id: row.id,
      title: row.title || 'Untitled SDS Sheet',
      chemicalName: row.chemical_name || 'Unknown Chemical',
      casNumber: row.cas_number || undefined,
      hazards: hazards.length > 0 ? hazards : undefined,
    };
  }
}

// Export singleton instance
export const sdsService = new SDSServiceImpl();
