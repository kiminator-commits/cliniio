import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SharedLayout } from '../../components/Layout/SharedLayout';
import KnowledgeHubErrorBoundary from './components/ErrorBoundaries/KnowledgeHubErrorBoundary';
import {
  SimplifiedKnowledgeHubProvider,
  useSimplifiedKnowledgeHub,
} from './providers/SimplifiedKnowledgeHubProvider';
import { RecentUpdatesPanel } from './components/RecentUpdatesPanel';
import { CategoriesPanel } from './components/CategoriesPanel';
import { ContentTable } from './components/ContentTable';
import { useAILearning } from './hooks/useAILearning';

const KnowledgeHubContent: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { content, isLoading } = useSimplifiedKnowledgeHub();

  // Initialize AI learning capabilities - defer to avoid blocking initial render
  const {
    learningInsights,
    storeSessionAnalytics,
    isLoading: aiLoading,
  } = useAILearning();

  const handleNavigateToLibrary = useCallback(() => {
    navigate('/library');
  }, [navigate]);

  const _handleError = useCallback((error: unknown) => {
    console.error('Knowledge Hub error:', error);
    // Additional error handling logic can be added here
  }, []);

  // Track page view for AI analytics - defer to avoid blocking mount
  React.useEffect(() => {
    // Defer AI analytics to avoid blocking initial render
    const timer = setTimeout(() => {
      if (!aiLoading && learningInsights) {
        storeSessionAnalytics({
          session_start: new Date().toISOString(),
          content_items_accessed: ['knowledge_hub_main'],
          learning_path_progress: { current_page: 'knowledge_hub' },
        });
      }
    }, 100); // Small delay to allow initial render

    return () => clearTimeout(timer);
  }, [aiLoading, learningInsights, storeSessionAnalytics]);

  // Show empty state when no content is available
  if (!isLoading && (!content || content.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
        <p className="text-lg font-medium">No content yet</p>
        <p className="text-sm mt-1">
          Add something from the Library to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#5b5b5b] mb-1">
            Knowledge Hub
          </h1>
          <p className="text-gray-500 text-sm">
            Access training materials and educational resources
          </p>
        </div>
        <button
          onClick={handleNavigateToLibrary}
          className="rounded-md bg-[#4ECDC4] px-4 py-2 text-white hover:bg-[#3db8b0] transition"
        >
          + Library
        </button>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar */}
        <div className="lg:w-1/4 space-y-6">
          <RecentUpdatesPanel />
          <CategoriesPanel />
          {/* AI Learning Insights Panel - Hidden but functional */}
          {!aiLoading && learningInsights && (
            <div className="hidden">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <h3 className="font-semibold text-gray-900 mb-2">
                  AI Learning Insights
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    Efficiency: {learningInsights?.learning_efficiency_score}%
                  </p>
                  <p>
                    Next Milestone: {learningInsights?.next_learning_milestone}
                  </p>
                  <p>
                    Optimal Study Time:{' '}
                    {learningInsights?.optimal_study_duration} min
                  </p>
                  {learningInsights?.skill_gaps?.length > 0 && (
                    <p>Skill Gaps: {learningInsights.skill_gaps.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          <ContentTable />
        </div>
      </div>
    </div>
  );
});

KnowledgeHubContent.displayName = 'KnowledgeHubContent';

const KnowledgeHub: React.FC = React.memo(() => {
  const _handleError = useCallback((error: unknown) => {
    console.error('Knowledge Hub error:', error);
    // Additional error handling logic can be added here
  }, []);

  return (
    <KnowledgeHubErrorBoundary>
      <SharedLayout>
        <SimplifiedKnowledgeHubProvider>
          <KnowledgeHubContent />
        </SimplifiedKnowledgeHubProvider>
      </SharedLayout>
    </KnowledgeHubErrorBoundary>
  );
});

KnowledgeHub.displayName = 'KnowledgeHub';

export default KnowledgeHub;
