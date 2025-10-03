import { useState, useMemo, useEffect } from 'react';
import { SharedLayout } from '../../components/Layout/SharedLayout';
import { IntelligenceHeader } from './components/IntelligenceHeader';
import IntelligenceTabNavigation from './components/IntelligenceTabNavigation';
import OverviewTab from './tabs/OverviewTab';
import ForecastingTab from './tabs/ForecastingTab';
import RisksTab from './tabs/RisksTab';
import ActionsTab from './tabs/ActionsTab';
import InsightsTab from './tabs/InsightsTab';
import IntegrationsTab from './tabs/IntegrationsTab';
import { useForecastingIntelligence } from '../../hooks/useForecastingIntelligence';
import { useFacility } from '../../contexts/FacilityContext';
import {
  IntelligenceRecommendationService,
  IntelligenceIntegrationService,
  IntelligenceRecommendation,
  OptimizationTip,
  RiskAlert,
  IntegrationMetrics,
} from '../../services/analytics';

export default function IntelligencePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [recommendations, setRecommendations] = useState<
    IntelligenceRecommendation[]
  >([]);
  const [optimizationTips, setOptimizationTips] = useState<OptimizationTip[]>(
    []
  );
  const [integrationMetrics, setIntegrationMetrics] =
    useState<IntegrationMetrics | null>(null);
  const [actionableInsights, setActionableInsights] = useState<RiskAlert[]>([]);
  const [insightsSummary, setInsightsSummary] = useState<Record<
    string,
    unknown
  > | null>(null);

  const { getCurrentFacilityId } = useFacility();
  const facilityId = getCurrentFacilityId();

  // Memoize filters to prevent infinite re-renders
  const filters = useMemo(
    () => ({ facilityId: facilityId || '' }),
    [facilityId]
  );
  const { summary, loading, lastUpdated, refreshData } =
    useForecastingIntelligence(filters);

  // Generate insights when summary data is available
  useEffect(() => {
    if (summary) {
      // Generate recommendations and insights
      const generateInsights = async () => {
        try {
          const recs =
            await IntelligenceRecommendationService.generateRecommendations(
              summary
            );
          const tips =
            await IntelligenceRecommendationService.generateOptimizationTips(
              summary
            );
          const alerts =
            await IntelligenceRecommendationService.generateRiskAlerts(summary);
          const insights =
            await IntelligenceRecommendationService.getActionableInsights(
              summary
            );

          setRecommendations(recs || []);
          setOptimizationTips(tips || []);
          setActionableInsights(alerts || []);
          setInsightsSummary(insights || null);

          // Get integration metrics
          IntelligenceIntegrationService.getIntegrationMetrics().then(
            setIntegrationMetrics
          );
        } catch (error) {
          console.error('Error generating insights:', error);
        }
      };

      generateInsights();
    }
  }, [summary]);

  function renderTab(tab: string) {
    switch (tab) {
      case 'forecasting':
        return <ForecastingTab summary={summary} />;
      case 'risks':
        return <RisksTab summary={summary} />;
      case 'actions':
        return (
          <ActionsTab
            summary={summary}
            recommendations={recommendations}
            optimizationTips={optimizationTips}
          />
        );
      case 'insights':
        return (
          <InsightsTab
            summary={summary}
            recommendations={recommendations}
            optimizationTips={optimizationTips}
            insightsSummary={insightsSummary}
          />
        );
      case 'integrations':
        return (
          <IntegrationsTab
            summary={summary}
            integrationMetrics={integrationMetrics}
          />
        );
      case 'overview':
        return (
          <OverviewTab
            summary={summary}
            actionableInsights={actionableInsights}
          />
        );
      default:
        return null;
    }
  }

  return (
    <SharedLayout>
      <div style={{ padding: '2rem' }}>
        <IntelligenceHeader
          loading={loading}
          lastUpdated={lastUpdated}
          onRefresh={refreshData}
        />
        <IntelligenceTabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        <div style={{ marginTop: '1rem' }}>{renderTab(activeTab)}</div>
      </div>
    </SharedLayout>
  );
}
