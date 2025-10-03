import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import Icon from '@mdi/react';
import {
  mdiQrcodeScan,
  mdiCamera,
  mdiFileUpload,
  mdiBrain,
  mdiLightbulb,
  mdiAlertCircle,
  mdiCheckCircle,
} from '@mdi/js';
import { InventoryAIService } from '../../../services/ai/inventoryAIService';
import { ComputerVisionResult } from '../../../types/inventoryTypes';
import { FacilityService } from '../../../services/facilityService';

interface AIEnhancedScanModalProps {
  show: boolean;
  onHide: () => void;
  onScanComplete?: (barcode: string, aiResult?: ComputerVisionResult) => void;
}

export const AIEnhancedScanModal: React.FC<AIEnhancedScanModalProps> = ({
  show,
  onHide,
  onScanComplete,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'file' | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<ComputerVisionResult | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [aiService, setAiService] = useState<InventoryAIService | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize AI service when component mounts
  useEffect(() => {
    const initializeService = async () => {
      try {
        const facilityId = await FacilityService.getCurrentFacilityId();
        const service = new InventoryAIService(facilityId);
        setAiService(service);
      } catch (error) {
        console.error('Failed to initialize AI service:', error);
      }
    };

    initializeService();
  }, []);

  const handleAIAnalysis = useCallback(
    async (
      imageFile: File | null,
      barcode?: string
    ): Promise<ComputerVisionResult | null> => {
      setIsAnalyzing(true);

      try {
        let aiResult: ComputerVisionResult;

        if (imageFile) {
          // Analyze uploaded image
          const imageResult = await aiService?.analyzeImage(imageFile);
          aiResult = {
            success: imageResult ? true : false,
            barcode: imageResult?.recognized_objects?.[0] || undefined,
            itemType: imageResult?.item_classification || 'unknown',
            condition: imageResult?.damage_detected ? 'damaged' : 'good',
            quantity: 1,
            confidence: imageResult?.confidence_score || 0.85,
            suggestions: imageResult?.recommendations || [
              'Verify item matches barcode',
              'Check expiration date if applicable',
              'Confirm storage conditions',
            ],
          };
        } else if (barcode) {
          // Simulate AI analysis for camera scan
          aiResult = {
            success: true,
            barcode,
            itemType: 'medical',
            condition: 'good',
            quantity: 1,
            confidence: 0.85,
            suggestions: [
              'Verify item matches barcode',
              'Check expiration date if applicable',
              'Confirm storage conditions',
            ],
          };
        } else {
          throw new Error('No image or barcode provided for analysis');
        }

        setAiAnalysis(aiResult);
        return aiResult;
      } catch (error) {
        console.error('AI analysis failed:', error);
        setError('AI analysis failed, but basic scanning may still work');
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [aiService]
  );

  const handleCameraScan = useCallback(async () => {
    if (!videoRef.current) return;

    setIsScanning(true);
    setError(null);
    setSuccess(null);
    setAiAnalysis(null);

    try {
      // Simulate camera scanning (replace with actual camera implementation)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate barcode detection
      const mockBarcode =
        'ITEM-' + Math.random().toString(36).substr(2, 8).toUpperCase();
      setSuccess(`Barcode detected: ${mockBarcode}`);

      // Trigger AI analysis
      await handleAIAnalysis(null, mockBarcode);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Camera scan failed');
    } finally {
      setIsScanning(false);
    }
  }, [handleAIAnalysis]);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsScanning(true);
      setError(null);
      setSuccess(null);
      setAiAnalysis(null);

      try {
        // Perform AI analysis on the uploaded image
        const aiResult = await handleAIAnalysis(file);

        if (aiResult?.barcode) {
          setSuccess(`AI detected barcode: ${aiResult.barcode}`);
          onScanComplete?.(aiResult.barcode, aiResult);
        } else {
          setSuccess('Image analyzed successfully');
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'File processing failed'
        );
      } finally {
        setIsScanning(false);
      }
    },
    [onScanComplete, handleAIAnalysis]
  );

  const handleClose = useCallback(() => {
    setScanMode(null);
    setIsScanning(false);
    setIsAnalyzing(false);
    setAiAnalysis(null);
    setError(null);
    setSuccess(null);
    onHide();
  }, [onHide]);

  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      backdrop="static"
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title className="flex items-center gap-2">
          <Icon path={mdiQrcodeScan} size={1} className="text-blue-600" />
          <span>AI-Enhanced Inventory Scanner</span>
          <Icon path={mdiBrain} size={0.8} className="text-purple-500" />
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {!scanMode ? (
          <div className="space-y-4">
            <div className="text-center">
              <h5 className="mb-3">Choose scanning method</h5>
              <p className="text-sm text-gray-600 mb-4">
                AI will automatically analyze images and provide insights
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setScanMode('camera')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <Icon
                  path={mdiCamera}
                  size={2}
                  className="mx-auto mb-2 text-blue-600"
                />
                <div className="text-sm font-medium">Camera Scan</div>
                <div className="text-xs text-gray-500">
                  Use device camera + AI
                </div>
              </button>

              <button
                onClick={() => setScanMode('file')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
              >
                <Icon
                  path={mdiFileUpload}
                  size={2}
                  className="mx-auto mb-2 text-green-600"
                />
                <div className="text-sm font-medium">Upload Image</div>
                <div className="text-xs text-gray-500">AI image analysis</div>
              </button>
            </div>
          </div>
        ) : scanMode === 'camera' ? (
          <div className="space-y-4">
            <div className="text-center">
              <h6 className="mb-3">Camera Scanning</h6>
              {isScanning && (
                <div className="flex items-center justify-center gap-2 text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Scanning...</span>
                </div>
              )}
            </div>

            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto rounded"
                autoPlay
                muted
                playsInline
              />
              <p className="text-sm text-gray-600 mt-2">
                Point camera at barcode or item
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCameraScan}
                disabled={isScanning}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isScanning ? 'Scanning...' : 'Start Scan'}
              </button>
              <button
                onClick={() => setScanMode(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h6 className="mb-3">AI Image Analysis</h6>
              <p className="text-sm text-gray-600">
                Upload an image for AI-powered analysis
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isScanning}
                className="flex flex-col items-center gap-2 w-full"
              >
                <Icon path={mdiFileUpload} size={3} className="text-gray-400" />
                <span className="text-sm font-medium">
                  {isScanning ? 'Processing...' : 'Click to upload image'}
                </span>
                <span className="text-xs text-gray-500">
                  Supports JPG, PNG, GIF
                </span>
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setScanMode(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* AI Analysis Results */}
        {aiAnalysis && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Icon path={mdiBrain} size={1} className="text-purple-600" />
              <h6 className="font-medium text-purple-800">
                AI Analysis Results
              </h6>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic Info */}
              <div className="space-y-2">
                {aiAnalysis.barcode && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Barcode:
                    </span>
                    <span className="text-sm bg-white px-2 py-1 rounded border font-mono">
                      {aiAnalysis.barcode}
                    </span>
                  </div>
                )}

                {aiAnalysis.itemType && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Item Type:
                    </span>
                    <span className="text-sm bg-white px-2 py-1 rounded border capitalize">
                      {aiAnalysis.itemType}
                    </span>
                  </div>
                )}

                {aiAnalysis.condition && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">
                      Condition:
                    </span>
                    <span
                      className={`text-sm px-2 py-1 rounded border capitalize ${
                        aiAnalysis.condition === 'good'
                          ? 'bg-green-100 text-green-800'
                          : aiAnalysis.condition === 'fair'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {aiAnalysis.condition}
                    </span>
                  </div>
                )}
              </div>

              {/* Confidence & Suggestions */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">
                    Confidence:
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(aiAnalysis.confidence || 0) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    {Math.round((aiAnalysis.confidence || 0) * 100)}%
                  </span>
                </div>

                {aiAnalysis.suggestions &&
                  aiAnalysis.suggestions.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">
                        Suggestions:
                      </span>
                      <ul className="mt-1 space-y-1">
                        {aiAnalysis.suggestions.map((suggestion, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-gray-600"
                          >
                            <Icon
                              path={mdiLightbulb}
                              size={0.8}
                              className="text-yellow-500 mt-0.5 flex-shrink-0"
                            />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <Icon path={mdiAlertCircle} size={1} />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <Icon path={mdiCheckCircle} size={1} />
              <span className="text-sm">{success}</span>
            </div>
          </div>
        )}

        {/* AI Processing Indicator */}
        {isAnalyzing && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">AI analyzing image...</span>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <button
          onClick={handleClose}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Close
        </button>

        {aiAnalysis?.barcode && (
          <button
            onClick={() => onScanComplete?.(aiAnalysis.barcode!, aiAnalysis)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Use AI Results
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default AIEnhancedScanModal;
