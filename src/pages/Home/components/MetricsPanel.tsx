import React from 'react';
import clsx from 'clsx';
import { PerformanceMetrics } from '@/components/PerformanceMetrics/PerformanceMetrics';
import { HOME_UI_CONSTANTS } from '../../../constants/homeUiConstants';
import { MIN_PANEL_WIDTH } from '../../../constants/layoutConstants';

interface MetricsPanelProps {
  metrics: {
    [key: string]: number | string;
  };
}

export function MetricsPanel({ metrics }: MetricsPanelProps) {
  return (
    <div
      className={clsx(
        'bg-white',
        MIN_PANEL_WIDTH,
        `rounded-${HOME_UI_CONSTANTS.BORDER.RADIUS}`,
        `shadow-${HOME_UI_CONSTANTS.SHADOW}`,
        `p-${HOME_UI_CONSTANTS.SPACING.PADDING}`,
        `border-l-${HOME_UI_CONSTANTS.BORDER.LEFT_WIDTH}`,
        `border-[${HOME_UI_CONSTANTS.COLORS.PRIMARY}]`,
        `border-opacity-${HOME_UI_CONSTANTS.COLORS.BORDER_OPACITY}`
      )}
    >
      <PerformanceMetrics metrics={metrics} />
    </div>
  );
}
