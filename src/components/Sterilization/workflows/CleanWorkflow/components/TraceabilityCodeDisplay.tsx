import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiContentCopy, mdiCheckCircle, mdiClipboardText } from '@mdi/js';

interface TraceabilityCodeDisplayProps {
  traceabilityCode: string;
  copied: boolean;
  onCopyCode: () => void;
}

export const TraceabilityCodeDisplay: React.FC<
  TraceabilityCodeDisplayProps
> = ({ traceabilityCode, copied, onCopyCode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-blue-50 border-2 border-blue-300 rounded-lg p-6"
    >
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Icon path={mdiClipboardText} size={1.2} className="text-blue-600" />
          <h4 className="text-lg font-semibold text-blue-800">
            Traceability Code
          </h4>
        </div>
        <p className="text-blue-700 mb-4 text-sm">
          Enter this code in your patient chart for compliance tracking
        </p>

        {/* Large Code Display */}
        <div className="bg-white border-2 border-blue-400 rounded-lg p-4 mb-4">
          <div className="text-4xl font-bold text-blue-800 tracking-wider font-mono">
            {traceabilityCode}
          </div>
        </div>

        {/* Copy Button */}
        <button
          onClick={onCopyCode}
          className={`flex items-center gap-2 mx-auto px-4 py-2 rounded-lg transition-all duration-200 ${
            copied
              ? 'bg-green-500 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          <Icon path={copied ? mdiCheckCircle : mdiContentCopy} size={1} />
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>

        {/* EMR ID Button */}
        <button
          onClick={() => {
            const emrId = `EMR-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            navigator.clipboard.writeText(emrId);
            alert(`EMR ID generated and copied: ${emrId}`);
          }}
          className="flex items-center gap-2 mx-auto mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-200"
        >
          <Icon path={mdiClipboardText} size={1} />
          <span>Generate EMR ID</span>
        </button>
      </div>
    </motion.div>
  );
};
