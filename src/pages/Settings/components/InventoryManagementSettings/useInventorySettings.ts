import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../../../contexts/UserContext';
import {
  InventoryAIService,
  InventoryAISettings,
} from '../../../../services/ai/inventoryAIService';
import { InventorySettings } from './types';
import { FacilityService } from '../../../../services/facilityService';

export const useInventorySettings = () => {
  const { currentUser } = useUser();
  const [aiSettings, setAiSettings] = useState<InventoryAISettings | null>(
    null
  );
  const [aiMessage, setAiMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiService, setAiService] = useState<InventoryAIService | null>(null);

  const [settings, setSettings] = useState<InventorySettings>({
    // General defaults
    autoCalculateTotals: true,
    requireApprovalForAdjustments: true,
    allowNegativeQuantities: false,
    requireReasonForAdjustments: true,
    defaultTransactionType: 'in',
    enableRealTimeUpdates: true,
    enableAuditTrails: true,

    // Stock defaults
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    autoReorderEnabled: false,
    reorderBufferDays: 7,

    // Category defaults
    enableSubcategories: true,
    enableCustomTags: true,
    requireCategoryAssignment: true,

    // Reporting defaults
    autoGenerateReports: false,
    reportRetentionDays: 365,
    includeSensitiveData: false,
    reportFormat: 'PDF',

    // AI defaults
    aiEnabled: false,
    computerVisionEnabled: false,
    smartCategorizationEnabled: false,
    predictiveAnalyticsEnabled: false,

    // AI config defaults
    aiConfidenceThreshold: 0.8,
    autoCategorizationEnabled: false,
    smartFormFillingEnabled: false,
    maintenancePredictionsEnabled: false,
    demandForecastingEnabled: false,

    // AI service keys
    openaiApiKey: '',
    googleVisionApiKey: '',

    // AI privacy defaults
    dataSharingEnabled: false,
    localAIProcessingEnabled: false,
    aiDataRetentionDays: 90,
  });

  useEffect(() => {
    // Initialize AI service with the proper facility ID
    const initializeAIService = async () => {
      try {
        const facilityId = await FacilityService.getCurrentFacilityId();
        const service = new InventoryAIService(facilityId);
        setAiService(service);
        loadAISettings(service);
      } catch (error) {
        console.error('Failed to initialize AI service:', error);
        setAiMessage('Failed to initialize AI service');
      }
    };

    initializeAIService();
  }, []);

  const loadAISettings = async (service: InventoryAIService) => {
    try {
      setIsLoading(true);
      let settings = await service.loadSettings();

      if (!settings) {
        // Initialize default settings if none exist
        await service.initializeSettings();
        settings = await service.loadSettings();
      }

      setAiSettings(settings);
    } catch (error) {
      console.error('Error loading AI settings:', error);
      setAiMessage('Error loading AI settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAISettingChange = (
    key: keyof InventoryAISettings,
    value: string | number | boolean
  ) => {
    if (aiSettings) {
      setAiSettings({
        ...aiSettings,
        [key]: value,
      });
    }
  };

  const handleAISettingsSave = async () => {
    if (!aiService || !aiSettings) return;

    try {
      setIsLoading(true);
      const success = await aiService.saveSettings(aiSettings);

      if (success) {
        setAiMessage('AI settings saved successfully');
        setTimeout(() => setAiMessage(''), 3000);
      } else {
        setAiMessage('Error saving AI settings');
      }
    } catch (error) {
      console.error('Error saving AI settings:', error);
      setAiMessage('Error saving AI settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAISettingsReset = async () => {
    if (!aiService) return;

    try {
      setIsLoading(true);
      await aiService.initializeSettings();
      await loadAISettings(aiService);
      setAiMessage('AI settings reset to defaults');
      setTimeout(() => setAiMessage(''), 3000);
    } catch (error) {
      console.error('Error resetting AI settings:', error);
      setAiMessage('Error resetting AI settings');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSettings = useCallback(async () => {
    if (!currentUser?.id) return;

    setIsLoading(true);
    try {
      // For now, just load AI settings from local storage since we don't have facility_id
      const aiSettings = localStorage.getItem('cliniio_ai_settings');
      if (aiSettings) {
        const parsed = JSON.parse(aiSettings);
        setSettings((prev) => ({
          ...prev,
          ...parsed,
          openaiApiKey: parsed.openaiApiKey
            ? '••••••••' + parsed.openaiApiKey.slice(-4)
            : '',
          googleVisionApiKey: parsed.googleVisionApiKey
            ? '••••••••' + parsed.googleVisionApiKey.slice(-4)
            : '',
        }));
      }
    } catch (error) {
      console.error('Failed to load inventory settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    if (!currentUser?.id) return;

    try {
      // Save AI settings to local storage
      const aiSettings = {
        aiEnabled: settings.aiEnabled,
        computerVisionEnabled: settings.computerVisionEnabled,
        smartCategorizationEnabled: settings.smartCategorizationEnabled,
        predictiveAnalyticsEnabled: settings.predictiveAnalyticsEnabled,
        aiConfidenceThreshold: settings.aiConfidenceThreshold,
        autoCategorizationEnabled: settings.autoCategorizationEnabled,
        smartFormFillingEnabled: settings.smartFormFillingEnabled,
        maintenancePredictionsEnabled: settings.maintenancePredictionsEnabled,
        demandForecastingEnabled: settings.demandForecastingEnabled,
        dataSharingEnabled: settings.dataSharingEnabled,
        localAIProcessingEnabled: settings.localAIProcessingEnabled,
        aiDataRetentionDays: settings.aiDataRetentionDays,
      };
      localStorage.setItem('cliniio_ai_settings', JSON.stringify(aiSettings));
    } catch (error) {
      console.error('Failed to save inventory settings:', error);
    }
  };

  const handleInputChange = (
    field: keyof InventorySettings,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return {
    settings,
    setSettings,
    aiSettings,
    aiMessage,
    isLoading,
    handleInputChange,
    handleAISettingChange,
    handleAISettingsSave,
    handleAISettingsReset,
    saveSettings,
    loadSettings,
  };
};
