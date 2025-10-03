import React from 'react';
import { vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '../../src/components/ErrorBoundary';
import { UIProvider } from '../../src/contexts/UIContext';
import { UserProvider } from '../../src/contexts/UserContext';
import App from '../../src/App';

// Mock the pages that are imported in App.tsx
vi.mock('@/pages/Login/index', () => ({
  __esModule: true,
  default: () => <div data-testid="login-page">Login Page</div>,
}));

vi.mock('@/pages/Home/index', () => ({
  __esModule: true,
  default: () => <div data-testid="home-page">Home Page</div>,
}));

vi.mock('@/pages/Sterilization/Sterilization', () => ({
  __esModule: true,
  default: () => <div data-testid="sterilization-page">Sterilization Page</div>,
}));

vi.mock('@/pages/Inventory/index', () => ({
  __esModule: true,
  default: () => <div data-testid="inventory-page">Inventory Page</div>,
}));

vi.mock('@/pages/EnvironmentalClean/page', () => ({
  __esModule: true,
  default: () => (
    <div data-testid="environmental-clean-page">Environmental Clean Page</div>
  ),
}));

vi.mock('@/pages/KnowledgeHub/index', () => ({
  __esModule: true,
  default: () => <div data-testid="knowledge-hub-page">Knowledge Hub Page</div>,
}));

vi.mock('@/pages/Settings/index', () => ({
  __esModule: true,
  default: () => <div data-testid="settings-page">Settings Page</div>,
}));

vi.mock('../../src/pages/library/page', () => ({
  __esModule: true,
  default: () => <div data-testid="library-page">Library Page</div>,
}));

// Mock ProtectedRoute to avoid useUser hook issues
vi.mock('../../src/components/ProtectedRoute', () => ({
  __esModule: true,
  ProtectedRoute: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="protected-route">{children}</div>
  ),
}));

// Mock performance API for testing
const mockPerformance = {
  now: vi.fn(() => Date.now()),
  mark: vi.fn(),
  measure: vi.fn(),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

describe('Performance Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    queryClient.clear();
  });

  it('should render App within acceptable time', async () => {
    const startTime = performance.now();

    render(
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <UIProvider>
            <UserProvider>
              <App />
            </UserProvider>
          </UIProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );

    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="protected-route"]')
      ).toBeInTheDocument();
    });

    const renderTime = performance.now() - startTime;

    // App should render within 1100ms (increased threshold for CI environments and slower machines)
    expect(renderTime).toBeLessThan(1100);
  });

  it('should handle navigation performance', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <UIProvider>
            <UserProvider>
              <App />
            </UserProvider>
          </UIProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );

    // Wait for initial render
    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="protected-route"]')
      ).toBeInTheDocument();
    });

    // Simulate navigation
    const navigationStart = performance.now();

    rerender(
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <UIProvider>
            <UserProvider>
              <App />
            </UserProvider>
          </UIProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );

    const navigationTime = performance.now() - navigationStart;

    // Navigation should complete within 300ms
    expect(navigationTime).toBeLessThan(300);
  });

  it('should maintain performance with multiple re-renders', async () => {
    const { rerender } = render(
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <UIProvider>
            <UserProvider>
              <App />
            </UserProvider>
          </UIProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );

    // Wait for initial render
    await waitFor(() => {
      expect(
        document.querySelector('[data-testid="protected-route"]')
      ).toBeInTheDocument();
    });

    const renderTimes: number[] = [];

    // Test multiple re-renders
    for (let i = 0; i < 5; i++) {
      const startTime = performance.now();

      rerender(
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <UIProvider>
              <UserProvider>
                <App />
              </UserProvider>
            </UIProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      );

      renderTimes.push(performance.now() - startTime);
    }

    // Average render time should be consistent
    const averageRenderTime =
      renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    expect(averageRenderTime).toBeLessThan(200);
  });
});
