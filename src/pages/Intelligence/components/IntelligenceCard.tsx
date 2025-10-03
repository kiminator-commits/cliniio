import React from 'react';

interface IntelligenceCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const IntelligenceCard: React.FC<IntelligenceCardProps> = ({
  children,
  className = '',
  title,
  icon,
  action,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
    >
      {(title || icon || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <div className="flex items-center">
              {icon && <span className="mr-2">{icon}</span>}
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
