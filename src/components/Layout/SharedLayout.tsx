import React, { Suspense } from 'react';
import { DrawerMenu } from '../Navigation/DrawerMenu';
import { ErrorBoundary } from '../ErrorBoundary';
import { LoadingSpinner } from '../ui/Skeleton';
import { FloatingHelpButton } from '../ui/FloatingHelpButton';
import { useNavigation } from '../../contexts/NavigationContext';

interface SharedLayoutProps {
  children: React.ReactNode;
}

export const SharedLayout: React.FC<SharedLayoutProps> = ({ children }) => {
  const { isDrawerOpen, openDrawer, closeDrawer } = useNavigation();

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
          <DrawerMenu
            isOpen={isDrawerOpen}
            onOpen={openDrawer}
            onClose={closeDrawer}
          />
          <div className="flex-1">
            <div className="pt-6">{children}</div>
          </div>
        </div>
        <FloatingHelpButton />
      </Suspense>
    </ErrorBoundary>
  );
};
