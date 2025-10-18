import React, { useState, useRef as _useRef } from 'react';
import Icon from '@mdi/react';
import {
  mdiAlertCircle,
  mdiClose,
  mdiPackage,
  mdiClipboardList,
} from '@mdi/js';
import { useLocation } from 'react-router-dom';
import { useSterilizationStore } from '../../store/sterilizationStore';
import { useUser } from '../../contexts/UserContext';
import { BIFailureResolutionModal } from '../BIFailureResolution';

interface GlobalBIFailureBannerProps {
  onDismiss?: () => void;
}

// Inner component that only renders when not on login pages
const BIFailureBannerContent: React.FC<GlobalBIFailureBannerProps> = ({
  onDismiss,
}) => {
  const [showResolutionModal, setShowResolutionModal] = useState(false);
  const [isWorkflowMinimized, setIsWorkflowMinimized] = useState(false);

  // These hooks are only called when we're not on login pages
  const { biFailureActive, biFailureDetails } = useSterilizationStore();
  const { currentUser: _currentUser } = useUser();

  // Debug logging to understand what's happening (only log once per state change)
  // Debug logging removed for production cleanliness

  // Return null if no BI failure active
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
                {biFailureDetails?.failure_date && typeof biFailureDetails.failure_date === 'string'
                  ? new Date(biFailureDetails.failure_date).toLocaleDateString()
                  : biFailureDetails?.failure_date && (biFailureDetails.failure_date as unknown as Date) instanceof Date
                    ? (biFailureDetails.failure_date as unknown as Date).toLocaleDateString()
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
            onClick={() => {
              setShowResolutionModal(true);
              setIsWorkflowMinimized(false);
            }}
            className="flex items-center gap-2 bg-red-700 hover:bg-red-800 px-3 py-1 rounded-lg transition-colors"
            title={
              isWorkflowMinimized
                ? 'Resume workflow'
                : 'View resolution workflow'
            }
          >
            <Icon path={mdiClipboardList} size={1} className="text-white" />
            <span className="text-sm font-medium">
              {isWorkflowMinimized ? 'Resume Workflow' : 'Resolution Workflow'}
            </span>
          </button>

          {/* Affected Tools Count */}
          {biFailureDetails?.affected_tools_count !== undefined && (
            <div className="flex items-center gap-2 bg-red-700 px-3 py-1 rounded-lg">
              <Icon path={mdiPackage} size={1} className="text-white" />
              <span className="text-sm font-medium">
                {biFailureDetails.affected_tools_count} tools affected
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

// Main component that conditionally renders the banner content
const GlobalBIFailureBanner: React.FC<GlobalBIFailureBannerProps> = ({
  onDismiss,
}) => {
  const location = useLocation();

  // Check if we're on login/auth pages
  const isLoginPage =
    location.pathname === '/login' || location.pathname.startsWith('/auth');

  // Don't render anything on login pages - this prevents hooks from being called
  if (isLoginPage) {
    return null;
  }

  // Only render the content component when not on login pages
  return <BIFailureBannerContent onDismiss={onDismiss} />;
};

export default GlobalBIFailureBanner;
