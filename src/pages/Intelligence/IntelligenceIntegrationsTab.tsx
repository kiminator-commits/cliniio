import React from 'react';
import { Icon } from '@mdi/react';
import {
  mdiLink,
  mdiCheckCircle,
  mdiAlert,
  mdiClock,
  mdiSync,
  mdiWrench,
} from '@mdi/js';
import { IntegrationMetrics } from './utils/intelligenceTypes';

interface IntelligenceIntegrationsTabProps {
  integrationMetrics: IntegrationMetrics;
}

export const IntelligenceIntegrationsTab: React.FC<
  IntelligenceIntegrationsTabProps
> = ({ integrationMetrics }) => {
  return (
    <div className="space-y-6">
      {/* Integration Health Metrics */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Icon path={mdiLink} size={1} className="text-blue-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Integration Health Metrics
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {(integrationMetrics as { overallHealthScore?: number })
                .overallHealthScore || 0}
              %
            </div>
            <div className="text-sm text-green-700">Overall Health</div>
          </div>

          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {(integrationMetrics as { activeIntegrations?: number })
                .activeIntegrations || 0}
            </div>
            <div className="text-sm text-blue-700">Active Integrations</div>
          </div>

          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {(integrationMetrics as { failedIntegrations?: number })
                .failedIntegrations || 0}
            </div>
            <div className="text-sm text-yellow-700">Failed Integrations</div>
          </div>

          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {(integrationMetrics as { lastSyncHours?: number })
                .lastSyncHours || 0}
              h
            </div>
            <div className="text-sm text-purple-700">Last Sync</div>
          </div>
        </div>
      </div>

      {/* Integration Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Icon
            path={mdiCheckCircle}
            size={1}
            className="text-green-500 mr-2"
          />
          <h3 className="text-lg font-semibold text-gray-900">
            Integration Status
          </h3>
        </div>

        {integrationMetrics &&
        typeof integrationMetrics === 'object' &&
        'integrations' in integrationMetrics &&
        Array.isArray(integrationMetrics.integrations) &&
        integrationMetrics.integrations.length > 0 ? (
          <div className="space-y-4">
            {integrationMetrics.integrations.map(
              (integration: unknown, index: number) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-3 ${
                          integration.status === 'healthy'
                            ? 'bg-green-500'
                            : integration.status === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                        }`}
                      />
                      <h4 className="font-medium text-gray-900">
                        {integration.name}
                      </h4>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        integration.status === 'healthy'
                          ? 'bg-green-100 text-green-800'
                          : integration.status === 'warning'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {integration.status}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 font-medium">
                        {integration.type || 'Unknown'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Sync:</span>
                      <span className="ml-2 font-medium">
                        {new Date(
                          integration.lastSyncTime || integration.lastSync || ''
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Response Time:</span>
                      <span className="ml-2 font-medium">
                        {integration.responseTime || 0}ms
                      </span>
                    </div>
                  </div>

                  {(integration.errorMessage || integration.error) && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <Icon
                          path={mdiAlert}
                          size={0.8}
                          className="text-red-500 mr-2"
                        />
                        <span className="text-sm text-red-700">
                          {integration.errorMessage || integration.error}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Icon
              path={mdiLink}
              size={2}
              className="mx-auto mb-2 text-gray-400"
            />
            <p>No integration data available</p>
          </div>
        )}
      </div>

      {/* Integration Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <Icon path={mdiWrench} size={1} className="text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">
            Integration Actions
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Manual Sync</h4>
            <p className="text-sm text-gray-600 mb-4">
              Force synchronization of all integrations to ensure data
              consistency
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 flex items-center">
              <Icon path={mdiSync} size={0.8} className="mr-2" />
              Sync All Integrations
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Health Check</h4>
            <p className="text-sm text-gray-600 mb-4">
              Run a comprehensive health check on all system integrations
            </p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 flex items-center">
              <Icon path={mdiCheckCircle} size={0.8} className="mr-2" />
              Run Health Check
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Last System Check</h4>
          <div className="flex items-center text-sm text-gray-600">
            <Icon path={mdiClock} size={0.8} className="mr-2" />
            {integrationMetrics &&
            typeof integrationMetrics === 'object' &&
            'lastSystemCheck' in integrationMetrics &&
            typeof integrationMetrics.lastSystemCheck === 'string'
              ? new Date(integrationMetrics.lastSystemCheck).toLocaleString()
              : 'Never'}
          </div>
        </div>
      </div>
    </div>
  );
};
