import React from 'react';
import { CleaningMetrics } from '../../types/EnvironmentalCleaningTypes';

type CleaningMetricsCardProps = {
  metrics: CleaningMetrics;
};

const CleaningMetricsCard: React.FC<CleaningMetricsCardProps> = ({ metrics }) => {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="text-lg font-semibold mb-4">Cleaning Metrics</h3>
      <div className="space-y-2">
        <div>Total Rooms: {metrics.totalRooms}</div>
        <div>Rooms Cleaned: {metrics.roomsCleaned}</div>
        <div>Rooms Pending: {metrics.roomsPending}</div>
      </div>
    </div>
  );
};

export default CleaningMetricsCard;
