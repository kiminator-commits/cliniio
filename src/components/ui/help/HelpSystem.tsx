import React from 'react';
import { useHelpSystem } from './hooks/useHelpSystem';
import { HelpContentRenderer } from './HelpContentRenderer';

interface HelpSystemProps {
  isDrawerOpen: boolean;
  onClose: () => void;
}

export const HelpSystem: React.FC<HelpSystemProps> = ({
  isDrawerOpen,
  onClose,
}) => {
  const {
    selectedHelpType,
    expandedMetrics,
    expandedTasks,
    expandedGamification,
    expandedRelevant,
    currentContext,
    handleOptionClick,
    handleBack,
    handleFeedbackSuccess,
    toggleMetricSection,
    toggleTaskSection,
    toggleGamificationSection,
    toggleRelevantSection,
    setHelpType,
  } = useHelpSystem(onClose);

  const renderHelpContent = () => (
    <HelpContentRenderer
      selectedHelpType={selectedHelpType}
      currentContext={currentContext}
      expandedMetrics={expandedMetrics}
      expandedTasks={expandedTasks}
      expandedGamification={expandedGamification}
      expandedRelevant={expandedRelevant}
      onOptionClick={handleOptionClick}
      onBack={handleBack}
      onFeedbackSuccess={handleFeedbackSuccess}
      onToggleMetricSection={toggleMetricSection}
      onToggleTaskSection={toggleTaskSection}
      onToggleGamificationSection={toggleGamificationSection}
      onToggleRelevantSection={toggleRelevantSection}
      onSetHelpType={setHelpType}
    />
  );

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close help drawer"
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-screen w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-200 bg-[#4ECDC4] text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">?</span>
            </div>
            <div>
              <h2 className="text-lg font-bold">Help & Support</h2>
              <p className="text-xs text-white text-opacity-90">
                Choose how you'd like to get help
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {renderHelpContent()}
      </div>
    </>
  );
};
