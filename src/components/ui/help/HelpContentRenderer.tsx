import React, { useState as _useState, useEffect as _useEffect } from 'react';
import { HelpNavigation } from './HelpNavigation';
import { AIChat } from './AIChat';
import { ContextHelp } from './ContextHelp';
import { FeedbackForm } from './FeedbackForm';
import { TourSystem } from './TourSystem';
import { CliniioHelpContent } from './content/CliniioHelpContent';
import { PerformanceMetricsContent } from './content/PerformanceMetricsContent';
import { TaskManagementContent } from './content/TaskManagementContent';
import { GamificationContent } from './content/GamificationContent';
import { AIFeaturesContent } from './content/AIFeaturesContent';
import { NewFeaturesContent } from './content/NewFeaturesContent';

interface HelpContentRendererProps {
  selectedHelpType: string | null;
  currentContext: string;
  expandedMetrics: Set<string>;
  expandedTasks: Set<string>;
  expandedGamification: Set<string>;
  expandedRelevant: Set<string>;
  onOptionClick: (option: {
    action: string;
    path?: string;
    title: string;
  }) => void;
  onBack: () => void;
  onFeedbackSuccess: () => void;
  onToggleMetricSection: (sectionName: string) => void;
  onToggleTaskSection: (sectionName: string) => void;
  onToggleGamificationSection: (sectionName: string) => void;
  onToggleRelevantSection: (sectionName: string) => void;
  onSetHelpType: (type: string) => void;
}

const SterilizationWorkflowContent: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
          >
            ← Back
          </button>
          <div>
            <h3 className="font-medium text-gray-900">
              Sterilization Workflow
            </h3>
            <p className="text-xs text-gray-500">
              Sterilization processes and procedures
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="text-center text-gray-500 py-8">
          <p>Sterilization workflow content coming soon.</p>
        </div>
      </div>
    </div>
  );
};

const ReportingComplianceContent: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
          >
            ← Back
          </button>
          <div>
            <h3 className="font-medium text-gray-900">
              Reporting and Compliance
            </h3>
            <p className="text-xs text-gray-500">
              Documentation and regulatory compliance procedures
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="text-center text-gray-500 py-8">
          <p>Reporting and compliance content coming soon.</p>
        </div>
      </div>
    </div>
  );
};

const BITestingContent: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex items-center p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-200"
          >
            ← Back
          </button>
          <div>
            <h3 className="font-medium text-gray-900">BI Testing</h3>
            <p className="text-xs text-gray-500">
              Biological indicator testing protocols
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <div className="text-center text-gray-500 py-8">
          <p>BI testing content coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export const HelpContentRenderer: React.FC<HelpContentRendererProps> = ({
  selectedHelpType,
  currentContext,
  expandedMetrics,
  expandedTasks,
  expandedGamification,
  expandedRelevant,
  onOptionClick,
  onBack,
  onFeedbackSuccess,
  onToggleMetricSection,
  onToggleTaskSection,
  onToggleGamificationSection,
  onToggleRelevantSection,
  onSetHelpType,
}) => {
  if (!selectedHelpType) {
    return <HelpNavigation onOptionClick={onOptionClick} />;
  }

  switch (selectedHelpType) {
    case 'ai-chat':
      return <AIChat currentContext={currentContext} onBack={onBack} />;

    case 'context-help':
      return (
        <ContextHelp
          currentContext={currentContext}
          expandedRelevant={expandedRelevant}
          onToggleRelevantSection={onToggleRelevantSection}
          onBack={onBack}
        />
      );

    case 'product-feedback':
      return <FeedbackForm onBack={onBack} onSuccess={onFeedbackSuccess} />;

    case 'onboarding':
      return <TourSystem onBack={onBack} />;

    case 'cliniio-help':
      return (
        <CliniioHelpContent
          currentContext={currentContext}
          onBack={onBack}
          onSetHelpType={onSetHelpType}
        />
      );

    case 'performance-metrics':
      return (
        <PerformanceMetricsContent
          onBack={onBack}
          expandedMetrics={expandedMetrics}
          onToggleMetricSection={onToggleMetricSection}
          onSetHelpType={onSetHelpType}
        />
      );

    case 'task-management':
      return (
        <TaskManagementContent
          onBack={onBack}
          onSetHelpType={onSetHelpType}
          expandedTasks={expandedTasks}
          onToggleTaskSection={onToggleTaskSection}
        />
      );

    case 'gamification':
      return (
        <GamificationContent
          onBack={onBack}
          onSetHelpType={onSetHelpType}
          expandedGamification={expandedGamification}
          onToggleGamificationSection={onToggleGamificationSection}
        />
      );

    case 'ai-features':
      return <AIFeaturesContent onBack={onBack} />;

    case 'new-features':
      return <NewFeaturesContent onBack={onBack} />;

    case 'bi-testing':
      return <BITestingContent onBack={onBack} />;

    case 'sterilization-workflow':
      return <SterilizationWorkflowContent onBack={onBack} />;

    case 'reporting-compliance':
      return <ReportingComplianceContent onBack={onBack} />;

    default:
      return <HelpNavigation onOptionClick={onOptionClick} />;
  }
};
