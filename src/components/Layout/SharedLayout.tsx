import React, { Suspense, useState, useEffect } from 'react';
import { DrawerMenu } from '../Navigation/DrawerMenu';
import { ErrorBoundary } from '../ErrorBoundary';
import { LoadingSpinner } from '../ui/Skeleton';
import { FloatingHelpButton } from '../ui/FloatingHelpButton';
import { useNavigation } from '../../contexts/NavigationContext';
import { supabase } from '../../lib/supabaseClient';

interface SharedLayoutProps {
  children: React.ReactNode;
  hasComplianceIssues?: boolean;
  hasAIUsageIssues?: boolean;
}

export const SharedLayout: React.FC<SharedLayoutProps> = ({ children, hasComplianceIssues, hasAIUsageIssues }) => {
  const { isDrawerOpen, openDrawer, closeDrawer } = useNavigation();
  const [globalComplianceIssues, setGlobalComplianceIssues] = useState<boolean>(false);

  // Check for compliance issues globally
  useEffect(() => {
    async function checkComplianceIssues() {
      try {
        const { data, error } = await supabase
          .from('audit_flags')
          .select('id')
          .eq('resolved', false)
          .limit(1);

        if (!error) {
          setGlobalComplianceIssues(data && data.length > 0);
        }
      } catch (e) {
        console.error('Failed to check compliance issues:', e);
      }
    }

    checkComplianceIssues();

    // Listen for compliance issue resolution events
    const handleComplianceResolved = () => {
      setTimeout(() => {
        checkComplianceIssues();
      }, 1000); // Wait for database to update
    };

    window.addEventListener('complianceIssueResolved', handleComplianceResolved);
    return () => window.removeEventListener('complianceIssueResolved', handleComplianceResolved);
  }, []);

  // Use prop if provided (from Settings page), otherwise use global state
  const finalComplianceIssues = hasComplianceIssues !== undefined ? hasComplianceIssues : globalComplianceIssues;

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
          <DrawerMenu
            isOpen={isDrawerOpen}
            onOpen={openDrawer}
            onClose={closeDrawer}
            hasComplianceIssues={finalComplianceIssues}
            hasAIUsageIssues={hasAIUsageIssues || false}
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
