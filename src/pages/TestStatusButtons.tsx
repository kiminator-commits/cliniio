import React from 'react';
import StatusButtons from './EnvironmentalClean/components/ui/StatusButtons';
import { RoomStatusType } from './EnvironmentalClean/types';

const TestStatusButtons: React.FC = () => {
  const handleStatusSelect = (status: RoomStatusType) => {
    console.log('Selected:', status);
  };

  return (
    <div className="p-8">
      <StatusButtons
        currentStatuses={['available', 'biohazard']}
        onStatusSelect={handleStatusSelect}
      />
    </div>
  );
};

export default TestStatusButtons;
