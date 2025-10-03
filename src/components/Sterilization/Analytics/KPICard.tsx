import React from 'react';
import Icon from '@mdi/react';
import { mdiTrendingUp, mdiTrendingDown, mdiAlert } from '@mdi/js';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: string;
  iconBgColor: string;
  gradientFrom: string;
  gradientTo: string;
  borderColor: string;
  textColor: string;
  valueColor: string;
  trend?: {
    direction: 'up' | 'down' | 'warning';
    value: string;
  } | null;
}

/**
 * KPICard component for displaying key performance indicators.
 * Shows metrics with icons, values, and trend indicators.
 */
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  iconBgColor,
  gradientFrom,
  gradientTo,
  borderColor,
  textColor,
  valueColor,
  trend,
}) => {
  return (
    <div
      className={`bg-gradient-to-br from-${gradientFrom} to-${gradientTo} p-4 rounded-lg border border-${borderColor}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${textColor}`}>{title}</p>
          <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
        </div>
        <div className={`p-2 ${iconBgColor} rounded-lg`}>
          <Icon path={icon} size={1.5} className="text-white" />
        </div>
      </div>
      {trend && (
        <div className={`mt-2 flex items-center text-xs ${textColor}`}>
          <Icon
            path={
              trend.direction === 'up'
                ? mdiTrendingUp
                : trend.direction === 'down'
                  ? mdiTrendingDown
                  : mdiAlert
            }
            size={0.8}
            className="mr-1"
          />
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  );
};
