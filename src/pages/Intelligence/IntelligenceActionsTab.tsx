import React from 'react';
import { Icon } from '@mdi/react';
import { mdiExclamation, mdiArrowRight } from '@mdi/js';
import { UrgentAction } from './utils/intelligenceTypes';

interface IntelligenceActionsTabProps {
  getUrgentActions: () => UrgentAction[];
}

export const IntelligenceActionsTab: React.FC<IntelligenceActionsTabProps> = ({
  getUrgentActions,
}) => {
  return (
    <div className="space-y-6">
      {/* Urgent Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Icon
            path={mdiExclamation}
            size={1.5}
            className="text-red-600 mr-2"
          />
          Urgent Actions Required
        </h3>
        <div className="space-y-4">
          {getUrgentActions().map((action, index) => (
            <div
              key={index}
              className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-900">{action.message}</h4>
                  {action.type === 'critical_supply' && action.items && (
                    <div className="mt-2">
                      <p className="text-sm text-red-700">Critical supplies:</p>
                      <ul className="text-sm text-red-600 mt-1 space-y-1">
                        {action.items.map((item, idx) => (
                          <li key={idx} className="flex items-center">
                            <Icon
                              path={mdiArrowRight}
                              size={0.8}
                              className="mr-2"
                            />
                            {item.itemName} - Reorder by{' '}
                            {new Date(
                              item.recommendedReorderDate
                            ).toLocaleDateString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <button className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700">
                  Take Action
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
