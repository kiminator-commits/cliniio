import React from 'react';
import Icon from '@mdi/react';
import { mdiCheck } from '@mdi/js';
import { ProblemType } from '@/types/sterilizationTypes';
import { PROBLEM_TYPES } from '../constants/problemTypes';

interface ProblemTypeSelectorProps {
  selectedProblemType: ProblemType | null;
  onProblemTypeSelect: (problemType: ProblemType) => void;
}

export const ProblemTypeSelector: React.FC<ProblemTypeSelectorProps> = ({
  selectedProblemType,
  onProblemTypeSelect,
}) => {
  return (
    <div className="space-y-3">
      {PROBLEM_TYPES.map((problem) => (
        <button
          key={problem.type}
          onClick={() => onProblemTypeSelect(problem.type)}
          className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
            selectedProblemType === problem.type
              ? 'border-red-300 bg-red-50'
              : 'border-gray-200 hover:border-red-200 bg-white hover:bg-red-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">{problem.label}</h4>
              <p className="text-sm text-gray-600">{problem.description}</p>
            </div>
            {selectedProblemType === problem.type && (
              <Icon path={mdiCheck} size={1} className="text-red-600" />
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
