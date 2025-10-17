import { supabase } from '../../../lib/supabaseClient';
import { InventoryAIProviderService } from './provider';
import type {
  CostOptimizationResult,
  SmartCategorizationResult,
} from './types';
import { DATA_ANALYSIS_PERIOD } from './inventoryAIConfig';

export class OptimizationService {
  private facilityId: string;
  private providerService: InventoryAIProviderService;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
    this.providerService = new InventoryAIProviderService(facilityId);
  }

  // Generate cost optimization insights
  async generateCostOptimization(
    optimizationType: 'purchasing' | 'storage' | 'transportation' | 'overall'
  ): Promise<CostOptimizationResult | null> {
    try {
      const startTime = Date.now();

      // Generate optimization using provider service
      const optimization =
        await this.providerService.generateCostOptimizationWithAI();

      const processingTime = Date.now() - startTime;

      // Create result object
      const result: Partial<CostOptimizationResult> = {
        facility_id: this.facilityId,
        optimization_type: optimizationType,
        current_cost: optimization.current_cost,
        optimized_cost: optimization.optimized_cost,
        cost_savings: optimization.cost_savings,
        savings_percentage: optimization.savings_percentage,
        optimization_factors: optimization.optimization_factors,
        recommended_actions: optimization.recommended_actions,
        implementation_timeline: optimization.implementation_timeline,
        risk_assessment: optimization.risk_assessment,
        confidence_score: optimization.confidence_score,
        processing_time_ms: processingTime,
        data_analysis_period: DATA_ANALYSIS_PERIOD,
        roi_estimate: optimization.roi_estimate,
      };

      // Save to database
      const { data, error } = await supabase
        .from('inventory_ai_cost_optimization')
        .insert(result)
        .select()
        .single();

      if (error) {
        console.error('Error saving cost optimization:', error);
        return null;
      }

      return data as CostOptimizationResult | null;
    } catch (error) {
      console.error('Error generating cost optimization:', error);
      return null;
    }
  }

  // Smart categorization
  async categorizeItem(
    inputData: string | File,
    dataType: 'text' | 'image' | 'barcode' | 'mixed'
  ): Promise<SmartCategorizationResult | null> {
    try {
      const startTime = Date.now();

      // Process input with AI using provider service
      const categorization =
        await this.providerService.generateSmartCategorizationWithAI();

      const processingTime = Date.now() - startTime;

      // Create result object
      const result: Partial<SmartCategorizationResult> = {
        facility_id: this.facilityId,
        suggested_category: categorization.suggested_category,
        suggested_subcategory: categorization.suggested_subcategory,
        category_confidence_score: categorization.category_confidence_score,
        alternative_categories: categorization.alternative_categories,
        categorization_reasoning: categorization.categorization_reasoning,
        form_fill_suggestions: categorization.form_fill_suggestions,
        workflow_recommendations: categorization.workflow_recommendations,
        confidence_score: categorization.confidence_score,
        processing_time_ms: processingTime,
        input_data_type: dataType,
        learning_feedback: false,
        user_acceptance: undefined,
      };

      // Save to database
      const { data, error } = await supabase
        .from('inventory_ai_smart_categorization')
        .insert(result)
        .select()
        .single();

      if (error) {
        console.error('Error saving smart categorization:', error);
        return null;
      }

      return data as SmartCategorizationResult | null;
    } catch (error) {
      console.error('Error categorizing item:', error);
      return null;
    }
  }
}
