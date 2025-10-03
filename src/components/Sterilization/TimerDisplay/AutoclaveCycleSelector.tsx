import React from 'react';
import { AUTOCLAVE_CYCLES } from '../../../config/autoclaveCycles';

interface AutoclaveCycleSelectorProps {
  selectedCycle: string;
  onCycleSelect: (cycleKey: string) => void;
}

export const AutoclaveCycleSelector: React.FC<AutoclaveCycleSelectorProps> = ({
  selectedCycle,
  onCycleSelect,
}) => {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h4 className="text-sm font-medium text-gray-700 mb-3">
        Select Cycle Type:
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(AUTOCLAVE_CYCLES).map(([cycleKey, cycle]) => (
          <button
            key={cycleKey}
            onClick={() => onCycleSelect(cycleKey)}
            className={`p-3 text-xs rounded-lg border transition-all duration-200 ${
              selectedCycle === cycleKey
                ? 'bg-[#4ECDC4] text-white border-[#4ECDC4] shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-[#4ECDC4]'
            }`}
          >
            <div className="font-medium">{cycle.name}</div>
            <div className="text-xs opacity-75">{cycle.temp}</div>
            <div className="text-xs opacity-75">{cycle.totalTime} min</div>
          </button>
        ))}
      </div>
    </div>
  );
};
