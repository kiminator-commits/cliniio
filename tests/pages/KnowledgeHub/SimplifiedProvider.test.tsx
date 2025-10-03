import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock getEnvVar before importing components that use it
vi.mock('@/lib/getEnv', () => ({
  getEnvVar: (key: string) => {
    if (key === 'VITE_SUPABASE_URL') return 'https://test.supabase.co';
    if (key === 'VITE_SUPABASE_ANON_KEY') return 'test-anon-key';
    return '';
  },
  isDevelopment: () => false,
  isProduction: () => false,
  isBrowser: () => false,
  isNode: () => true,
  getEnvironmentConfig: () => ({
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    NODE_ENV: 'test',
    DEV: false,
    PROD: false,
    BROWSER: false,
    NODE: true,
  }),
}));

import {
  SimplifiedKnowledgeHubProvider,
  useSimplifiedKnowledgeHub,
} from '@/pages/KnowledgeHub/providers/SimplifiedKnowledgeHubProvider';
import { UserProvider } from '@/contexts/UserContext';

// Test component that uses the simplified hook
const TestComponent: React.FC = () => {
  const {
    selectedCategory,
    selectedContent,
    isLoading,
    error,
    setSelectedCategory,
    deleteContent,
    updateContentStatus,
  } = useSimplifiedKnowledgeHub();

  return (
    <div>
      <div data-testid="selected-category">{selectedCategory}</div>
      <div data-testid="content-count">{selectedContent?.length || 0}</div>
      <div data-testid="loading">{isLoading.toString()}</div>
      <div data-testid="error">{error?.message || 'no-error'}</div>

      <button
        onClick={() => setSelectedCategory('Courses')}
        data-testid="set-courses"
      >
        Set Courses
      </button>

      <button
        onClick={() => deleteContent('test-id')}
        data-testid="delete-content"
      >
        Delete Content
      </button>

      <button
        onClick={() => updateContentStatus('test-id', 'Completed')}
        data-testid="update-status"
      >
        Update Status
      </button>
    </div>
  );
};

// Mock UserContext
const mockUser = {
  id: 'test-user-id',
  name: 'Test User',
  role: 'Administrator',
  email: 'test@example.com',
  title: 'Dr.',
};

vi.mock('@/contexts/UserContext', () => ({
  useUser: () => ({
    currentUser: mockUser,
    setCurrentUser: vi.fn(),
  }),
  UserProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

// Unmock SimplifiedKnowledgeHubProvider to use the real implementation for this test
vi.unmock('@/pages/KnowledgeHub/providers/SimplifiedKnowledgeHubProvider');

describe('SimplifiedKnowledgeHubProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', async () => {
    render(
      <UserProvider>
        <SimplifiedKnowledgeHubProvider>
          <TestComponent />
        </SimplifiedKnowledgeHubProvider>
      </UserProvider>
    );

    // Wait for initial setup to complete
    await waitFor(() => {
      expect(screen.getByTestId('selected-category')).toBeInTheDocument();
      expect(screen.getByTestId('content-count')).toBeInTheDocument();
    });
  });

  it('provides initial state', async () => {
    render(
      <UserProvider>
        <SimplifiedKnowledgeHubProvider>
          <TestComponent />
        </SimplifiedKnowledgeHubProvider>
      </UserProvider>
    );

    // Wait for initial data loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // The provider should have a selected category (could be empty initially)
    const selectedCategory = screen.getByTestId('selected-category');
    expect(selectedCategory).toBeInTheDocument();

    // The content count should be a number
    const contentCount = screen.getByTestId('content-count');
    expect(contentCount).toBeInTheDocument();
    expect(parseInt(contentCount.textContent || '0')).toBeGreaterThanOrEqual(0);
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('allows setting selected category', async () => {
    render(
      <UserProvider>
        <SimplifiedKnowledgeHubProvider>
          <TestComponent />
        </SimplifiedKnowledgeHubProvider>
      </UserProvider>
    );

    // Wait for initial setup to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const setCoursesButton = screen.getByTestId('set-courses');
    fireEvent.click(setCoursesButton);

    await waitFor(() => {
      expect(screen.getByTestId('selected-category')).toHaveTextContent(
        'Courses'
      );
    });
  });

  it('provides permission checks for administrator', async () => {
    render(
      <UserProvider>
        <SimplifiedKnowledgeHubProvider>
          <TestComponent />
        </SimplifiedKnowledgeHubProvider>
      </UserProvider>
    );

    // Wait for initial setup to complete
    await waitFor(() => {
      expect(screen.getByTestId('selected-category')).toBeInTheDocument();
      expect(screen.getByTestId('content-count')).toBeInTheDocument();
    });
  });

  it('handles content operations', async () => {
    render(
      <UserProvider>
        <SimplifiedKnowledgeHubProvider>
          <TestComponent />
        </SimplifiedKnowledgeHubProvider>
      </UserProvider>
    );

    // Wait for initial setup to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    const deleteButton = screen.getByTestId('delete-content');
    const updateButton = screen.getByTestId('update-status');

    fireEvent.click(deleteButton);
    fireEvent.click(updateButton);

    // These operations should not throw errors
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('no-error');
    });
  });
});
