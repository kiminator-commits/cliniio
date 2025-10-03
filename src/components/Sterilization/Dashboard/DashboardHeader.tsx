import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@mdi/react';
import { mdiBarcode } from '@mdi/js';

/**
 * DashboardHeader component for displaying the main header and scanner controls.
 * Shows the title, description, and tool scanner button.
 */
export const DashboardHeader: React.FC = memo(() => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-[#5b5b5b] mb-1">
          Sterilization Management
        </h1>
        <p className="text-gray-500 text-sm">
          Manage sterilization cycles, track tools, and monitor performance
        </p>
      </div>

      {/* Scanner Container */}
      <div
        className="bg-white rounded-lg shadow p-6 flex items-center gap-4"
        style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
      >
        <span className="text-gray-600">Tool Scanner</span>
        <Link
          to="/sterilization/scanner"
          className="bg-[#4ECDC4] hover:bg-[#3db8b0] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 flex items-center gap-2"
        >
          <Icon path={mdiBarcode} size={1} />
          Scan Tool
        </Link>
      </div>
    </div>
  );
});

DashboardHeader.displayName = 'DashboardHeader';
