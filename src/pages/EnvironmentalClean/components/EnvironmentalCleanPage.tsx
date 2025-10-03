import React from 'react';
import { SkipLink } from '../utils/keyboardNavigation';
import EnvironmentalCleanHeader from './EnvironmentalCleanHeader';
import EnvironmentalCleanContent from './EnvironmentalCleanContent';
import { RoomStatusType } from '../models';

interface EnvironmentalCleanPageProps {
  onScan: () => void;
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedStatus: 'all' | RoomStatusType;
  onStatusChange: (value: 'all' | RoomStatusType) => void;
}

const EnvironmentalCleanPage: React.FC<EnvironmentalCleanPageProps> = ({
  onScan,
  searchTerm,
  onSearchTermChange,
  selectedStatus,
  onStatusChange,
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip links for keyboard navigation */}
      <SkipLink targetId="main-content">Skip to main content</SkipLink>
      <SkipLink targetId="room-status-summary">
        Skip to room status summary
      </SkipLink>
      <SkipLink targetId="cleaning-analytics">
        Skip to cleaning analytics
      </SkipLink>
      <SkipLink targetId="cleaning-checklists">
        Skip to cleaning checklists
      </SkipLink>

      <main id="main-content" className="container mx-auto px-4 py-6">
        <EnvironmentalCleanHeader
          onScan={onScan}
          searchTerm={searchTerm}
          onSearchTermChange={onSearchTermChange}
          selectedStatus={selectedStatus}
          onStatusChange={onStatusChange}
        />

        <EnvironmentalCleanContent />
      </main>
    </div>
  );
};

export default EnvironmentalCleanPage;
