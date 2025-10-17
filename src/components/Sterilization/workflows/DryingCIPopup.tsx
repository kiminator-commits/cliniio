import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import { batchCiConfirmation } from '@/services/sterilization/ciConfirmationService';
import { useComplianceSettingsStore } from '@/store/hooks/useComplianceSettingsStore';
import { useUser } from '@/contexts/UserContext';

interface DryingCIPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentCycleId: string;
  facilityId: string;
  toolIds: string[];
  onComplete?: () => void;
}

export const DryingCIPopup: React.FC<DryingCIPopupProps> = ({
  isOpen,
  onClose,
  currentCycleId,
  facilityId,
  toolIds,
  onComplete,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { requireCi: _requireCi } = useComplianceSettingsStore();
  const { currentUser } = useUser();

  const handleResponse = async (ciAdded: boolean) => {
    try {
      setIsSubmitting(true);

      // Use batch confirmation for better performance
      await batchCiConfirmation({
        toolIds,
        cycleId: currentCycleId,
        facilityId,
        userId: currentUser?.id || '',
        ciAdded,
        notes: ciAdded
          ? 'CI strips confirmed added during drying phase.'
          : 'CI strips not added during drying phase.',
      });

      if (!ciAdded) {
        toast.error('⚠️ CI not added — cycle may be non-compliant.');
      } else {
        toast.success('✅ CI confirmation recorded.');
      }

      onClose();

      // Call completion callback to proceed with autoclave transition
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error saving CI confirmation:', error);
      toast.error('Error saving CI confirmation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[99999] p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl overflow-hidden w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-[#4ECDC4] text-white px-6 py-4">
              <h2 className="text-xl font-semibold">
                Chemical Indicator Confirmation
              </h2>
            </div>

            {/* Content */}
            <div className="flex flex-col items-center justify-center text-center px-6 py-8">
              <p className="text-lg font-medium mb-6 text-gray-800">
                Were CI strips added to all packages?
              </p>
              <div className="flex gap-4">
                <button
                  className="px-6 py-3 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                  onClick={() => handleResponse(true)}
                >
                  Yes
                </button>
                <button
                  className="px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                  onClick={() => handleResponse(false)}
                >
                  No
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
};
