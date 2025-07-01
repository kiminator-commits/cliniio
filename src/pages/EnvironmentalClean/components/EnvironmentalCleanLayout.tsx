import React from 'react';

interface EnvironmentalCleanLayoutProps {
  header: React.ReactNode;
  roomStatusSummary: React.ReactNode;
  mainContent: React.ReactNode;
  modals?: React.ReactNode;
  notification?: React.ReactNode;
  isScanning?: boolean;
  onCloseNotification?: () => void;
}

const EnvironmentalCleanLayout: React.FC<EnvironmentalCleanLayoutProps> = ({
  header,
  roomStatusSummary,
  mainContent,
  modals,
}) => {
  return (
    <div className="p-6 space-y-6">
      {header}
      {roomStatusSummary}
      {mainContent}
      {modals}
    </div>
  );
};

export default EnvironmentalCleanLayout;
