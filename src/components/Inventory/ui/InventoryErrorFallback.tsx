import React from 'react';

const InventoryErrorFallback: React.FC = () => (
  <div className="text-red-600 p-4">
    An error occurred while loading inventory data or components. Please try again or contact your
    system administrator. If this continues, log out and back in to reset your session.
    <button
      onClick={() => window.location.reload()}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
    >
      Retry
    </button>
  </div>
);

export default InventoryErrorFallback;
