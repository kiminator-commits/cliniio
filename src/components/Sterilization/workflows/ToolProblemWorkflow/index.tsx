import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiBarcode } from '@mdi/js';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { ProblemType } from '@/types/sterilizationTypes';
import { ProblemTypeSelector } from './components/ProblemTypeSelector';
import { VoiceInput } from './components/VoiceInput';
import { ToolService } from '@/services/toolService';
import { supabase } from '@/lib/supabaseClient';

interface ToolProblemWorkflowProps {
  onClose: () => void;
}

const ToolProblemWorkflow: React.FC<ToolProblemWorkflowProps> = ({
  onClose,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(
    null
  );
  const [scanMessage, setScanMessage] = useState('');
  const [showProblemSelection, setShowProblemSelection] = useState(false);
  const [selectedProblemType, setSelectedProblemType] =
    useState<ProblemType | null>(null);
  const [problemNotes, setProblemNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { availableTools, markToolAsProblem: _markToolAsProblem } = useSterilizationStore();

  const simulateScan = () => {
    setIsScanning(true);
    setScanMessage('Scanning tool...');

    setTimeout(() => {
      // Use real barcodes from available tools instead of hardcoded demo barcodes
      const availableBarcodes = availableTools
        .filter((tool) => tool.barcode)
        .map((tool) => tool.barcode!);

      if (availableBarcodes.length === 0) {
        setScanResult('error');
        setScanMessage('No tools available for scanning');
        setIsScanning(false);
        return;
      }

      const randomBarcode =
        availableBarcodes[Math.floor(Math.random() * availableBarcodes.length)];
      const tool = availableTools.find((t) => t.barcode === randomBarcode);

      if (tool) {
        setScannedCode(randomBarcode);
        setScanResult('success');
        setScanMessage(`Successfully scanned ${tool.name}`);
        setShowProblemSelection(true);
      } else {
        setScanResult('error');
        setScanMessage('Tool not found in system');
      }

      setIsScanning(false);
    }, 1000);
  };

  const handleSubmit = async () => {
    if (!selectedProblemType || !scannedCode) return;

    setIsProcessing(true);

    try {
      // Get current user ID for audit logging
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        setScanMessage('Authentication error. Please log in again.');
        return;
      }

      // Use Supabase service instead of local store
      const result = await ToolService.scanToolForProblemWorkflow(
        scannedCode,
        selectedProblemType,
        problemNotes || 'No additional notes provided',
        user.id
      );

      if (result.success) {
        setScanMessage(result.message);

        // Update local state to reflect the change
        const tool = availableTools.find((t) => t.barcode === scannedCode);
        if (tool) {
          console.log(`Tool ${tool.id} marked as problem: ${selectedProblemType}`);
        }

        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setScanMessage(result.message);
      }
    } catch (error) {
      console.error('Error reporting tool problem:', error);
      setScanMessage('Error reporting tool problem. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!showProblemSelection ? (
        <>
          {/* Workflow Info */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-1">
              Tool Problem Workflow
            </h3>
            <p className="text-red-600 text-sm">
              Report tool issues or problems
            </p>
            <div className="mt-2 text-xs text-red-500">
              <strong>Tool Status:</strong> Any status → Problem
            </div>
          </div>

          {/* Scan Interface */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-center space-y-4">
              {/* Camera Viewfinder */}
              <div className="relative bg-black rounded-lg h-48 flex items-center justify-center">
                {/* Viewfinder corners */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-2 border-[#4ECDC4] w-48 h-32 rounded-lg">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#4ECDC4] rounded-tl"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#4ECDC4] rounded-tr"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#4ECDC4] rounded-bl"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#4ECDC4] rounded-br"></div>
                </div>

                {/* Camera status indicator */}
                <div className="absolute bottom-4 right-4 flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></div>
                  <span className="text-white text-xs">Camera active</span>
                </div>

                {/* Scan Button Overlay */}
                <button
                  onClick={simulateScan}
                  disabled={isScanning}
                  className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-full transition-all duration-200 ${
                    isScanning
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-[#4ECDC4] hover:bg-[#3db8b0] shadow-lg hover:shadow-xl'
                  }`}
                >
                  <Icon
                    path={mdiBarcode}
                    size={1.5}
                    className={`${isScanning ? 'text-gray-400' : 'text-white'}`}
                  />
                </button>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {isScanning ? 'Scanning...' : 'Click to Scan'}
                </h3>
                <p className="text-gray-600 text-sm">
                  {isScanning
                    ? 'Position barcode in camera view'
                    : 'Use camera to scan tool barcode'}
                </p>
              </div>
            </div>

            {/* Scan Result */}
            {scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-lg ${
                  scanResult === 'success'
                    ? 'bg-green-100 border border-green-200'
                    : 'bg-red-100 border border-red-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    path={mdiBarcode}
                    size={1}
                    className={
                      scanResult === 'success'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  />
                  <span
                    className={`font-medium ${
                      scanResult === 'success'
                        ? 'text-green-800'
                        : 'text-red-800'
                    }`}
                  >
                    {scanMessage}
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </>
      ) : (
        /* Problem Type Selection */
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              Report Tool Problem
            </h3>
            <p className="text-sm text-gray-600">Tool: {scannedCode}</p>
          </div>

          <ProblemTypeSelector
            selectedProblemType={selectedProblemType}
            onProblemTypeSelect={setSelectedProblemType}
          />

          {/* Voice Input for "Other" */}
          {selectedProblemType === 'other' && (
            <VoiceInput value={problemNotes} onChange={setProblemNotes} />
          )}

          {/* Submit Button */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={() => setShowProblemSelection(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedProblemType || isProcessing}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Report Problem'}
            </button>
          </div>

          {/* Back to Workflow Selection Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={onClose}
              className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              ← Back to Workflow Selection
            </button>
          </div>
        </motion.div>
      )}

      {/* Back to Workflow Selection Button (when not in problem selection) */}
      {!showProblemSelection && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            ← Back to Workflow Selection
          </button>
        </div>
      )}
    </div>
  );
};

export default ToolProblemWorkflow;
