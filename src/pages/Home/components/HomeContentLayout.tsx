import React, { useMemo, useEffect, useState } from 'react';
import clsx from 'clsx';
import { HOME_UI_CONSTANTS } from '../../../constants/homeUiConstants';
import { Task } from '../../../store/homeStore';
import { supabase } from '../../../lib/supabaseClient';
import { Card } from '../../../components/ui/card';
import Button from '../../../components/ui/button';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

// Import components directly instead of lazy loading to prevent container shifting
import HomeTasksSection from './HomeTasksSection';
import HomeMetricsSection from './HomeMetricsSection';
import HomeGamificationSection from './HomeGamificationSection';

interface HomeContentLayoutProps {
  gamificationData: {
    streak?: number;
    level?: number;
    rank?: number;
    totalScore?: number;
  };
  tasks: Task[] | undefined;
  loading: boolean;
  taskError: string | null;
  storeAvailablePoints: number;
  storeShowFilters: boolean;
  setStoreShowFilters: (show: boolean) => void;
  selectedCategory: string;
  selectedType: string;
  onCategoryChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onTaskToggle: (taskId: string, points?: number) => void;
  onTaskUpdate: (taskId: string, updatedTask: Task) => void;
  aiMetrics?: Record<string, unknown>;
  sterilizationMetrics?:
    | Record<string, unknown>
    | import('../../../services/homeSterilizationIntegration').SterilizationHomeMetrics;
  integrationMetrics?:
    | Record<string, unknown>
    | import('../../../services/homeIntegrationService').HomeIntegrationMetrics;
  aiImpactMetrics?: Record<string, unknown>; // Add AI impact metrics prop
}

const HomeContentLayout: React.FC<HomeContentLayoutProps> = React.memo(
  ({
    gamificationData,
    tasks,
    loading,
    taskError,
    storeAvailablePoints,
    storeShowFilters,
    setStoreShowFilters,
    selectedCategory,
    selectedType,
    onCategoryChange,
    onTypeChange,
    onTaskToggle,
    onTaskUpdate,
    aiMetrics,
    sterilizationMetrics,
    integrationMetrics,
    aiImpactMetrics, // Add AI impact metrics parameter
  }) => {
    // Compliance Alert state
    const [flagCount, setFlagCount] = useState<number | null>(null);
    const [loadingFlags, setLoadingFlags] = useState(true);

    // Fetch audit flag count
    useEffect(() => {
      async function fetchFlagCount() {
        try {
          const { count, error } = await supabase
            .from('audit_flags')
            .select('*', { count: 'exact', head: true })
            .eq('resolved', false);
          if (!error && typeof count === 'number') {
            setFlagCount(count);
          }
        } catch (e) {
          console.error('Failed to fetch compliance flags:', e);
        } finally {
          setLoadingFlags(false);
        }
      }
      fetchFlagCount();
    }, []);
    // Memoize the layout classes to prevent recalculation on every render
    const layoutClasses = useMemo(
      () =>
        clsx(
          'flex flex-col lg:flex-row gap-6', // Use flexbox instead of grid for better height control
          `mt-${HOME_UI_CONSTANTS.SPACING.MARGIN_TOP}`
        ),
      []
    );

    // Memoize the container padding class
    const containerClass = useMemo(
      () => clsx(`p-${HOME_UI_CONSTANTS.SPACING.PADDING}`),
      []
    );

    return (
      <div className={containerClass}>
        {/* Load all sections in parallel instead of sequentially */}
        <div className="space-y-6">
          {/* Compliance Alert Card */}
          <Card className="p-4 flex flex-col items-start justify-between bg-muted/40 border border-border shadow-sm">
            <h2 className="text-lg font-semibold mb-1">Compliance Status</h2>

            {loadingFlags ? (
              <div className="flex items-center gap-2 text-muted">
                <Loader2 className="w-4 h-4 animate-spin" /> Checking system
                compliance…
              </div>
            ) : flagCount && flagCount > 0 ? (
              <>
                <p className="text-sm text-destructive">
                  ⚠️ {flagCount} unresolved compliance{' '}
                  {flagCount === 1 ? 'issue' : 'issues'} detected.
                </p>
                <Link to="/settings?section=system&tab=audit">
                  <Button variant="destructive" size="sm" className="mt-2">
                    Review in System Admin
                  </Button>
                </Link>
              </>
            ) : (
              <p className="text-sm text-green-600">
                ✅ All systems compliant.
              </p>
            )}
          </Card>

          <HomeGamificationSection gamificationData={gamificationData} />

          <div className={layoutClasses}>
            {/* Fixed height wrapper to prevent layout shifting */}
            <div className="flex-1 h-[515px] flex flex-col">
              <HomeTasksSection
                tasks={tasks}
                loading={loading}
                taskError={taskError}
                storeAvailablePoints={storeAvailablePoints}
                storeShowFilters={storeShowFilters}
                setStoreShowFilters={setStoreShowFilters}
                selectedCategory={selectedCategory}
                selectedType={selectedType}
                onCategoryChange={onCategoryChange}
                onTypeChange={onTypeChange}
                onTaskToggle={onTaskToggle}
                onTaskUpdate={onTaskUpdate}
              />
            </div>

            <div className="flex-1 h-[515px] flex flex-col">
              <HomeMetricsSection
                loading={loading}
                aiMetrics={aiMetrics}
                sterilizationMetrics={sterilizationMetrics}
                integrationMetrics={integrationMetrics}
                aiImpactMetrics={aiImpactMetrics}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

HomeContentLayout.displayName = 'HomeContentLayout';

export default HomeContentLayout;
