import { supabase } from '@/lib/supabase';

export interface SDSGapAnalysis {
  totalChemicals: number;
  existingSDSSheets: number;
  missingSDSSheets: number;
  coveragePercentage: number;
  missingChemicals: MissingChemical[];
  priorityRecommendations: PriorityRecommendation[];
}

export interface MissingChemical {
  name: string;
  category: string;
  manufacturer?: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  estimatedRisk: 'high' | 'medium' | 'low';
}

export interface PriorityRecommendation {
  chemicalName: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedAction: string;
  estimatedTimeToCreate: number; // in minutes
}

import { Database } from '@/types/database.types';
type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];

interface SDSSheet {
  title: string;
  chemical_name?: string;
  status: string;
  priority?: string;
  risk_level?: string;
}

export class SDSAnalysisService {
  /**
   * Analyzes inventory vs existing SDS sheets to identify gaps
   */
  static async analyzeSDSCoverage(): Promise<SDSGapAnalysis> {
    // Fetch inventory items that are likely chemicals
    const { data: inventoryItems, error: inventoryError } = await supabase
      .from('inventory_items')
      .select('name, category, manufacturer, quantity, status')
      .eq('status', 'active')
      .or(
        'category.ilike.%chemical%,category.ilike.%solvent%,category.ilike.%acid%,category.ilike.%base%,category.ilike.%reagent%'
      );

    if (inventoryError) {
      throw new Error('Failed to fetch inventory data');
    }

    // Fetch existing SDS sheets from the new sds_sheets table
    const { data: existingSheets, error: sheetsError } = await supabase
      .from('sds_sheets')
      .select('title, chemical_name, status, priority, risk_level')
      .eq('status', 'published');

    if (sheetsError) {
      throw new Error('Failed to fetch SDS sheet data from database');
    }

    // Analyze the data
    return this.performAnalysis(
      (inventoryItems || []) as unknown as InventoryItem[],
      (existingSheets || []) as SDSSheet[]
    );
  }

  /**
   * Performs the actual gap analysis
   */
  private static performAnalysis(
    inventoryItems: InventoryItem[],
    existingSheets: SDSSheet[]
  ): SDSGapAnalysis {
    // Filter to only chemical-like items
    const chemicalItems = this.filterChemicalItems(inventoryItems);

    // Extract chemical names from existing SDS sheets
    const existingChemicalNames = this.extractChemicalNames(existingSheets);

    // Find missing chemicals
    const missingChemicals = this.identifyMissingChemicals(
      chemicalItems,
      existingChemicalNames
    );

    // Generate priority recommendations
    const priorityRecommendations =
      this.generatePriorityRecommendations(missingChemicals);

    const totalChemicals = chemicalItems.length;
    const existingSDSSheets = existingSheets.length;
    const missingSDSSheets = missingChemicals.length;
    const coveragePercentage =
      totalChemicals > 0
        ? Math.round(
            ((totalChemicals - missingSDSSheets) / totalChemicals) * 100
          )
        : 0;

    return {
      totalChemicals,
      existingSDSSheets,
      missingSDSSheets,
      coveragePercentage,
      missingChemicals,
      priorityRecommendations,
    };
  }

  /**
   * Filters inventory items to only include chemical-like items
   */
  private static filterChemicalItems(items: InventoryItem[]): InventoryItem[] {
    return items.filter((item) => {
      const name = (item.name || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      const quantity = item.quantity || 0;

      return (
        quantity > 0 &&
        (name.includes('acid') ||
          name.includes('base') ||
          name.includes('solvent') ||
          name.includes('reagent') ||
          name.includes('chemical') ||
          category.includes('chemical') ||
          category.includes('solvent') ||
          category.includes('reagent'))
      );
    });
  }

  /**
   * Extracts chemical names from existing SDS sheets
   */
  private static extractChemicalNames(sheets: SDSSheet[]): string[] {
    return sheets.map((sheet) => {
      // Use chemical_name field if available, otherwise fall back to title
      const chemicalName = sheet.chemical_name || sheet.title || '';
      return chemicalName.trim();
    });
  }

  /**
   * Identifies which chemicals are missing SDS sheets
   */
  private static identifyMissingChemicals(
    chemicalItems: InventoryItem[],
    existingNames: string[]
  ): MissingChemical[] {
    return chemicalItems
      .filter((item) => {
        const itemName = item.name?.toLowerCase() || '';
        // Check if any existing sheet name contains this chemical name
        return !existingNames.some(
          (existingName) =>
            existingName.toLowerCase().includes(itemName) ||
            itemName.includes(existingName.toLowerCase())
        );
      })
      .map((item) => ({
        name: item.name!,
        category: item.category!,
        manufacturer: (item.data as { manufacturer?: string })?.manufacturer,
        priority: this.calculatePriority(item),
        reason: this.generateMissingReason(item),
        estimatedRisk: this.estimateRisk(item),
      }));
  }

  /**
   * Calculates priority for missing SDS sheets
   */
  private static calculatePriority(
    item: InventoryItem
  ): 'high' | 'medium' | 'low' {
    const name = (item.name || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const quantity = item.quantity || 0;

    if (
      quantity > 100 ||
      name.includes('acid') ||
      name.includes('base') ||
      name.includes('toxic') ||
      name.includes('hazardous') ||
      category.includes('dangerous')
    ) {
      return 'high';
    } else if (
      quantity > 50 ||
      name.includes('solvent') ||
      name.includes('reagent') ||
      category.includes('chemical')
    ) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generates reason for missing SDS sheet
   */
  private static generateMissingReason(item: InventoryItem): string {
    const name = (item.name || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const quantity = item.quantity || 0;

    if (
      quantity > 100 ||
      name.includes('acid') ||
      name.includes('base') ||
      name.includes('toxic') ||
      name.includes('hazardous') ||
      category.includes('dangerous')
    ) {
      return 'High-risk chemical with significant quantity - immediate SDS required for safety compliance';
    } else if (name.includes('reagent') || category.includes('chemical')) {
      return 'Chemical reagent or laboratory chemical - SDS needed for proper handling procedures';
    } else {
      return 'Standard chemical inventory item - SDS recommended for complete safety documentation';
    }
  }

  /**
   * Estimates risk level based on chemical properties
   */
  private static estimateRisk(item: InventoryItem): 'high' | 'medium' | 'low' {
    const name = (item.name || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const quantity = item.quantity || 0;

    if (
      quantity > 100 ||
      name.includes('acid') ||
      name.includes('base') ||
      name.includes('toxic') ||
      name.includes('hazardous') ||
      category.includes('dangerous')
    ) {
      return 'high';
    } else if (name.includes('reagent') || category.includes('chemical')) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  /**
   * Generates priority recommendations for creating missing SDS sheets
   */
  private static generatePriorityRecommendations(
    missingChemicals: MissingChemical[]
  ): PriorityRecommendation[] {
    return missingChemicals
      .sort((a, b) => {
        // Sort by priority: high > medium > low
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, 10) // Top 10 recommendations
      .map((chemical) => ({
        chemicalName: chemical.name,
        priority: chemical.priority,
        reason: chemical.reason,
        suggestedAction: `Create SDS sheet for ${chemical.name}`,
        estimatedTimeToCreate: this.estimateCreationTime(chemical),
      }));
  }

  /**
   * Estimates time to create SDS sheet based on complexity
   */
  private static estimateCreationTime(chemical: MissingChemical): number {
    const baseTime = 30; // Base time in minutes
    let complexityMultiplier = 1;

    if (chemical.priority === 'high') {
      complexityMultiplier = 1.5;
    } else if (chemical.priority === 'medium') {
      complexityMultiplier = 1.2;
    }

    if (chemical.estimatedRisk === 'high') {
      complexityMultiplier += 0.3;
    }

    return Math.round(baseTime * complexityMultiplier);
  }

  /**
   * Gets summary statistics for the AI Assistant
   */
  static async getSummaryStats(): Promise<{
    totalChemicals: number;
    coveragePercentage: number;
    highPriorityMissing: number;
    estimatedTotalTime: number;
  }> {
    const analysis = await this.analyzeSDSCoverage();

    const highPriorityMissing = analysis.missingChemicals.filter(
      (c) => c.priority === 'high'
    ).length;

    const estimatedTotalTime = analysis.priorityRecommendations.reduce(
      (total, rec) => total + rec.estimatedTimeToCreate,
      0
    );

    return {
      totalChemicals: analysis.totalChemicals,
      coveragePercentage: analysis.coveragePercentage,
      highPriorityMissing,
      estimatedTotalTime,
    };
  }

  /**
   * Saves analysis results to the database
   */
  static async saveAnalysisResults(
    facilityId: string,
    analysis: SDSGapAnalysis
  ): Promise<void> {
    // Save the gap analysis
    const { data: gapAnalysis, error: gapError } = await supabase
      .from('sds_gap_analysis')
      .insert({
        facility_id: facilityId,
        total_chemicals: analysis.totalChemicals,
        existing_sds_sheets: analysis.existingSDSSheets,
        missing_sds_sheets: analysis.missingSDSSheets,
        coverage_percentage: analysis.coveragePercentage,
        high_priority_missing: analysis.missingChemicals.filter(
          (c) => c.priority === 'high'
        ).length,
        medium_priority_missing: analysis.missingChemicals.filter(
          (c) => c.priority === 'medium'
        ).length,
        low_priority_missing: analysis.missingChemicals.filter(
          (c) => c.priority === 'low'
        ).length,
        estimated_total_time: analysis.priorityRecommendations.reduce(
          (total, rec) => total + rec.estimatedTimeToCreate,
          0
        ),
        compliance_score: analysis.coveragePercentage,
      })
      .select()
      .single();

    if (gapError) {
      throw new Error('Failed to save gap analysis');
    }

    // Save individual chemical recommendations
    if (analysis.priorityRecommendations.length > 0) {
      const recommendations = analysis.priorityRecommendations.map((rec) => {
        const missingChemical = analysis.missingChemicals.find(
          (c) => c.name === rec.chemicalName
        );
        return {
          facility_id: facilityId,
          gap_analysis_id: gapAnalysis.id,
          chemical_name: rec.chemicalName,
          category: missingChemical?.category || 'unknown',
          manufacturer: missingChemical?.manufacturer,
          priority: rec.priority,
          risk_level: missingChemical?.estimatedRisk || 'medium',
          reason: rec.reason,
          suggested_action: rec.suggestedAction,
          estimated_time_to_create: rec.estimatedTimeToCreate,
          ai_confidence_score: 0.8, // Default confidence
          ai_reasoning:
            'AI analysis based on inventory and existing SDS coverage',
        };
      });

      const { error: recError } = await supabase
        .from('sds_chemical_recommendations')
        .insert(recommendations);

      if (recError) {
        throw new Error('Failed to save recommendations');
      }
    }
  }
}
