import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiCheckCircle, mdiAlertCircle, mdiClose } from '@mdi/js';

interface IntegrationNotificationProps {
  successMessage: string | null;
  errorMessage: string | null;
  onClearMessages: () => void;
}

const IntegrationNotification: React.FC<IntegrationNotificationProps> = ({
  successMessage,
  errorMessage,
  onClearMessages,
}) => {
  const message = successMessage || errorMessage;
  const isSuccess = !!successMessage;

  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
          isSuccess
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        } rounded-lg shadow-lg p-4`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Icon
              path={isSuccess ? mdiCheckCircle : mdiAlertCircle}
              size={1.2}
              className={isSuccess ? 'text-green-500' : 'text-red-500'}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{message}</p>
          </div>
          <button
            onClick={onClearMessages}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <Icon path={mdiClose} size={0.8} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default IntegrationNotification;
