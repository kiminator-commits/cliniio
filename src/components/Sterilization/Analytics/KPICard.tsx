import React from 'react';
import Icon from '@mdi/react';
import { mdiTrendingUp, mdiTrendingDown, mdiAlert } from '@mdi/js';
import clsx from 'clsx';

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

const GRADIENT_MAP: Record<string, string> = {
  'blue-500': 'from-blue-500 to-blue-600',
  'green-500': 'from-green-500 to-emerald-600',
  'red-500': 'from-red-500 to-rose-600',
  'yellow-500': 'from-yellow-500 to-orange-500',
  'purple-500': 'from-purple-500 to-purple-600',
  'gray-400': 'from-gray-400 to-gray-500',
};

const BORDER_MAP: Record<string, string> = {
  'blue-200': 'border-blue-200',
  'green-200': 'border-green-200',
  'red-200': 'border-red-200',
  'yellow-200': 'border-yellow-200',
  'purple-200': 'border-purple-200',
  'gray-200': 'border-gray-200',
};

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
  gradientTo: _gradientTo,
  borderColor,
  textColor,
  valueColor,
  trend,
}) => {
  const gradient = GRADIENT_MAP[gradientFrom] || 'from-gray-400 to-gray-500';
  const border = BORDER_MAP[borderColor] || 'border-gray-200';

  return (
    <div
      className={clsx(
        'bg-gradient-to-br p-4 rounded-lg border',
        gradient,
        border
      )}
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
