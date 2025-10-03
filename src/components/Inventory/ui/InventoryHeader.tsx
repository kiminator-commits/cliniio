import React from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

// Removed unused interface - no props needed

const InventoryHeader: React.FC = () => {
  return (
    <div
      className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4"
      role="banner"
      aria-label="Inventory management header"
    >
      <div>
        <h1 className="text-2xl font-bold text-[#5b5b5b] mb-1">
          Inventory Management
        </h1>
        <p className="text-gray-500 text-sm">
          Track and manage your inventory items and equipment
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div
          className="bg-white rounded-lg shadow p-4 flex items-center gap-4"
          style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
          role="region"
          aria-label="Item scanner controls"
        >
          <span className="text-gray-600">Item Scanner</span>
          <Link to="/inventory/scanner">
            <Button
              variant="success"
              className="bg-[#4ECDC4] hover:bg-[#3db8b0] border-[#4ECDC4] hover:border-[#3db8b0] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-1"
              aria-label="Scan new inventory item using barcode scanner"
              tabIndex={0}
            >
              Inventory Scanner
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InventoryHeader;
