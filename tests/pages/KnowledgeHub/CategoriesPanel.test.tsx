import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

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

import { CategoriesPanel } from '@/pages/KnowledgeHub/components/CategoriesPanel';
import { SimplifiedKnowledgeHubProvider } from '@/pages/KnowledgeHub/providers/SimplifiedKnowledgeHubProvider';
import { UserProvider } from '@/contexts/UserContext';

// Mock the simplified hook
vi.mock(
  '@/pages/KnowledgeHub/providers/SimplifiedKnowledgeHubProvider',
  () => ({
    __esModule: true,
    default: ({ children }: { children: any }) =>
      React.createElement(
        'div',
        { 'data-testid': 'mock-simplified-knowledge-hub-provider' },
        children
      ),
    SimplifiedKnowledgeHubProvider: ({ children }: { children: any }) =>
      React.createElement(
        'div',
        { 'data-testid': 'mock-simplified-knowledge-hub-provider' },
        children
      ),
    useSimplifiedKnowledgeHub: vi.fn(() => ({
      content: [],
      selectedContent: null,
      selectedCategory: '',
      isLoading: false,
      error: null,
      validationError: null,
      setSelectedCategory: vi.fn(),
      getCategoryCount: vi.fn(() => 0),
      refetchContent: vi.fn(),
      deleteContent: vi.fn(),
      updateContentStatus: vi.fn(),
      updateContent: vi.fn(),
      clearValidationError: vi.fn(),
    })),
  })
);

import { useSimplifiedKnowledgeHub } from '@/pages/KnowledgeHub/providers/SimplifiedKnowledgeHubProvider';

const mockUseSimplifiedKnowledgeHub = vi.mocked(useSimplifiedKnowledgeHub);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <UserProvider>
    <SimplifiedKnowledgeHubProvider>{children}</SimplifiedKnowledgeHubProvider>
  </UserProvider>
);

const renderWithProvider = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

describe('CategoriesPanel', () => {
  it('renders without crashing', () => {
    renderWithProvider(<CategoriesPanel />);
    expect(screen.getByText('Categories')).toBeInTheDocument();
  });

  it('displays all category buttons', () => {
    renderWithProvider(<CategoriesPanel />);

    expect(screen.getByText('Courses')).toBeInTheDocument();
    expect(screen.getByText('Learning Pathways')).toBeInTheDocument();
    expect(screen.getByText('Procedures')).toBeInTheDocument();
    expect(screen.getByText('Policies')).toBeInTheDocument();
  });

  it('shows category counts', () => {
    renderWithProvider(<CategoriesPanel />);

    // Since we're mocking getCategoryCount to return 0, all counts should be 0
    const countElements = screen.getAllByText('0');
    expect(countElements).toHaveLength(4);
  });

  it('handles category button clicks', () => {
    const mockSetSelectedCategory = vi.fn();
    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      content: [],
      selectedContent: null,
      selectedCategory: '',
      isLoading: false,
      error: null,
      validationError: null,
      setSelectedCategory: mockSetSelectedCategory,
      getCategoryCount: vi.fn(() => 0),
      refetchContent: vi.fn(),
      deleteContent: vi.fn(),
      updateContentStatus: vi.fn(),
      updateContent: vi.fn(),
      clearValidationError: vi.fn(),
    });

    renderWithProvider(<CategoriesPanel />);

    const coursesButton = screen.getByText('Courses');
    fireEvent.click(coursesButton);

    expect(mockSetSelectedCategory).toHaveBeenCalledWith('Courses');
  });

  test('renders CategoriesPanel and allows category selection', () => {
    render(<CategoriesPanel />, { wrapper: TestWrapper });
    const button = screen.getByText('Courses');
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    // Check that the button exists and is clickable
    expect(button).toBeInTheDocument();
  });
});
