import React from 'react';

interface SterilizationDashboardProps {
  SterilizationAnalyticsComponent: React.ComponentType;
}

/**
 * Main sterilization dashboard component that orchestrates the display of
 * sterilization analytics and workflow information.
 */
export const SterilizationDashboard: React.FC<SterilizationDashboardProps> = ({
  SterilizationAnalyticsComponent,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Sterilization Dashboard
        </h1>
        <p className="text-gray-600">
          Monitor sterilization processes, track compliance, and manage
          workflows.
        </p>
      </div>

      <SterilizationAnalyticsComponent />
    </div>
  );
};
