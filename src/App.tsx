import React, { lazy, Suspense } from 'react';

// ⚠️ TEMPORARY: force cleanup of stale realtime subscriptions
// import '@/debug/runRealtimeCleanup';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { logger as _logger } from '@/services/loggerService';
import RouteLoader from '@/components/common/RouteLoader';
import { clearMockData } from '@/services/clearMockData';
import { NavigationProvider } from './contexts/NavigationContext';
import { UserProvider } from './contexts/UserContext';
import { FacilityProvider } from './contexts/FacilityContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProtectedRoute } from './components/ProtectedRoute';
import GlobalBIFailureBanner from './components/Sterilization/GlobalBIFailureBanner';
import NotificationContainer from './components/notifications/NotificationContainer';
import { EnhancedPerformanceDashboard } from './components/EnhancedPerformanceDashboard';

// CRITICAL: Import realtime auto-optimizer to prevent database overload
import './services/_core/realtimeCompatibility';

// Import enhanced performance tracking
import './services/EnhancedPerformanceService';

// Direct imports for critical pages only
import HomePage from './pages/Home';

// Lazy load all other pages for better performance
const SterilizationPage = lazy(() => import('./pages/Sterilization/Sterilization'));
const InventoryPage = lazy(() => import('./pages/Inventory'));
const EnvironmentalCleanPage = lazy(() => import('./pages/EnvironmentalClean/page'));
const KnowledgeHubPage = lazy(() => import('./pages/KnowledgeHub'));
const LibraryPage = lazy(() => import('./pages/library/page'));

// Lazy load scanner pages (large components)
const ScannerPage = lazy(() => import('./pages/Sterilization/ScannerPage'));
const InventoryScannerPage = lazy(
  () => import('./pages/Inventory/ScannerPage')
);
const EnvironmentalCleanScannerPage = lazy(
  () => import('./pages/EnvironmentalClean/ScannerPage')
);

// Lazy load non-critical pages
const SettingsPage = lazy(() => import('./pages/Settings'));
const ContentBuilderPage = lazy(() => import('./pages/ContentBuilder'));
const CourseViewer = lazy(() => import('./pages/CourseViewer'));
const LoginPage = lazy(() => import('./pages/Login'));
const IntelligencePage = lazy(() => import('./pages/Intelligence'));
const AuthCallback = lazy(() => import('./components/AuthCallback'));
const HelpArticlePage = lazy(() => import('./pages/Help/HelpArticlePage'));

// BEGIN PostgREST runtime guard (safe, no-UI side effects)
interface ExtendedWindow extends Window {
  __postgrestGuardInstalled?: boolean;
  __postgrestGuardLogged?: boolean;
  __facilityIdCache?: { id: string; timestamp: number };
}

// Cache for facility ID to avoid async calls in fetch guard
let facilityIdCache: { id: string; timestamp: number } | null = null;
const FACILITY_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function updateFacilityIdCache() {
  // Don't try to get facility ID on login page
  if (typeof window !== 'undefined' && window.location.pathname === '/login') {
    return;
  }

  try {
    // Dynamic import to avoid circular dependencies
    const { FacilityService } = await import('./services/facilityService');
    const facilityId = await FacilityService.getCurrentFacilityId();

    // If no facility ID (user not authenticated), use development fallback
    if (!facilityId) {
      console.warn('No facility ID available - using development fallback');
      facilityIdCache = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: Date.now(),
      };
      return;
    }

    facilityIdCache = { id: facilityId, timestamp: Date.now() };
  } catch (error) {
    console.warn('Failed to update facility ID cache:', error);
    // Keep existing cache if available, otherwise use development fallback
    if (!facilityIdCache) {
      facilityIdCache = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        timestamp: Date.now(),
      };
    }
  }
}

function getCurrentFacilityId(): string {
  const now = Date.now();

  // Return cached ID if still valid
  if (
    facilityIdCache &&
    now - facilityIdCache.timestamp < FACILITY_CACHE_DURATION
  ) {
    return facilityIdCache.id;
  }

  // If cache is stale, trigger async update but return current cached value
  if (facilityIdCache) {
    updateFacilityIdCache(); // Fire and forget
    return facilityIdCache.id;
  }

  // Do not fallback to dev facility ID in production
  if (!facilityIdCache) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using dev facility fallback in development mode');
      return '550e8400-e29b-41d4-a716-446655440000';
    }
    throw new Error(
      'Facility ID lookup failed — no fallback allowed in production.'
    );
  }

  // This should never be reached due to the logic above, but TypeScript needs it
  throw new Error('Unexpected state in getCurrentFacilityId');
}

function installPostgrestFetchGuard() {
  const extWindow = window as ExtendedWindow;
  if (typeof window === 'undefined' || extWindow.__postgrestGuardInstalled)
    return;

  // Check if fetch is available (for test environments)
  if (typeof window.fetch === 'undefined') return;

  extWindow.__postgrestGuardInstalled = true;

  const SUPABASE_REST_MARKER = '.supabase.co/rest/v1/';
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      let url = typeof input === 'string' ? input : (input as URL).toString();
      if (url.includes(SUPABASE_REST_MARKER)) {
        const u = new URL(url);

        // Helper: strip a trailing ":1" token that some builders append to values
        const stripTrailingColonOne = (val: string) =>
          val.endsWith(':1') ? val.slice(0, -2) : val;

        // 1) Pass 1 – normalize/clean each param
        const pendingDeletes: string[] = [];
        const pendingSets: Array<[string, string]> = [];
        for (const [k, vRaw] of u.searchParams.entries()) {
          const v = vRaw.trim();

          // Remove any empty eq filter: key=eq. / eq / eq: / eq:. / .
          if (
            v === 'eq.' ||
            v === 'eq' ||
            v === 'eq:' ||
            v === 'eq:.' ||
            v === '.'
          ) {
            pendingDeletes.push(k);
            continue;
          }

          // Fix facility_id special case eq.:1 → eq.<UUID>
          if (
            k === 'facility_id' &&
            (v === 'eq.:1' || v === 'eq:1' || v === ':1' || v === 'eq.:')
          ) {
            const currentFacilityId = getCurrentFacilityId();
            pendingSets.push(['facility_id', `eq.${currentFacilityId}`]);
            continue;
          }

          // Generic fix: if any value ends with ":1", strip it (e.g., date=eq.2025-08-15:1)
          const vStripped = stripTrailingColonOne(v);
          if (vStripped !== v) {
            pendingSets.push([k, vStripped]);
            continue;
          }

          // Remove the illegal column-vs-column comparison
          if (k === 'quantity' && v === 'lt.reorder_point') {
            pendingDeletes.push(k);
            continue;
          }
        }
        pendingDeletes.forEach((k) => u.searchParams.delete(k));
        pendingSets.forEach(([k, v]) => {
          u.searchParams.set(k, v);
        });

        // 2) Belt-and-suspenders raw replacements for edge cases
        // facility_id=eq.:1 → eq.<UUID>
        if (u.search.includes('facility_id=eq.:1')) {
          const currentFacilityId = getCurrentFacilityId();
          u.search = u.search.replace(
            'facility_id=eq.:1',
            `facility_id=eq.${currentFacilityId}`
          );
        }
        // Remove any lingering key=eq. pairs produced by odd joiners
        u.search = u.search.replace(
          /(^|&)([^=&]+)=eq\.(?=(&|$))/g,
          (_m, p1) => {
            // drop the whole pair
            return p1 ? p1.slice(0, -1) : '';
          }
        );
        // Strip trailing ":1" from any param value (ultra-safe catch-all)
        u.search = u.search.replace(/(:1)(?=(&|$))/g, '');
        // Remove literal quantity=lt.reorder_point if present
        u.search = u.search.replace(
          /(^|&)quantity=lt\.reorder_point(?=(&|$))/g,
          (_m, p1) => (p1 ? p1.slice(0, -1) : '')
        );

        // 3) Deduplicate params
        const deduped = new URL(u.toString());
        const seen = new Map<string, string>();
        for (const [k, v] of deduped.searchParams.entries()) seen.set(k, v);
        deduped.search = '';
        for (const [k, v] of seen.entries()) deduped.searchParams.append(k, v);

        if (deduped.toString() !== url) {
          if (!extWindow.__postgrestGuardLogged) {
            extWindow.__postgrestGuardLogged = true;
            console.info('🛡️ PostgREST guard rewrote URL:', {
              from: url,
              to: deduped.toString(),
            });
          }
          url = deduped.toString();
          input = url;
        }
      }
    } catch (err) {
      console.error(err);
      throw err; // Re-throw the error to maintain proper error handling
    }
    return nativeFetch(input, init);
  };
}
// END PostgREST runtime guard

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ✅ Per-query control instead of forced global false
      refetchOnWindowFocus: true,
      retry: 1,
      staleTime: 1000 * 60 * 2,
      refetchOnMount: (query) => query.queryKey.includes('live'),
    },
    mutations: {
      retry: 1,
    },
  },
});

if (import.meta.env.MODE !== 'production') {
  clearMockData();
}

function App() {
  const [showPerformanceDashboard, setShowPerformanceDashboard] = React.useState(false);

  // Initialize services and install guards once on client
  React.useEffect(() => {
    // Initialize inventory service facade
    // import('./services/inventory/InventoryServiceFacade').then(
    //   ({ inventoryServiceFacade }) => {
    //     inventoryServiceFacade.initialize().catch((error) => {
    //       console.error(
    //         'Failed to initialize inventory service facade:',
    //         error
    //       );
    //     });
    //   }
    // );

    // Initialize facility ID cache for fetch guard
    updateFacilityIdCache();

    // Install PostgREST runtime guard
    installPostgrestFetchGuard();

    // Start real-time status monitoring
    import('./services/monitoring/realTimeStatusMonitor').then(
      ({ realTimeStatusMonitor }) => {
        realTimeStatusMonitor.startMonitoring();
      }
    );

    // Add keyboard shortcut for performance dashboard (Ctrl+Shift+P)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        event.preventDefault();
        setShowPerformanceDashboard(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <UserProvider>
          <FacilityProvider>
            <Router>
              <NavigationProvider>
                <Suspense fallback={<RouteLoader />}>
                  <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/auth/callback" element={<AuthCallback />} />
                  <Route
                    path="/home"
                    element={
                      <ProtectedRoute>
                        <HomePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sterilization"
                    element={
                      <ProtectedRoute>
                        <SterilizationPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/sterilization/scanner"
                    element={
                      <ProtectedRoute>
                        <ScannerPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/inventory"
                    element={
                      <ProtectedRoute>
                        <InventoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/inventory/scanner"
                    element={
                      <ProtectedRoute>
                        <InventoryScannerPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/environmental-clean"
                    element={
                      <ProtectedRoute>
                        <EnvironmentalCleanPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/environmental-clean/scanner"
                    element={
                      <ProtectedRoute>
                        <EnvironmentalCleanScannerPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/knowledge-hub"
                    element={
                      <ProtectedRoute>
                        <KnowledgeHubPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/library"
                    element={
                      <ProtectedRoute>
                        <LibraryPage />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/intelligence"
                    element={
                      <ProtectedRoute>
                        <IntelligencePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/content-builder"
                    element={
                      <ProtectedRoute>
                        <ContentBuilderPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/course/:courseId"
                    element={
                      <ProtectedRoute>
                        <CourseViewer />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/help/article/:slug"
                    element={<HelpArticlePage />}
                  />
                  <Route path="/" element={<Navigate to="/home" replace />} />
                  </Routes>
                </Suspense>
                <NotificationContainer />
              </NavigationProvider>
              <GlobalBIFailureBanner />
            </Router>
          </FacilityProvider>
        </UserProvider>
      </ErrorBoundary>
      
      {/* Enhanced Performance Dashboard */}
      <EnhancedPerformanceDashboard
        isVisible={showPerformanceDashboard}
        onClose={() => setShowPerformanceDashboard(false)}
      />
    </QueryClientProvider>
  );
}

export default App;
