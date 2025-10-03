import React from 'react';
import Icon from '@mdi/react';
import { mdiCheckCircle, mdiAlertCircle } from '@mdi/js';
import { ServiceStatus } from '../../AIAnalyticsSettings.types';
import { UI_TEXT } from '../../AIAnalyticsSettings.config';

interface SystemHealthProps {
  serviceStatus: ServiceStatus;
}

const SystemHealth: React.FC<SystemHealthProps> = ({ serviceStatus }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h5 className="text-sm font-medium text-blue-800 mb-3">
        {UI_TEXT.SECTIONS.AI_SERVICE_STATUS}
      </h5>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(serviceStatus).map(([service, status]) => (
          <div key={service} className="flex items-center gap-2">
            <Icon
              path={status ? mdiCheckCircle : mdiAlertCircle}
              size={1}
              className={status ? 'text-green-600' : 'text-red-500'}
            />
            <span className="text-sm capitalize">{service}</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                status
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {status ? UI_TEXT.STATUS.ACTIVE : UI_TEXT.STATUS.INACTIVE}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemHealth;
