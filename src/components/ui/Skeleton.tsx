import React from 'react';

// Base skeleton component with customizable animation
interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  children,
}) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-label="Loading content"
      role="status"
    >
      {children}
    </div>
  );
};

// Card skeleton for dashboard cards
export const CardSkeleton: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
    <Skeleton className="h-4 w-3/4 mb-4" />
    <Skeleton className="h-8 w-1/2 mb-2" />
    <Skeleton className="h-3 w-full mb-1" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

// Table skeleton for data tables
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    {/* Table header skeleton */}
    <div className="bg-gray-50 px-6 py-4 border-b">
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} className="h-4 flex-1" />
        ))}
      </div>
    </div>

    {/* Table rows skeleton */}
    <div className="divide-y divide-gray-200">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="px-6 py-4">
          <div className="flex space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`cell-${rowIndex}-${colIndex}`}
                className="h-4 flex-1"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// List skeleton for lists of items
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, index) => (
      <div
        key={index}
        className="flex items-center space-x-4 p-4 bg-white rounded-lg shadow-sm"
      >
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
);

// Form skeleton for forms
export const FormSkeleton: React.FC = () => (
  <div className="space-y-6">
    <div className="space-y-4">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-4 w-1/5" />
      <Skeleton className="h-20 w-full" />
    </div>
    <div className="flex space-x-4">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);

// Dashboard skeleton for dashboard layouts
export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-32" />
    </div>

    {/* Cards grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>

    {/* Main content skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <TableSkeleton rows={6} columns={4} />
      </div>
      <div className="space-y-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  </div>
);

// Navigation skeleton for navigation components
export const NavigationSkeleton: React.FC = () => (
  <div className="space-y-2">
    {Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="flex items-center space-x-3 p-3">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-4 flex-1" />
      </div>
    ))}
  </div>
);

// Modal skeleton for modal content
export const ModalSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
    <div className="flex justify-between items-center mb-6">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-6 w-6" />
    </div>
    <FormSkeleton />
  </div>
);

// Chart skeleton for analytics charts
export const ChartSkeleton: React.FC = () => (
  <div className="bg-white rounded-lg p-6">
    <Skeleton className="h-6 w-48 mb-4" />
    <div className="flex items-end justify-between h-32 space-x-2">
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="flex-1"
          style={{ height: `${(index % 3) * 20 + 30}%` }}
        >
          <Skeleton className="h-full" />
        </div>
      ))}
    </div>
  </div>
);

// Profile skeleton for user profiles
export const ProfileSkeleton: React.FC = () => (
  <div className="flex items-center space-x-4 p-4">
    <Skeleton className="h-16 w-16 rounded-full" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

// Search skeleton for search interfaces
export const SearchSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="flex space-x-2">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-20" />
    </div>
    <div className="flex space-x-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Skeleton key={index} className="h-8 w-16" />
      ))}
    </div>
  </div>
);

// Loading spinner for when skeleton is not appropriate
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex justify-center items-center p-4">
      <div
        className={`animate-spin rounded-full border-4 border-t-transparent border-blue-500 ${sizeClasses[size]}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

// Generic loading fallback that chooses appropriate skeleton
export const LoadingFallback: React.FC<{
  type?:
    | 'card'
    | 'table'
    | 'list'
    | 'form'
    | 'dashboard'
    | 'navigation'
    | 'modal'
    | 'chart'
    | 'profile'
    | 'search'
    | 'spinner';
  className?: string;
  rows?: number;
  columns?: number;
  items?: number;
}> = ({ type = 'spinner', className = '', rows, columns, items }) => {
  const components = {
    card: <CardSkeleton className={className} />,
    table: <TableSkeleton rows={rows} columns={columns} />,
    list: <ListSkeleton items={items} />,
    form: <FormSkeleton />,
    dashboard: <DashboardSkeleton />,
    navigation: <NavigationSkeleton />,
    modal: <ModalSkeleton />,
    chart: <ChartSkeleton />,
    profile: <ProfileSkeleton />,
    search: <SearchSkeleton />,
    spinner: <LoadingSpinner />,
  };

  return components[type] || <LoadingSpinner />;
};
