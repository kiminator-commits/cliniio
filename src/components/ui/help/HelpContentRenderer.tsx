import React from 'react';
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
  onOptionClick: (option: { action: string; path?: string; title: string }) => void;
  onBack: () => void;
  onFeedbackSuccess: () => void;
  onToggleMetricSection: (sectionName: string) => void;
  onSetHelpType: (type: string) => void;
}

export const HelpContentRenderer: React.FC<HelpContentRendererProps> = ({
  selectedHelpType,
  currentContext,
  expandedMetrics,
  onOptionClick,
  onBack,
  onFeedbackSuccess,
  onToggleMetricSection,
  onSetHelpType,
}) => {
  if (!selectedHelpType) {
    return <HelpNavigation onOptionClick={onOptionClick} />;
  }

  switch (selectedHelpType) {
    case 'ai-chat':
      return <AIChat currentContext={currentContext} onBack={onBack} />;

    case 'context-help':
      return <ContextHelp currentContext={currentContext} />;

    case 'product-feedback':
      return (
        <FeedbackForm onBack={onBack} onSuccess={onFeedbackSuccess} />
      );

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
        />
      );

    case 'task-management':
      return <TaskManagementContent onBack={onBack} />;

    case 'gamification':
      return <GamificationContent onBack={onBack} />;

    case 'ai-features':
      return <AIFeaturesContent onBack={onBack} />;

    case 'new-features':
      return <NewFeaturesContent onBack={onBack} />;

    default:
      return <HelpNavigation onOptionClick={onOptionClick} />;
  }
};
