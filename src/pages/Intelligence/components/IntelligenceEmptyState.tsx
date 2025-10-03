import React from 'react';
import Icon from '@mdi/react';
import { mdiBrain } from '@mdi/js';

interface IntelligenceEmptyStateProps {
  title?: string;
  description?: string;
  actionButton?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const IntelligenceEmptyState: React.FC<IntelligenceEmptyStateProps> = ({
  title = 'No Intelligence Data Available',
  description = 'The analytics dashboard is ready but no data has been loaded yet. Data will appear here once sterilization cycles, inventory items, and other metrics are available.',
  actionButton,
  icon = <Icon path={mdiBrain} size={3} className="text-gray-400" />,
  className = '',
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="bg-gray-50 rounded-lg p-8">
        <div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        {actionButton && (
          <div className="flex justify-center space-x-4">{actionButton}</div>
        )}
      </div>
    </div>
  );
};
