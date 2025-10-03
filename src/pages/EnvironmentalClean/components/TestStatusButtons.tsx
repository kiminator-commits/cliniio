import React from 'react';
import StatusButtons from './ui/StatusButtons';
import { RoomStatusType } from '../types';

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
