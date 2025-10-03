import { StateCreator, create } from 'zustand';
import type {
  BarcodeAnalysisResult,
  ImageRecognitionResult,
  DemandForecastingResult,
  CostOptimizationResult,
  SmartCategorizationResult,
  AIInventoryInsight,
} from '../../types/inventoryAITypes';

export interface InventoryAIState {
  // AI Results
  barcodeResults: BarcodeAnalysisResult[];
  imageResults: ImageRecognitionResult[];
  demandForecastResults: DemandForecastingResult[];
  costOptimizationResults: CostOptimizationResult[];
  categorizationResults: SmartCategorizationResult[];
  inventoryInsights: AIInventoryInsight[];

  // Loading states
  isLoadingBarcode: boolean;
  isLoadingImage: boolean;
  isLoadingDemandForecast: boolean;
  isLoadingCostOptimization: boolean;
  isLoadingCategorization: boolean;
  isLoadingInsights: boolean;

  // Error states
  barcodeError: string | null;
  imageError: string | null;
  demandForecastError: string | null;
  costOptimizationError: string | null;
  categorizationError: string | null;
  insightsError: string | null;

  // Actions to set results
  setBarcodeResults: (results: BarcodeAnalysisResult[]) => void;
  setImageResults: (results: ImageRecognitionResult[]) => void;
  setDemandForecastResults: (results: DemandForecastingResult[]) => void;
  setCostOptimizationResults: (results: CostOptimizationResult[]) => void;
  setCategorizationResults: (results: SmartCategorizationResult[]) => void;
  setInventoryInsights: (insights: AIInventoryInsight[]) => void;

  // Actions to clear results
  clearBarcodeResults: () => void;
  clearImageResults: () => void;
  clearDemandForecastResults: () => void;
  clearCostOptimizationResults: () => void;
  clearCategorizationResults: () => void;
  clearInventoryInsights: () => void;
  clearAllResults: () => void;

  // Actions to set loading states
  setBarcodeLoading: (loading: boolean) => void;
  setImageLoading: (loading: boolean) => void;
  setDemandForecastLoading: (loading: boolean) => void;
  setCostOptimizationLoading: (loading: boolean) => void;
  setCategorizationLoading: (loading: boolean) => void;
  setInsightsLoading: (loading: boolean) => void;

  // Actions to set error states
  setBarcodeError: (error: string | null) => void;
  setImageError: (error: string | null) => void;
  setDemandForecastError: (error: string | null) => void;
  setCostOptimizationError: (error: string | null) => void;
  setCategorizationError: (error: string | null) => void;
  setInsightsError: (error: string | null) => void;
}

export const createInventoryAISlice: StateCreator<
  InventoryAIState,
  [],
  [],
  InventoryAIState
> = (set) => ({
  // AI Results
  barcodeResults: [],
  imageResults: [],
  demandForecastResults: [],
  costOptimizationResults: [],
  categorizationResults: [],
  inventoryInsights: [],

  // Loading states
  isLoadingBarcode: false,
  isLoadingImage: false,
  isLoadingDemandForecast: false,
  isLoadingCostOptimization: false,
  isLoadingCategorization: false,
  isLoadingInsights: false,

  // Error states
  barcodeError: null,
  imageError: null,
  demandForecastError: null,
  costOptimizationError: null,
  categorizationError: null,
  insightsError: null,

  // Actions to set results
  setBarcodeResults: (results) => set({ barcodeResults: results }),
  setImageResults: (results) => set({ imageResults: results }),
  setDemandForecastResults: (results) => set({ demandForecastResults: results }),
  setCostOptimizationResults: (results) => set({ costOptimizationResults: results }),
  setCategorizationResults: (results) => set({ categorizationResults: results }),
  setInventoryInsights: (insights) => set({ inventoryInsights: insights }),

  // Actions to clear results
  clearBarcodeResults: () => set({ barcodeResults: [], barcodeError: null }),
  clearImageResults: () => set({ imageResults: [], imageError: null }),
  clearDemandForecastResults: () => set({ demandForecastResults: [], demandForecastError: null }),
  clearCostOptimizationResults: () => set({ costOptimizationResults: [], costOptimizationError: null }),
  clearCategorizationResults: () => set({ categorizationResults: [], categorizationError: null }),
  clearInventoryInsights: () => set({ inventoryInsights: [], insightsError: null }),
  clearAllResults: () => set({
    barcodeResults: [],
    imageResults: [],
    demandForecastResults: [],
    costOptimizationResults: [],
    categorizationResults: [],
    inventoryInsights: [],
    barcodeError: null,
    imageError: null,
    demandForecastError: null,
    costOptimizationError: null,
    categorizationError: null,
    insightsError: null,
  }),

  // Actions to set loading states
  setBarcodeLoading: (loading) => set({ isLoadingBarcode: loading }),
  setImageLoading: (loading) => set({ isLoadingImage: loading }),
  setDemandForecastLoading: (loading) => set({ isLoadingDemandForecast: loading }),
  setCostOptimizationLoading: (loading) => set({ isLoadingCostOptimization: loading }),
  setCategorizationLoading: (loading) => set({ isLoadingCategorization: loading }),
  setInsightsLoading: (loading) => set({ isLoadingInsights: loading }),

  // Actions to set error states
  setBarcodeError: (error) => set({ barcodeError: error }),
  setImageError: (error) => set({ imageError: error }),
  setDemandForecastError: (error) => set({ demandForecastError: error }),
  setCostOptimizationError: (error) => set({ costOptimizationError: error }),
  setCategorizationError: (error) => set({ categorizationError: error }),
  setInsightsError: (error) => set({ insightsError: error }),
});

// Create the store
export const useInventoryAISlice = create<InventoryAIState>()((...a) => ({
  ...createInventoryAISlice(...a),
}));
