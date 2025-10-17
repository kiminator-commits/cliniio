import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnvironmentalCleanDataManager } from '../hooks/useEnvironmentalCleanDataManager';
import { useEnvironmentalCleanFilters } from '../hooks/useEnvironmentalCleanFilters';
import { useEnvironmentalCleanAudit } from '../hooks/useEnvironmentalCleanAudit';
import EnvironmentalCleanHeader from './EnvironmentalCleanHeader';
import EnvironmentalCleanStatusPanel from './EnvironmentalCleanStatusPanel';
import EnvironmentalCleanAnalyticsPanel from './EnvironmentalCleanAnalyticsPanel';
import EnvironmentalCleanChecklistsPanel from './EnvironmentalCleanChecklistsPanel';
import { RoomStatusProvider } from '../context/RoomStatusContext';
import { Room } from '../models';

const EnvironmentalCleanItem = React.memo<{ clean: Room }>(({ clean }) => {
  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h3 className="font-medium text-gray-900">Room {clean.id}</h3>
      <p className="text-sm text-gray-600">Status: {clean.status}</p>
    </div>
  );
});

EnvironmentalCleanItem.displayName = 'EnvironmentalCleanItem';

const EnvironmentalCleanContent: React.FC = () => {
  const navigate = useNavigate();
  const [isScanning] = useState(false);
  const audit = useEnvironmentalCleanAudit();
  const auditRef = useRef(audit);

  // Update ref in effect to avoid accessing during render
  useEffect(() => {
    auditRef.current = audit;
  }, [audit]);

  // Set up real-time updates for environmental cleaning changes
  // Temporarily disabled to fix production issues
  // useEnvironmentalCleanRealtime(handleRealtimeUpdate, true);

  // Temporarily disable offline functionality to prevent service worker issues
  // useEnvironmentalCleanOffline();

  const { rooms: cleans } = useEnvironmentalCleanDataManager();
  const {
    searchTerm,
    status: filterStatus,
    onSearchChange,
    onStatusChange,
  } = useEnvironmentalCleanFilters(cleans);

  // Log page view on mount only
  useEffect(() => {
    auditRef.current.mutate({ action: 'view_page' });
  }, []);

  // Log status filter change
  useEffect(() => {
    if (filterStatus && filterStatus !== 'all') {
      auditRef.current.mutate({
        action: 'filter_status',
        item: { status: filterStatus },
      });
    }
  }, [filterStatus]);

  // Handle scan button click
  const handleScanClick = () => {
    // Navigate to the scanner page
    console.log('🔍 Navigating to scanner page...');
    navigate('/environmental-clean/scanner');
  };

  return (
    <RoomStatusProvider>
      <div className="p-6 space-y-6">
        <EnvironmentalCleanHeader
          isScanning={isScanning}
          onScan={handleScanClick}
          searchTerm={searchTerm}
          onSearchTermChange={onSearchChange}
          selectedStatus={filterStatus}
          onStatusChange={onStatusChange}
        />

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row gap-4">
              <EnvironmentalCleanStatusPanel />
              <EnvironmentalCleanAnalyticsPanel />
            </div>
            <EnvironmentalCleanChecklistsPanel />
          </div>
        </div>
      </div>
    </RoomStatusProvider>
  );
};

export default EnvironmentalCleanContent;
