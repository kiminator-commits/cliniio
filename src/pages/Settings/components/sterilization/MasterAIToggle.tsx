import React from 'react';
import Icon from '@mdi/react';
import { mdiBrain } from '@mdi/js';

interface MasterAIToggleProps {
  aiEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

const MasterAIToggle: React.FC<MasterAIToggleProps> = ({
  aiEnabled,
  onToggle,
}) => {
  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon path={mdiBrain} size={2} className="text-purple-600" />
        <div>
          <h5 className="text-xl font-semibold text-purple-800">
            Enable Sterilization AI
          </h5>
          <p className="text-purple-600">
            Unlock advanced AI capabilities for sterilization operations
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={aiEnabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ECDC4]"></div>
          <span className="sr-only">Activate AI-Powered Sterilization</span>
        </label>
        <span className="text-lg font-medium text-purple-800">
          Activate AI-Powered Sterilization
        </span>
      </div>
    </div>
  );
};

export default MasterAIToggle;
