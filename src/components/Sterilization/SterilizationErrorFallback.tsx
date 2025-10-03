import React from 'react';

const SterilizationErrorFallback: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-red-600 mb-2">
        Sterilization Error
      </h2>
      <p className="text-gray-700 mb-4">
        An error occurred while loading sterilization data
      </p>
      <button
        onClick={() => {
          // Clear any cached data and re-render
          window.location.reload();
        }}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Refresh Page
      </button>
    </div>
  </div>
);

export default SterilizationErrorFallback;
