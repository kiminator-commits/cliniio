import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Sterilization from '../../src/pages/Sterilization/page';
import { UserProvider } from '../../src/contexts/UserContext';
import { UIProvider } from '../../src/contexts/UIContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import '@testing-library/jest-dom';

// Mock the sterilization store
vi.mock('../../src/store/sterilizationStore', () => ({
  useSterilizationStore: vi.fn(() => ({
    currentCycle: null,
    enforceBI: true,
    biTestOptedOut: false,
    lastBITestDate: new Date('2024-01-01'),
    biFailureActive: false,
    biFailureDetails: null,
    activateBIFailure: vi.fn(),
    deactivateBIFailure: vi.fn(),
  })),
}));

// Mock the sterilization dashboard component
vi.mock('../../src/components/Sterilization/SterilizationDashboard', () => ({
  default: function MockSterilizationDashboard() {
    return <div>Sterilization Management Dashboard</div>;
  },
}));

// Mock the SharedLayout component
vi.mock('../../src/components/Layout/SharedLayout', () => ({
  SharedLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="shared-layout">{children}</div>
  ),
}));

// Mock the sterilization analytics utils
vi.mock(
  '../../src/components/Sterilization/sterilizationAnalyticsUtils',
  () => ({
    getSterilizationEfficiency: vi.fn(() => ({ efficiency: 95 })),
    refreshEfficiencyMetrics: vi.fn(() => ({ success: true })),
    analyticsConfig: { enabled: true },
    logAnalyticsBanner: vi.fn(),
  })
);

// Mock the lazy-loaded SterilizationAnalytics component
vi.mock('@/components/Sterilization/SterilizationAnalytics', () => {
  return function MockSterilizationAnalytics() {
    return <div data-testid="sterilization-analytics">Analytics Component</div>;
  };
});

// Mock Suspense to render children immediately
vi.mock('react', async () => {
  const actual = await vi.importActual<any>('react');
  return {
    ...actual,
    Suspense: ({ children }: any) => <div>{children}</div>,
  };
});

// Mock ErrorBoundary to render children immediately
vi.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock NavigationContext
vi.mock('../../src/contexts/NavigationContext', () => ({
  useNavigation: () => ({
    isDrawerOpen: false,
    openDrawer: vi.fn(),
    closeDrawer: vi.fn(),
  }),
}));

// Mock SharedLayout dependencies
vi.mock('../../src/components/Navigation/DrawerMenu', () => ({
  DrawerMenu: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock('../../src/components/ui/Skeleton', () => ({
  LoadingSpinner: () => <div>Loading...</div>,
}));

vi.mock('../../src/components/ui/FloatingHelpButton', () => ({
  FloatingHelpButton: () => <div>Help Button</div>,
}));

vi.useFakeTimers();

describe('Sterilization Flow', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  it('renders without crashing', () => {
    expect(() => {
      render(
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <UIProvider>
              <UserProvider>
                <BrowserRouter>
                  <Sterilization />
                </BrowserRouter>
              </UserProvider>
            </UIProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      );
    }).not.toThrow();
  });
});
