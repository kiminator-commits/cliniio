import React from 'react';
import Icon from '@mdi/react';
import { mdiPlus, mdiRobot } from '@mdi/js';
import { UI_TEXT } from '../../LearningPathwayBuilder.config';

interface PathwayOverviewProps {
  addSection: () => void;
  organizePathwaySmartly: () => void;
  selectedPathwayItemsLength: number;
  isOrganizing: boolean;
}

export const PathwayOverview: React.FC<PathwayOverviewProps> = ({
  addSection,
  organizePathwaySmartly,
  selectedPathwayItemsLength,
  isOrganizing,
}) => {
  return (
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-900">{UI_TEXT.PATHWAY_TITLE}</h4>
          <p className="text-sm text-gray-600">{UI_TEXT.PATHWAY_DESCRIPTION}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={addSection}
            className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Icon path={mdiPlus} size={0.8} className="mr-1" />
            {UI_TEXT.ADD_SECTION_BUTTON}
          </button>
          <button
            onClick={organizePathwaySmartly}
            disabled={selectedPathwayItemsLength === 0 || isOrganizing}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <Icon path={mdiRobot} size={0.8} className="mr-1" />
            {isOrganizing
              ? UI_TEXT.ORGANIZING_BUTTON
              : UI_TEXT.SMART_ORGANIZE_BUTTON}
          </button>
        </div>
      </div>
    </div>
  );
};
