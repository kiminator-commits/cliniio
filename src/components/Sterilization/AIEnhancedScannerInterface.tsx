import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import {
  mdiBarcode,
  mdiCamera,
  mdiBrain,
  mdiCheckCircle,
  mdiInformation,
  mdiLightbulb,
  mdiClose,
} from '@mdi/js';
import {
  SterilizationAIService,
  ToolConditionAssessment,
  SmartWorkflowSuggestion,
} from '../../services/ai/sterilizationAIService';
import { FacilityService } from '../../services/facilityService';

interface AIEnhancedScannerInterfaceProps {
  isScanning: boolean;
  scanMessage: string;
  onScan: () => void;
  onWorkflowSuggestion: (workflow: string) => void;
  size?: 'small' | 'medium' | 'large';
  toolId?: string;
}

export const AIEnhancedScannerInterface: React.FC<
  AIEnhancedScannerInterfaceProps
> = ({
  isScanning,
  scanMessage,
  onScan,
  onWorkflowSuggestion,
  size = 'large',
  toolId,
}) => {
  const [aiAnalysis, setAiAnalysis] = useState<ToolConditionAssessment | null>(
    null
  );
  const [workflowSuggestion, setWorkflowSuggestion] =
    useState<SmartWorkflowSuggestion | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [capturedImage, setCapturedImage] = useState<File | null>(null);
  const [aiService, setAiService] = useState<SterilizationAIService | null>(
    null
  );

  // Initialize AI service when component mounts
  useEffect(() => {
    const initializeService = async () => {
      try {
        const facilityId = await FacilityService.getCurrentFacilityId();
        const service = new SterilizationAIService(facilityId);
        setAiService(service);
      } catch (error) {
        console.error('Failed to initialize AI service:', error);
      }
    };

    initializeService();
  }, []);

  // Size configurations
  const sizeConfig = {
    small: {
      container: 'w-64 h-48',
      button: 'w-16 h-16',
      icon: 1,
      title: 'text-sm',
      description: 'text-xs',
    },
    medium: {
      container: 'w-80 h-60',
      button: 'w-20 h-20',
      icon: 1.2,
      title: 'text-base',
      description: 'text-sm',
    },
    large: {
      container: 'w-96 h-72',
      button: 'w-24 h-24',
      icon: 1.5,
      title: 'text-lg',
      description: 'text-base',
    },
  };

  const config = sizeConfig[size];

  const handleImageCapture = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setCapturedImage(file);
      setIsAnalyzing(true);
      setShowAIPanel(true);

      try {
        // Analyze tool condition
        const conditionResult = await aiService?.analyzeToolCondition(toolId);
        setAiAnalysis(conditionResult || null);

        // Get workflow suggestion if tool ID is available
        if (toolId) {
          const workflowResult = await aiService?.getWorkflowSuggestion(
            toolId,
            {
              id: 'mock-tool-history',
              tool_id: toolId,
              usage_count: 0,
              last_sterilization: new Date().toISOString(),
              condition_rating: 'good',
              wear_level: 0,
            }
          );
          setWorkflowSuggestion(workflowResult || null);
        }

        // Analyze barcode quality
        const barcodeResult = await aiService?.detectBarcodeQuality();
        console.log('Barcode quality:', barcodeResult);

        // Identify tool type
        const toolTypeResult = await aiService?.identifyToolType();
        console.log('Tool type identified:', toolTypeResult);
      } catch (error) {
        console.error('AI analysis failed:', error);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [toolId, aiService]
  );

  const getScanMessageType = () => {
    if (scanMessage.includes('success') || scanMessage.includes('Success'))
      return 'success';
    if (scanMessage.includes('error') || scanMessage.includes('Error'))
      return 'error';
    return 'info';
  };

  const getScanMessageContent = () => {
    return scanMessage || 'Ready to scan';
  };

  const handleWorkflowAccept = (workflow: string) => {
    onWorkflowSuggestion(workflow);
    setShowAIPanel(false);
  };

  return (
    <div className="relative">
      {/* Main Scanner Interface */}
      <div
        className={`${config.container} bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 relative overflow-hidden`}
      >
        {/* Camera Viewport */}
        <div className="w-full h-full flex items-center justify-center relative">
          {/* Camera active indicator */}
          {isScanning && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Camera active</span>
            </div>
          )}

          {/* AI Analysis Button Overlay */}
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className="absolute top-2 right-2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors"
            title="AI Analysis"
          >
            <Icon path={mdiBrain} size={0.8} />
          </button>

          {/* Scan Button Overlay */}
          <button
            onClick={onScan}
            disabled={isScanning}
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 ${config.button} rounded-full transition-all duration-200 ${
              isScanning
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-[#4ECDC4] hover:bg-[#3db8b0] shadow-lg hover:shadow-xl'
            }`}
          >
            <Icon
              path={mdiBarcode}
              size={config.icon}
              className={`${isScanning ? 'text-gray-400' : 'text-white'}`}
            />
          </button>

          {/* Image Upload for AI Analysis */}
          <div className="absolute bottom-2 left-2">
            <label className="bg-blue-600 text-white text-xs px-3 py-2 rounded-full hover:bg-blue-700 transition-colors cursor-pointer">
              <Icon path={mdiCamera} size={0.8} className="inline mr-1" />
              Photo Analysis
              <input
                type="file"
                accept="image/*"
                onChange={handleImageCapture}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Scanner Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-3">
          <h3 className={`${config.title} font-medium text-gray-800 mb-1`}>
            {isScanning ? 'Scanning...' : 'Click to Scan'}
          </h3>
          <p className={`text-gray-600 ${config.description}`}>
            {isScanning
              ? 'Position barcode in camera view'
              : 'Use camera to scan tool barcode'}
          </p>
        </div>
      </div>

      {/* Scan Result */}
      {scanMessage && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-3 p-3 rounded-lg ${
            getScanMessageType() === 'success'
              ? 'bg-green-100 border border-green-200'
              : getScanMessageType() === 'error'
                ? 'bg-red-100 border border-red-200'
                : 'bg-blue-100 border border-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              path={mdiBarcode}
              size={0.8}
              className={`${
                getScanMessageType() === 'success'
                  ? 'text-green-600'
                  : getScanMessageType() === 'error'
                    ? 'text-red-600'
                    : 'text-blue-600'
              }`}
            />
            <span
              className={`font-medium text-sm ${
                getScanMessageType() === 'success'
                  ? 'text-green-800'
                  : getScanMessageType() === 'error'
                    ? 'text-red-800'
                    : 'text-blue-800'
              }`}
            >
              {getScanMessageContent()}
            </span>
          </div>
        </motion.div>
      )}

      {/* AI Analysis Panel */}
      <AnimatePresence>
        {showAIPanel && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mt-4 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            {/* Panel Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon path={mdiBrain} size={1.2} />
                  <h3 className="font-semibold">AI Analysis Results</h3>
                </div>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <Icon path={mdiClose} size={1} />
                </button>
              </div>
            </div>

            {/* Panel Content */}
            <div className="p-4 space-y-4">
              {isAnalyzing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  <span className="ml-2 text-gray-600">
                    AI analyzing image...
                  </span>
                </div>
              ) : (
                <>
                  {/* Tool Condition Assessment */}
                  {aiAnalysis && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                        <Icon
                          path={mdiCheckCircle}
                          size={1}
                          className="text-blue-600"
                        />
                        Tool Condition Assessment
                      </h4>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Condition:</span>
                          <span
                            className={`ml-2 font-medium ${
                              aiAnalysis.condition === 'excellent'
                                ? 'text-green-600'
                                : aiAnalysis.condition === 'good'
                                  ? 'text-blue-600'
                                  : aiAnalysis.condition === 'fair'
                                    ? 'text-yellow-600'
                                    : aiAnalysis.condition === 'poor'
                                      ? 'text-orange-600'
                                      : 'text-red-600'
                            }`}
                          >
                            {aiAnalysis.condition.charAt(0).toUpperCase() +
                              aiAnalysis.condition.slice(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Wear Level:</span>
                          <span className="ml-2 font-medium text-gray-800">
                            {aiAnalysis.wearLevel}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            Cleaning Quality:
                          </span>
                          <span className="ml-2 font-medium text-gray-800">
                            {aiAnalysis.cleaningQuality}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Confidence:</span>
                          <span className="ml-2 font-medium text-gray-800">
                            {Math.round(aiAnalysis.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      {aiAnalysis.recommendations.length > 0 && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium text-blue-700 mb-2">
                            Recommendations:
                          </h5>
                          <ul className="text-sm text-blue-600 space-y-1">
                            {aiAnalysis.recommendations.map((rec, index) => (
                              <li
                                key={index}
                                className="flex items-start gap-2"
                              >
                                <Icon
                                  path={mdiLightbulb}
                                  size={0.8}
                                  className="text-yellow-500 mt-0.5 flex-shrink-0"
                                />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Workflow Suggestion */}
                  {workflowSuggestion && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                        <Icon
                          path={mdiInformation}
                          size={1}
                          className="text-green-600"
                        />
                        AI Workflow Recommendation
                      </h4>

                      <div className="mb-3">
                        <span className="text-gray-600">
                          Recommended Workflow:
                        </span>
                        <span className="ml-2 font-medium text-green-700 capitalize">
                          {workflowSuggestion.recommendedWorkflow}
                        </span>
                        <span className="ml-2 text-sm text-gray-500">
                          ({Math.round(workflowSuggestion.confidence * 100)}%
                          confidence)
                        </span>
                      </div>

                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-green-700 mb-2">
                          Reasoning:
                        </h5>
                        <ul className="text-sm text-green-600 space-y-1">
                          {workflowSuggestion.reasoning.map((reason, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <Icon
                                path={mdiCheckCircle}
                                size={0.8}
                                className="text-green-500 mt-0.5 flex-shrink-0"
                              />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            handleWorkflowAccept(
                              workflowSuggestion.recommendedWorkflow
                            )
                          }
                          className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Accept Recommendation
                        </button>
                        <button
                          onClick={() => setShowAIPanel(false)}
                          className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Review Later
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Captured Image Preview */}
                  {capturedImage && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-3">
                        Captured Image
                      </h4>
                      <div className="flex items-center gap-3">
                        <img
                          src={URL.createObjectURL(capturedImage)}
                          alt="Captured tool"
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                        />
                        <div className="text-sm text-gray-600">
                          <p>
                            <strong>File:</strong> {capturedImage.name}
                          </p>
                          <p>
                            <strong>Size:</strong>{' '}
                            {(capturedImage.size / 1024).toFixed(1)} KB
                          </p>
                          <p>
                            <strong>Type:</strong> {capturedImage.type}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
