import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiCheckCircle } from '@mdi/js';
import { useCleanWorkflowWithTraceability } from './CleanWorkflow/hooks/useCleanWorkflowWithTraceability';
import { TraceabilityCodeDisplay } from './CleanWorkflow/components/TraceabilityCodeDisplay';

interface CleanWorkflowProps {
  scannedData: string;
  onClose: () => void;
  toolId?: string;
}

export default function CleanWorkflow({
  scannedData,
  onClose,
  toolId,
}: CleanWorkflowProps) {
  const { tool, traceabilityCode, copied, handleCopyCode } =
    useCleanWorkflowWithTraceability({
      scannedData,
      toolId,
    });

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 border border-green-200 rounded-lg p-4"
      >
        <div className="flex items-center gap-2 mb-2">
          <Icon path={mdiCheckCircle} size={1.2} className="text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">
            Tool Ready for Use
          </h3>
        </div>
        <p className="text-green-700 mb-2">
          {tool
            ? `${tool.name} is clean and ready for patient use.`
            : 'Tool is clean and ready for patient use.'}
        </p>
        <p className="text-sm text-green-600">Scanned: {scannedData}</p>
      </motion.div>

      {/* Traceability Code Display */}
      <TraceabilityCodeDisplay
        traceabilityCode={traceabilityCode}
        copied={copied}
        onCopyCode={handleCopyCode}
      />

      {/* Status Update */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-orange-50 border border-orange-200 rounded-lg p-4"
      >
        <h4 className="text-md font-semibold text-orange-800 mb-2">
          Status Update
        </h4>
        <p className="text-orange-700 mb-2">
          <strong>Tool has been marked as "dirty"</strong> and will need
          sterilization after use.
        </p>
        <p className="text-sm text-orange-600">
          This change is automatically reflected in the inventory system.
        </p>
      </motion.div>

      {/* Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex gap-2"
      >
        <button
          onClick={onClose}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
        >
          Confirm & Close
        </button>
      </motion.div>
    </div>
  );
}
