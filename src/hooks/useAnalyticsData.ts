import { useMemo } from 'react';
import { useSterilizationStore } from '@/store/sterilizationStore';
import { logger } from '@/services/loggerService';

interface BITest {
  status: string;
  [key: string]: unknown;
}

interface ComplianceStats {
  passRate?: number;
  [key: string]: unknown;
}

export function useAnalyticsData() {
  // ✅ Select reactive slices instead of static getState()
  const { tools, biTests, complianceStats } = useSterilizationStore((state) => ({
    tools: state.tools,
    biTests: state.biTests,
    complianceStats: state.complianceStats,
  }));

  // ✅ Dynamic memo that recalculates on store changes
  const additionalMetrics = useMemo(() => {
    if (!tools || !biTests || !Array.isArray(tools) || !Array.isArray(biTests)) {
      return { efficiency: 0, compliance: 0 };
    }

    const totalTools = tools.length;
    const completedTests = (biTests as BITest[]).filter((t) => t.status === 'completed').length;
    const failedTests = (biTests as BITest[]).filter((t) => t.status === 'failed').length;

    const efficiency = totalTools ? Math.round((completedTests / totalTools) * 100) : 0;
    const compliance = (complianceStats as ComplianceStats)?.passRate ?? 0;

    logger.debug('📊 Analytics recomputed', { efficiency, compliance, failedTests });
    return { efficiency, compliance, failedTests };
  }, [tools, biTests, complianceStats]);

  return additionalMetrics;
}
