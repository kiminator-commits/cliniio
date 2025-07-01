import React from 'react';

const InventoryErrorFallback: React.FC = () => {
  return (
    <div className="text-red-600 p-4 font-semibold">
      Inventory failed to load. Please refresh or try again later.
    </div>
  );
};

export default InventoryErrorFallback;
