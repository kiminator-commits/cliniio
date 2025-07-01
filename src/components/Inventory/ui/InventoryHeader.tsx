import React from 'react';
import { Button } from 'react-bootstrap';

interface InventoryHeaderProps {
  onScanClick: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({ onScanClick }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
      <div>
        <h1 className="text-2xl font-bold text-[#5b5b5b] mb-1">Inventory Management</h1>
        <p className="text-gray-500 text-sm">Track and manage your inventory items and equipment</p>
      </div>
      <div
        className="bg-white rounded-lg shadow p-4 flex items-center gap-4"
        style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
      >
        <span className="text-gray-600">Item Scanner</span>
        <Button
          variant="success"
          onClick={onScanClick}
          className="bg-[#4ECDC4] hover:bg-[#3db8b0] border-[#4ECDC4] hover:border-[#3db8b0] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Scan Item
        </Button>
      </div>
    </div>
  );
};

export default InventoryHeader;
