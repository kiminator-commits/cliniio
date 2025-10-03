import { supabase } from '../../../lib/supabaseClient';
import { InventoryAnalyticsService } from './analytics';
import { InventoryAIProviderService } from './provider';
import type { BarcodeAnalysisResult, ImageRecognitionResult } from './types';
import {
  DEFAULT_CONFIDENCE_SCORE,
  DEFAULT_QUALITY_ASSESSMENT,
  DEFAULT_CONDITION_RATING,
} from './inventoryAIConfig';

export class RiskAnalysisService {
  private facilityId: string;
  private analyticsService: InventoryAnalyticsService;
  private providerService: InventoryAIProviderService;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
    this.analyticsService = new InventoryAnalyticsService(facilityId);
    this.providerService = new InventoryAIProviderService(facilityId);
  }

  // Analyze barcode with AI
  async analyzeBarcode(
    imageFile: File,
    barcodeValue?: string
  ): Promise<BarcodeAnalysisResult | null> {
    try {
      const startTime = Date.now();

      // Process image with AI using provider service
      const aiResult = await this.providerService.processImageWithAI();

      const processingTime = Date.now() - startTime;

      // Create result object
      const result: Partial<BarcodeAnalysisResult> = {
        facility_id: this.facilityId,
        barcode_value: barcodeValue,
        barcode_type: this.analyticsService.detectBarcodeType(barcodeValue),
        quality_rating: this.analyticsService.assessBarcodeQuality(
          aiResult.confidence
        ),
        readability_score: aiResult.confidence || DEFAULT_CONFIDENCE_SCORE,
        damage_detected: aiResult.damage_detected || false,
        damage_types: aiResult.damage_types || [],
        confidence_score: aiResult.confidence || DEFAULT_CONFIDENCE_SCORE,
        processing_time_ms: processingTime,
        image_file_path: await this.providerService.uploadImage(imageFile),
        ai_insights: aiResult as Record<string, unknown>,
        recommendations: aiResult.recommendations || [],
      };

      // Save to database
      const { data, error } = await supabase
        .from('inventory_ai_barcode_analysis')
        .insert(result)
        .select()
        .single();

      if (error) {
        console.error('Error saving barcode analysis:', error);
        return null;
      }

      return data as BarcodeAnalysisResult | null;
    } catch (error) {
      console.error('Error analyzing barcode:', error);
      return null;
    }
  }

  // Analyze image with AI
  async analyzeImage(imageFile: File): Promise<ImageRecognitionResult | null> {
    try {
      const startTime = Date.now();

      // Process image with AI using provider service
      const aiResult = await this.providerService.processImageWithAI();

      const processingTime = Date.now() - startTime;

      // Create result object
      const result: Partial<ImageRecognitionResult> = {
        facility_id: this.facilityId,
        recognized_objects: aiResult.objects || [],
        object_confidence_scores: aiResult.confidence_scores || [],
        item_classification: aiResult.classification,
        category_suggestion: aiResult.category,
        quality_assessment:
          (aiResult.quality as 'excellent' | 'good' | 'fair' | 'poor') ||
          DEFAULT_QUALITY_ASSESSMENT,
        damage_detected: aiResult.damage_detected || false,
        damage_description: aiResult.damage_description || undefined,
        condition_rating:
          (aiResult.condition as
            | 'new'
            | 'excellent'
            | 'good'
            | 'fair'
            | 'poor'
            | 'damaged') || DEFAULT_CONDITION_RATING,
        confidence_score: aiResult.confidence || DEFAULT_CONFIDENCE_SCORE,
        processing_time_ms: processingTime,
        image_file_path: await this.providerService.uploadImage(imageFile),
        ai_insights: aiResult as Record<string, unknown>,
        recommendations: aiResult.recommendations || [],
      };

      // Save to database
      const { data, error } = await supabase
        .from('inventory_ai_image_recognition')
        .insert(result)
        .select()
        .single();

      if (error) {
        console.error('Error saving image recognition:', error);
        return null;
      }

      return data as ImageRecognitionResult | null;
    } catch (error) {
      console.error('Error analyzing image:', error);
      return null;
    }
  }
}
