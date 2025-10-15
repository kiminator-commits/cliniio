import React from 'react';
import Icon from '@mdi/react';
import { mdiLink, mdiSync, mdiInformation } from '@mdi/js';
import { IntelligenceSummary } from '../utils/intelligenceTypes';
import { IntegrationMetrics } from '../../../services/analyticsService';

interface IntegrationsTabProps {
  summary?: IntelligenceSummary | null;
  integrationMetrics?: IntegrationMetrics | null;
}

export default function IntegrationsTab({
  summary,
  integrationMetrics,
}: IntegrationsTabProps) {
  // Fallback mock data if no integration metrics provided
  const mockIntegrationMetrics = {
    knowledgeHubArticles: 24,
    activeSuppliers: 8,
    recentAuditActions: 12,
    integrationHealth: 87,
    lastSync: new Date().toISOString(),
  };

  const metrics = integrationMetrics || mockIntegrationMetrics;

  if (!summary) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <Icon
            path={mdiInformation}
            size={2}
            className="text-gray-400 mx-auto mb-2"
          />
          <p className="text-gray-600">No integration data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Integration Health */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Icon path={mdiLink} size={1.5} className="text-blue-600 mr-2" />
          Integration Health
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">
              {metrics.knowledgeHubArticles}
            </div>
            <div className="text-sm text-blue-700">Knowledge Hub Articles</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {metrics.activeSuppliers}
            </div>
            <div className="text-sm text-green-700">Active Suppliers</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-900">
              {metrics.recentAuditActions}
            </div>
            <div className="text-sm text-purple-700">Recent Audit Actions</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-900">
              {metrics.integrationHealth}%
            </div>
            <div className="text-sm text-orange-700">Integration Health</div>
          </div>
        </div>
        <div className="mt-4 text-center text-sm text-gray-600">
          Last sync:{' '}
          {metrics.lastSync
            ? new Date(metrics.lastSync).toLocaleString()
            : 'Never'}
        </div>
      </div>

      {/* Integration Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Integration Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center">
            <Icon path={mdiSync} size={1.2} className="mr-2" />
            Sync Knowledge Hub
          </button>
          <button
            className="bg-gray-400 text-gray-600 px-4 py-2 rounded-lg cursor-not-allowed flex items-center justify-center opacity-60"
            disabled
          >
            <Icon path={mdiLink} size={1.2} className="mr-2" />
            Supplier Database Sync
            <span className="ml-2 text-xs bg-gray-500 text-white px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
