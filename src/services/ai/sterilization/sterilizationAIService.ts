import { SettingsManager } from './settingsManager';
import { AnalysisServices } from './analysisServices';
import { OptimizationServices } from './optimizationServices';
import { AnalyticsServices } from './analyticsServices';
import { ComplianceServices } from './complianceServices';
import { OpenAIService } from './openaiService';
import {
  ToolConditionAssessment,
  CycleOptimization,
  SmartWorkflowSuggestion,
  PredictiveAnalytics,
  SterilizationAIInsight,
  ComplianceAnalysis,
  ToolHistory,
  SterilizationAISettings,
} from './types';

export class SterilizationAIService {
  private facilityId: string;
  private settingsManager: SettingsManager;
  private analysisServices: AnalysisServices;
  private optimizationServices: OptimizationServices;
  private analyticsServices: AnalyticsServices;
  private complianceServices: ComplianceServices;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
    this.settingsManager = new SettingsManager(facilityId);
    this.analysisServices = new AnalysisServices(facilityId);
    this.optimizationServices = new OptimizationServices(facilityId);
    this.analyticsServices = new AnalyticsServices(facilityId);
    this.complianceServices = new ComplianceServices(facilityId);
  }

  // Initialize the service by loading settings
  async initialize(): Promise<boolean> {
    try {
      const settings = await this.settingsManager.loadSettings();
      return settings !== null;
    } catch (error) {
      console.error('Failed to initialize SterilizationAIService:', error);
      return false;
    }
  }

  // Load AI settings for the facility
  async loadSettings() {
    return this.settingsManager.loadSettings();
  }

  // Save AI settings to database
  async saveSettings(settings: SterilizationAISettings) {
    return this.settingsManager.saveSettings(settings);
  }

  // Real Computer Vision & Image Recognition
  async analyzeToolCondition(
    toolId?: string,
    imageFile?: File
  ): Promise<ToolConditionAssessment> {
    // Check if the AI feature is enabled before proceeding
    if (!this.settingsManager.isToolConditionAssessmentEnabled()) {
      throw new Error('Tool condition assessment is not enabled');
    }

    // Get the OpenAI API key from settings - required for AI analysis
    const openaiApiKey = this.settingsManager.getOpenAIKey();
    // Delegate to analysis service which handles the actual AI processing
    return this.analysisServices.analyzeToolCondition(
      toolId,
      imageFile,
      openaiApiKey
    );
  }

  // Real barcode quality detection
  async detectBarcodeQuality(imageFile?: File) {
    if (!this.settingsManager.isBarcodeQualityDetectionEnabled()) {
      throw new Error('Barcode quality detection is not enabled');
    }

    const openaiApiKey = this.settingsManager.getOpenAIKey();
    return this.analysisServices.detectBarcodeQuality(imageFile, openaiApiKey);
  }

  // Real tool type recognition
  async identifyToolType(imageFile?: File) {
    if (!this.settingsManager.isToolTypeRecognitionEnabled()) {
      throw new Error('Tool type recognition is not enabled');
    }

    const openaiApiKey = this.settingsManager.getOpenAIKey();
    return this.analysisServices.identifyToolType(imageFile, openaiApiKey);
  }

  // Real cycle optimization with historical data
  async getCycleOptimization(cycleId: string): Promise<CycleOptimization> {
    // Verify the optimization feature is enabled before processing
    if (!this.settingsManager.isCycleOptimizationEnabled()) {
      throw new Error('Cycle optimization is not enabled');
    }

    // Get API key for AI-powered optimization analysis
    const openaiApiKey = this.settingsManager.getOpenAIKey();
    // Use optimization service to analyze cycle data and suggest improvements
    return this.optimizationServices.getCycleOptimization(
      cycleId,
      openaiApiKey
    );
  }

  // Real workflow suggestions
  async getWorkflowSuggestion(
    toolId: string,
    toolHistory: ToolHistory
  ): Promise<SmartWorkflowSuggestion> {
    if (!this.settingsManager.isIntelligentWorkflowSelectionEnabled()) {
      throw new Error('Intelligent workflow selection is not enabled');
    }

    const openaiApiKey = this.settingsManager.getOpenAIKey();
    return this.optimizationServices.getWorkflowSuggestion(
      toolId,
      toolHistory,
      openaiApiKey
    );
  }

  // Real predictive analytics
  async getPredictiveAnalytics(): Promise<PredictiveAnalytics> {
    if (!this.settingsManager.isPredictiveAnalyticsEnabled()) {
      throw new Error('Predictive analytics is not enabled');
    }

    const openaiApiKey = this.settingsManager.getOpenAIKey();
    return this.analyticsServices.getPredictiveAnalytics(openaiApiKey);
  }

  // Real-time insights
  async getRealTimeInsights(): Promise<SterilizationAIInsight[]> {
    if (!this.settingsManager.isRealTimeMonitoringEnabled()) {
      throw new Error('Real-time monitoring is not enabled');
    }

    return this.analyticsServices.getRealTimeInsights();
  }

  // Historical trends analysis
  async getHistoricalTrends(timeframe: 'week' | 'month' | 'quarter' | 'year') {
    if (!this.settingsManager.isPredictiveAnalyticsEnabled()) {
      throw new Error('Predictive analytics is not enabled');
    }

    return this.analyticsServices.getHistoricalTrends(timeframe);
  }

  // Export analytics report
  async exportAnalyticsReport(
    reportType: 'insights' | 'predictive' | 'historical' | 'comprehensive',
    format: 'pdf' | 'csv' | 'excel' | 'json',
    dateRange?: { start: string; end: string }
  ) {
    if (!this.settingsManager.isPredictiveAnalyticsEnabled()) {
      throw new Error('Analytics export is not enabled');
    }

    return this.analyticsServices.exportAnalyticsReport(
      reportType,
      format,
      dateRange
    );
  }

  // Detect potential problems with tools
  async detectPotentialProblems(
    toolId: string,
    toolData: { id: string; type: string; condition: string }
  ) {
    if (!this.settingsManager.isAutomatedProblemDetectionEnabled()) {
      throw new Error('Automated problem detection is not enabled');
    }

    const openaiApiKey = this.settingsManager.getOpenAIKey();
    return this.analysisServices.detectPotentialProblems(
      toolId,
      toolData,
      openaiApiKey
    );
  }

  // Analyze compliance for sterilization cycles
  async analyzeCompliance(cycleId: string): Promise<ComplianceAnalysis> {
    if (!this.settingsManager.isComplianceMonitoringEnabled()) {
      throw new Error('Compliance monitoring is not enabled');
    }

    const openaiApiKey = this.settingsManager.getOpenAIKey();
    return this.complianceServices.analyzeCompliance(cycleId, openaiApiKey);
  }

  // Validate biological indicators with AI
  async validateBiologicalIndicators(biData: {
    id: string;
    type: string;
    result: string;
  }) {
    if (!this.settingsManager.isBiologicalIndicatorAnalysisEnabled()) {
      throw new Error('Biological indicator analysis is not enabled');
    }

    const openaiApiKey = this.settingsManager.getOpenAIKey();
    return this.complianceServices.validateBiologicalIndicators(
      biData,
      openaiApiKey
    );
  }

  // Test ChatGPT-4 connection
  async testChatGPT4Connection() {
    // Retrieve the stored OpenAI API key from settings
    const openaiApiKey = this.settingsManager.getOpenAIKey();

    // Return error response if no API key is configured
    if (!openaiApiKey) {
      return {
        success: false,
        response: '',
        error: 'OpenAI API key not configured',
      };
    }

    // Test the actual connection to OpenAI's API
    return OpenAIService.testConnection(openaiApiKey);
  }

  // Check if AI feature is enabled
  isFeatureEnabled(feature: keyof SterilizationAISettings): boolean {
    return this.settingsManager.isFeatureEnabled(feature);
  }

  // Get current settings
  getCurrentSettings() {
    return this.settingsManager.getCurrentSettings();
  }

  // Get AI confidence threshold
  getConfidenceThreshold(): number {
    return this.settingsManager.getConfidenceThreshold();
  }

  // Get data retention days
  getDataRetentionDays(): number {
    return this.settingsManager.getDataRetentionDays();
  }
}
