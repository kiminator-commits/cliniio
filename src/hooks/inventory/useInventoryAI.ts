import { useState, useCallback, useEffect } from 'react';
import { useFacility } from '@/contexts/FacilityContext';
import {
  InventoryAIService,
  InventoryAISettings,
  BarcodeAnalysisResult,
  ImageRecognitionResult,
  DemandForecastingResult,
  CostOptimizationResult,
  SmartCategorizationResult,
  AIInventoryInsight,
} from '@/services/ai/inventoryAIService';

export const useInventoryAI = () => {
  const { getCurrentFacilityId } = useFacility();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiService, setAiService] = useState<InventoryAIService | null>(null);

  // Initialize AI service when user context is available
  useEffect(() => {
    const facilityId = getCurrentFacilityId();
    if (facilityId && !aiService) {
      setAiService(new InventoryAIService(facilityId));
    }
  }, [getCurrentFacilityId, aiService]); // Include aiService dependency

  // Load AI settings
  const loadSettings =
    useCallback(async (): Promise<InventoryAISettings | null> => {
      if (!aiService) {
        setError('AI service not initialized');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        let settings = await aiService.loadSettings();

        if (!settings) {
          // Initialize default settings if none exist
          await aiService.initializeSettings();
          settings = await aiService.loadSettings();
        }

        return settings;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load AI settings';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    }, [aiService]);

  // Save AI settings
  const saveSettings = useCallback(
    async (settings: Partial<InventoryAISettings>): Promise<boolean> => {
      if (!aiService) {
        setError('AI service not initialized');
        return false;
      }

      try {
        setIsLoading(true);
        setError(null);
        const success = await aiService.saveSettings(settings);

        if (!success) {
          setError('Failed to save AI settings');
          return false;
        }

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to save AI settings';
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [aiService]
  );

  // Analyze barcode with AI
  const analyzeBarcode = useCallback(
    async (
      imageFile: File,
      barcodeValue?: string
    ): Promise<BarcodeAnalysisResult | null> => {
      if (!aiService) {
        setError('AI service not initialized');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await aiService.analyzeBarcode(imageFile, barcodeValue);

        if (!result) {
          setError('Failed to analyze barcode');
          return null;
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to analyze barcode';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [aiService]
  );

  // Analyze image with AI
  const analyzeImage = useCallback(
    async (imageFile: File): Promise<ImageRecognitionResult | null> => {
      if (!aiService) {
        setError('AI service not initialized');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await aiService.analyzeImage(imageFile);

        if (!result) {
          setError('Failed to analyze image');
          return null;
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to analyze image';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [aiService]
  );

  // Generate demand forecast
  const generateDemandForecast = useCallback(
    async (
      itemId: string,
      period: 'week' | 'month' | 'quarter' | 'year'
    ): Promise<DemandForecastingResult | null> => {
      if (!aiService) {
        setError('AI service not initialized');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await aiService.generateDemandForecast(itemId, period);

        if (!result) {
          setError('Failed to generate demand forecast');
          return null;
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to generate demand forecast';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [aiService]
  );

  // Generate cost optimization
  const generateCostOptimization = useCallback(
    async (
      optimizationType: 'purchasing' | 'storage' | 'transportation' | 'overall'
    ): Promise<CostOptimizationResult | null> => {
      if (!aiService) {
        setError('AI service not initialized');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result =
          await aiService.generateCostOptimization(optimizationType);

        if (!result) {
          setError('Failed to generate cost optimization');
          return null;
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to generate cost optimization';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [aiService]
  );

  // Smart categorization
  const categorizeItem = useCallback(
    async (
      inputData: string | File,
      dataType: 'text' | 'image' | 'barcode' | 'mixed'
    ): Promise<SmartCategorizationResult | null> => {
      if (!aiService) {
        setError('AI service not initialized');
        return null;
      }

      try {
        setIsLoading(true);
        setError(null);
        const result = await aiService.categorizeItem(inputData, dataType);

        if (!result) {
          setError('Failed to categorize item');
          return null;
        }

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to categorize item';
        setError(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [aiService]
  );

  // Get inventory insights
  const getInventoryInsights = useCallback(async (): Promise<
    AIInventoryInsight[]
  > => {
    if (!aiService) {
      setError('AI service not initialized');
      return [];
    }

    try {
      setIsLoading(true);
      setError(null);
      const insights = await aiService.getInventoryInsights();
      return insights;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get inventory insights';
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [aiService]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    isLoading,
    error,

    // Actions
    loadSettings,
    saveSettings,
    analyzeBarcode,
    analyzeImage,
    generateDemandForecast,
    generateCostOptimization,
    categorizeItem,
    getInventoryInsights,
    clearError,

    // Utility
    isInitialized: !!aiService,
  };
};
