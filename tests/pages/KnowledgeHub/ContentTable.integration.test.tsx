import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';

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

import { ContentTable } from '@/pages/KnowledgeHub/components/ContentTable';
import { SimplifiedKnowledgeHubProvider } from '@/pages/KnowledgeHub/providers/SimplifiedKnowledgeHubProvider';
import { UserProvider } from '@/contexts/UserContext';

// Mock the table components
vi.mock('@/pages/KnowledgeHub/components/tables/CoursesTable', () => ({
  CoursesTable: ({
    items,
  }: {
    items: Array<{ id: string; title: string }>;
  }) => (
    <div data-testid="courses-table">
      {items.map((item) => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  ),
}));

vi.mock('@/pages/KnowledgeHub/components/tables/LearningPathwaysTable', () => ({
  LearningPathwaysTable: ({
    items,
  }: {
    items: Array<{ id: string; title: string }>;
  }) => (
    <div data-testid="learning-pathways-table">
      {items.map((item) => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  ),
}));

vi.mock('@/pages/KnowledgeHub/components/tables/ProceduresTable', () => ({
  ProceduresTable: ({
    items,
  }: {
    items: Array<{ id: string; title: string }>;
  }) => (
    <div data-testid="procedures-table">
      {items.map((item) => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  ),
}));

vi.mock('@/pages/KnowledgeHub/components/tables/PoliciesTable', () => ({
  PoliciesTable: ({
    items,
  }: {
    items: Array<{ id: string; title: string }>;
  }) => (
    <div data-testid="policies-table">
      {items.map((item) => (
        <div key={item.id}>{item.title}</div>
      ))}
    </div>
  ),
}));

vi.mock('@/pages/KnowledgeHub/components/EmptyState', () => ({
  EmptyState: ({ selectedCategory }: { selectedCategory: string }) => (
    <div data-testid="empty-state">
      {selectedCategory ? 'No content available' : 'Select a category'}
    </div>
  ),
}));

// Mock the useSimplifiedKnowledgeHub hook
const mockUseSimplifiedKnowledgeHub = vi.fn();

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
    useSimplifiedKnowledgeHub: () => mockUseSimplifiedKnowledgeHub(),
  })
);

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <UserProvider>
    <SimplifiedKnowledgeHubProvider>{children}</SimplifiedKnowledgeHubProvider>
  </UserProvider>
);

const renderWithProvider = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

describe('ContentTable - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('integrates with data sources correctly', () => {
    const mockContent = [
      { id: '1', title: 'Course 1', category: 'Courses' },
      { id: '2', title: 'Course 2', category: 'Courses' },
    ];

    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: 'Courses',
      selectedContent: mockContent,
      isLoading: false,
      error: null,
      refetchContent: vi.fn(),
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('courses-table')).toBeInTheDocument();
    expect(screen.getByText('Course 1')).toBeInTheDocument();
    expect(screen.getByText('Course 2')).toBeInTheDocument();
  });

  it('handles async loading states', () => {
    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: 'Courses',
      selectedContent: [],
      isLoading: true,
      error: null,
      refetchContent: vi.fn(),
    });

    renderWithProvider(<ContentTable />);
    const loadingSkeleton = document.querySelector('.animate-pulse');
    expect(loadingSkeleton).toBeInTheDocument();
  });

  it('handles error states gracefully', () => {
    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: 'Courses',
      selectedContent: [],
      isLoading: false,
      error: new Error('Failed to load content'),
      refetchContent: vi.fn(),
    });

    renderWithProvider(<ContentTable />);
    expect(
      screen.getAllByText('Failed to load content')[0]
    ).toBeInTheDocument();
    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('handles null selectedContent', () => {
    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: 'Courses',
      selectedContent: null,
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('handles undefined selectedContent', () => {
    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: 'Courses',
      selectedContent: undefined,
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('handles empty selectedCategory', () => {
    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: '',
      selectedContent: [],
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('handles null selectedCategory', () => {
    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: null,
      selectedContent: [],
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('handles undefined selectedCategory', () => {
    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: undefined,
      selectedContent: [],
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('handles content with missing required fields', () => {
    const invalidContent = [
      { id: '1', title: 'Course 1' }, // Missing category
      { id: '2', category: 'Courses' }, // Missing title
      { id: '3' }, // Missing both title and category
    ];

    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: 'Courses',
      selectedContent: invalidContent,
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('courses-table')).toBeInTheDocument();
  });

  it('handles content with null values', () => {
    const contentWithNulls = [
      { id: '1', title: null, category: 'Courses' },
      { id: '2', title: 'Course 2', category: null },
    ];

    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: 'Courses',
      selectedContent: contentWithNulls,
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('courses-table')).toBeInTheDocument();
  });

  it('handles content with undefined values', () => {
    const contentWithUndefined = [
      { id: '1', title: undefined, category: 'Courses' },
      { id: '2', title: 'Course 2', category: undefined },
    ];

    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: 'Courses',
      selectedContent: contentWithUndefined,
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('courses-table')).toBeInTheDocument();
  });

  it('handles content with empty strings', () => {
    const contentWithEmptyStrings = [
      { id: '1', title: '', category: 'Courses' },
      { id: '2', title: 'Course 2', category: '' },
    ];

    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: 'Courses',
      selectedContent: contentWithEmptyStrings,
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('courses-table')).toBeInTheDocument();
  });

  it('handles very long category names', () => {
    const longCategoryName =
      'This is a very long category name that might break the layout and cause issues with the display';
    const mockContent = [
      { id: '1', title: 'Course 1', category: longCategoryName },
    ];

    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: longCategoryName,
      selectedContent: mockContent,
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('handles special characters in category names', () => {
    const specialCharCategory = 'Courses & Training';
    const mockContent = [
      { id: '1', title: 'Course 1', category: specialCharCategory },
    ];

    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: specialCharCategory,
      selectedContent: mockContent,
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('handles case-sensitive category matching', () => {
    const mockContent = [{ id: '1', title: 'Course 1', category: 'courses' }]; // lowercase

    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: 'Courses', // uppercase
      selectedContent: mockContent,
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('handles whitespace in category names', () => {
    const mockContent = [
      { id: '1', title: 'Course 1', category: '  Courses  ' },
    ]; // with whitespace

    mockUseSimplifiedKnowledgeHub.mockReturnValue({
      selectedCategory: 'Courses',
      selectedContent: mockContent,
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});
