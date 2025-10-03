import React, { useState, useEffect } from 'react';
import { serviceConsolidator } from '@/services/ServiceConsolidator';
import { servicePerformanceMonitor } from '@/services/ServicePerformanceMonitor';

interface PerformanceSummary {
  totalServices: number;
  totalInstances: number;
  totalMemoryUsage: number;
  averageResponseTime: number;
  servicesWithIssues: number;
}

interface ConsolidationReport {
  totalServices: number;
  duplicateServices: string[];
  consolidationOpportunities: ConsolidationOpportunity[];
  performanceImpact: PerformanceImpact;
}

interface ConsolidationOpportunity {
  serviceName: string;
  reason: string;
  potentialSavings: number;
}

interface PerformanceImpact {
  memoryReduction: number;
  initializationTimeReduction: number;
  duplicateCallsReduction: number;
}

interface ServiceConsolidationDashboardProps {
  isVisible?: boolean;
  onClose?: () => void;
}

export const ServiceConsolidationDashboard: React.FC<
  ServiceConsolidationDashboardProps
> = ({ isVisible = false, onClose }) => {
  const [consolidationReport, setConsolidationReport] =
    useState<ConsolidationReport | null>(null);
  const [performanceSummary, setPerformanceSummary] =
    useState<PerformanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [report, summary] = await Promise.all([
          serviceConsolidator.analyzeServices(),
          Promise.resolve(servicePerformanceMonitor.getPerformanceSummary()),
        ]);
        setConsolidationReport(report);
        setPerformanceSummary(summary);
      } catch (error) {
        console.error('Failed to load service data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-4/5 h-4/5 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              Service Consolidation Dashboard
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto h-full">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Performance Summary */}
              {performanceSummary && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Performance Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {performanceSummary.totalServices}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Services
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {performanceSummary.totalInstances}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Instances
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {(
                          performanceSummary.totalMemoryUsage /
                          1024 /
                          1024
                        ).toFixed(1)}
                        MB
                      </div>
                      <div className="text-sm text-gray-600">Memory Usage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {performanceSummary.servicesWithIssues}
                      </div>
                      <div className="text-sm text-gray-600">Issues</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Consolidation Report */}
              {consolidationReport && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Consolidation Opportunities
                  </h3>

                  {consolidationReport.consolidationOpportunities.length > 0 ? (
                    <div className="space-y-2">
                      {consolidationReport.consolidationOpportunities.map(
                        (
                          opportunity: ConsolidationOpportunity,
                          index: number
                        ) => (
                          <div
                            key={index}
                            className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-yellow-800">
                                  {opportunity.serviceName}
                                </h4>
                                <p className="text-sm text-yellow-600 mt-1">
                                  {opportunity.reason}
                                </p>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-yellow-800">
                                  Potential Savings:{' '}
                                  {opportunity.potentialSavings}ms
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-green-800">
                        No consolidation opportunities found. Services are
                        optimized!
                      </p>
                    </div>
                  )}

                  {/* Duplicate Services */}
                  {consolidationReport.duplicateServices.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 mb-2">
                        Duplicate Services
                      </h4>
                      <div className="space-y-1">
                        {consolidationReport.duplicateServices.map(
                          (service: string, index: number) => (
                            <div key={index} className="text-sm text-red-600">
                              • {service}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Performance Impact */}
                  {consolidationReport.performanceImpact && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">
                        Potential Performance Impact
                      </h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="font-medium">Memory Reduction</div>
                          <div className="text-blue-600">
                            {
                              consolidationReport.performanceImpact
                                .memoryReduction
                            }
                            KB
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Init Time Reduction</div>
                          <div className="text-blue-600">
                            {
                              consolidationReport.performanceImpact
                                .initializationTimeReduction
                            }
                            ms
                          </div>
                        </div>
                        <div>
                          <div className="font-medium">Call Reduction</div>
                          <div className="text-blue-600">
                            {
                              consolidationReport.performanceImpact
                                .duplicateCallsReduction
                            }{' '}
                            calls
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      await serviceConsolidator.consolidateServices();
                      // Reload data
                      const [report, summary] = await Promise.all([
                        serviceConsolidator.analyzeServices(),
                        Promise.resolve(
                          servicePerformanceMonitor.getPerformanceSummary()
                        ),
                      ]);
                      setConsolidationReport(report);
                      setPerformanceSummary(summary);
                    } catch (error) {
                      console.error('Failed to consolidate services:', error);
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Consolidating...' : 'Consolidate Services'}
                </button>

                <button
                  onClick={() => {
                    // Reload data
                    const loadData = async () => {
                      setIsLoading(true);
                      try {
                        const [report, summary] = await Promise.all([
                          serviceConsolidator.analyzeServices(),
                          Promise.resolve(
                            servicePerformanceMonitor.getPerformanceSummary()
                          ),
                        ]);
                        setConsolidationReport(report);
                        setPerformanceSummary(summary);
                      } catch (error) {
                        console.error('Failed to reload data:', error);
                      } finally {
                        setIsLoading(false);
                      }
                    };
                    loadData();
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Refresh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
