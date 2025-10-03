import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiAlertCircle,
  mdiClose,
  mdiPackage,
  mdiClipboardList,
} from '@mdi/js';
import { useSterilizationStore } from '../../store/sterilizationStore';
import { BIFailureResolutionModal } from '../BIFailureResolution';

interface GlobalBIFailureBannerProps {
  onDismiss?: () => void;
}

const GlobalBIFailureBanner: React.FC<GlobalBIFailureBannerProps> = ({
  onDismiss,
}) => {
  const { biFailureActive, biFailureDetails } = useSterilizationStore();
  const [showResolutionModal, setShowResolutionModal] = useState(false);

  // Debug logging
  // Debug logging removed for production

  if (!biFailureActive) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-red-600 text-white shadow-lg">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="p-1 bg-red-700 rounded-lg flex-shrink-0">
            <Icon path={mdiAlertCircle} size={1.2} className="text-white" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold">
                🚨 TOOL RECALL: BI TEST FAILURE
              </h3>
              <span className="text-sm bg-red-700 px-2 py-1 rounded">
                {biFailureDetails?.date
                  ? new Date(biFailureDetails.date).toLocaleDateString()
                  : 'Today'}
              </span>
            </div>

            <p className="text-sm text-red-100 mt-1">
              <strong>CRITICAL:</strong> All tools sterilized since the last
              successful BI test must be quarantined immediately. Check
              packaging for affected batch numbers.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Resolution Workflow Button */}
          <button
            onClick={() => setShowResolutionModal(true)}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 px-3 py-1 rounded-lg transition-colors"
            title="View resolution workflow"
          >
            <Icon path={mdiClipboardList} size={1} className="text-white" />
            <span className="text-sm font-medium">Resolution Workflow</span>
          </button>

          {/* Affected Tools Count */}
          {biFailureDetails?.affectedToolsCount && (
            <div className="flex items-center gap-2 bg-red-700 px-3 py-1 rounded-lg">
              <Icon path={mdiPackage} size={1} className="text-white" />
              <span className="text-sm font-medium">
                {biFailureDetails.affectedToolsCount} tools affected
              </span>
            </div>
          )}

          {/* Dismiss Button */}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="p-1 hover:bg-red-700 rounded-lg transition-colors"
              title="Dismiss banner"
            >
              <Icon path={mdiClose} size={1.2} className="text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Resolution Modal */}
      <BIFailureResolutionModal
        isOpen={showResolutionModal}
        onClose={() => setShowResolutionModal(false)}
      />
    </div>
  );
};

export default GlobalBIFailureBanner;
