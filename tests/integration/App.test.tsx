import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../../src/App';

// Mock TasksList since it's used in the Home page
vi.mock('@/components/TasksList', () => ({
  __esModule: true,
  default: () => <div data-testid="tasks-list">MockTasksList</div>,
}));

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

// Mock the context providers
vi.mock('../../src/contexts/UIContext', () => ({
  UIProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="ui-provider">{children}</div>
  ),
}));

vi.mock('../../src/contexts/UserContext', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="user-provider">{children}</div>
  ),
  useUser: () => ({
    currentUser: null,
    setCurrentUser: vi.fn(),
    clearUserData: vi.fn(),
  }),
}));

// Mock ErrorBoundary
vi.mock('../../src/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}));

// Mock QueryClient
vi.mock('@tanstack/react-query', () => ({
  QueryClient: vi.fn().mockImplementation(() => ({
    mount: vi.fn(),
    unmount: vi.fn(),
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-client-provider">{children}</div>
  ),
}));

describe('App', () => {
  it('renders without crashing', async () => {
    render(<App />);

    // Wait for the app to render - look for the error boundary wrapper
    await waitFor(() => {
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument();
    });
  });
});
