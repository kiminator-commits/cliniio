import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiCheckCircle, mdiAlertCircle, mdiInformation } from '@mdi/js';

interface ScanMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  text: string;
}

interface ScanMessageProps {
  scanMessage: ScanMessage | null;
}

export const ScanMessageDisplay: React.FC<ScanMessageProps> = ({
  scanMessage,
}) => {
  if (!scanMessage) return null;

  const getMessageStyles = (type: ScanMessage['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border border-gray-200 text-gray-800';
    }
  };

  const getIcon = (type: ScanMessage['type']) => {
    switch (type) {
      case 'success':
        return mdiCheckCircle;
      case 'error':
      case 'warning':
        return mdiAlertCircle;
      case 'info':
        return mdiInformation;
      default:
        return mdiInformation;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg mb-6 ${getMessageStyles(scanMessage.type)}`}
    >
      <div className="flex items-center gap-2">
        <Icon path={getIcon(scanMessage.type)} size={1.2} />
        <span>{scanMessage.text}</span>
      </div>
    </motion.div>
  );
};

interface CriticalAlertProps {
  scanMessage: ScanMessage | null;
}

export const CriticalAlert: React.FC<CriticalAlertProps> = ({
  scanMessage,
}) => {
  // Special Alert for 200 Threshold
  if (
    scanMessage?.type === 'error' &&
    scanMessage.text.includes('MAXIMUM SCAN THRESHOLD REACHED')
  ) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-red-100 border-2 border-red-500 rounded-lg p-6 mb-6 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Icon path={mdiAlertCircle} size={2} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-800 mb-2">
              CRITICAL ALERT
            </h3>
            <p className="text-red-700 font-medium">{scanMessage.text}</p>
            <div className="mt-3 text-sm text-red-600">
              <p>• This tool has reached the maximum scan limit</p>
              <p>• Immediate action required</p>
              <p>• Contact supervisor for guidance</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Special Alert for 198 Scans Warning
  if (
    scanMessage?.type === 'warning' &&
    scanMessage.text.includes('CRITICAL WARNING') &&
    scanMessage.text.includes('Only 2 scans remaining')
  ) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-orange-100 border-2 border-orange-500 rounded-lg p-6 mb-6 shadow-lg"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Icon path={mdiAlertCircle} size={2} className="text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-orange-800 mb-2">
              FINAL WARNING
            </h3>
            <p className="text-orange-700 font-medium">{scanMessage.text}</p>
            <div className="mt-3 text-sm text-orange-600">
              <p>• Only 2 scans remaining before maximum limit</p>
              <p>• Consider tool replacement or maintenance</p>
              <p>• Contact supervisor if needed</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return null;
};
