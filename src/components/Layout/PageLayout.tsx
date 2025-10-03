import React from 'react';
import { ErrorBoundary } from '../ErrorBoundary';

interface PageLayoutProps {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  headerAction?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  children,
  headerAction,
}) => {
  return (
    <ErrorBoundary>
      <div className="px-6">
        {title && (
          <div className="pb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{title}</h1>
            {description && (
              <p className="text-gray-600 text-lg">{description}</p>
            )}
            {headerAction && <div className="mt-4">{headerAction}</div>}
          </div>
        )}
        {children}
      </div>
    </ErrorBoundary>
  );
};
