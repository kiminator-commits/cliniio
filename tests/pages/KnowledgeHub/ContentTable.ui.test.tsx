import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

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

// Using centralized mock from __mocks__ directory

import { ContentTable } from '@/pages/KnowledgeHub/components/ContentTable';
import {
  SimplifiedKnowledgeHubProvider,
  useSimplifiedKnowledgeHub,
} from '@/pages/KnowledgeHub/providers/SimplifiedKnowledgeHubProvider';
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

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MemoryRouter>
    <UserProvider>
      <SimplifiedKnowledgeHubProvider>{children}</SimplifiedKnowledgeHubProvider>
    </UserProvider>
  </MemoryRouter>
);

const renderWithProvider = (component: React.ReactElement) => {
  return render(component, { wrapper: TestWrapper });
};

describe('ContentTable - UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    vi.mocked(useSimplifiedKnowledgeHub).mockReturnValue({
      selectedCategory: '',
      selectedContent: [],
      deleteContent: vi.fn(),
      updateContentStatus: vi.fn(),
      validationError: null,
      clearValidationError: vi.fn(),
      isLoading: false,
      error: null,
      refetchContent: vi.fn(),
      getCategoryCount: vi.fn(() => 0),
      setSelectedCategory: vi.fn(),
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('shows empty state when no category is selected', () => {
    vi.mocked(useSimplifiedKnowledgeHub).mockReturnValue({
      selectedCategory: '',
      selectedContent: [],
      deleteContent: vi.fn(),
      updateContentStatus: vi.fn(),
      validationError: null,
      clearValidationError: vi.fn(),
      isLoading: false,
      error: null,
      refetchContent: vi.fn(),
      getCategoryCount: vi.fn(() => 0),
      setSelectedCategory: vi.fn(),
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('shows empty state when category has no content', () => {
    vi.mocked(useSimplifiedKnowledgeHub).mockReturnValue({
      selectedCategory: 'Courses',
      selectedContent: [],
      deleteContent: vi.fn(),
      updateContentStatus: vi.fn(),
      validationError: null,
      clearValidationError: vi.fn(),
      isLoading: false,
      error: null,
      refetchContent: vi.fn(),
      getCategoryCount: vi.fn(() => 0),
      setSelectedCategory: vi.fn(),
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });

  it('renders CoursesTable when Courses category is selected with content', () => {
    const mockContent = [{ id: '1', title: 'Course 1', category: 'Courses' }];

    vi.mocked(useSimplifiedKnowledgeHub).mockReturnValue({
      selectedCategory: 'Courses',
      selectedContent: mockContent,
      isLoading: false,
      error: null,
      refetchContent: vi.fn(),
      deleteContent: vi.fn(),
      updateContentStatus: vi.fn(),
      validationError: null,
      clearValidationError: vi.fn(),
      getCategoryCount: vi.fn(() => 0),
      setSelectedCategory: vi.fn(),
    });

    renderWithProvider(<ContentTable />);
    // The component should show the selected category
    expect(
      screen.getByRole('heading', { name: /courses/i })
    ).toBeInTheDocument();
    // Since isLoading is false, we should see the actual content, not a loading skeleton
    expect(screen.getByText('Course 1')).toBeInTheDocument();
  });

  it('renders LearningPathwaysTable when Learning Pathways category is selected', () => {
    const mockContent = [
      { id: '1', title: 'Pathway 1', category: 'Learning Pathways' },
    ];

    vi.mocked(useSimplifiedKnowledgeHub).mockReturnValue({
      selectedCategory: 'Learning Pathways',
      selectedContent: mockContent,
      isLoading: false,
      error: null,
      refetchContent: vi.fn(),
      deleteContent: vi.fn(),
      updateContentStatus: vi.fn(),
      validationError: null,
      clearValidationError: vi.fn(),
      getCategoryCount: vi.fn(() => 0),
      setSelectedCategory: vi.fn(),
    });

    renderWithProvider(<ContentTable />);
    // The component should show the selected category
    expect(
      screen.getByRole('heading', { name: /learning pathways/i })
    ).toBeInTheDocument();
    // Since isLoading is false, we should see the actual content, not a loading skeleton
    expect(screen.getByText('Pathway 1')).toBeInTheDocument();
  });

  it('renders ProceduresTable when Procedures category is selected', () => {
    const mockContent = [
      { id: '1', title: 'Procedure 1', category: 'Procedures' },
    ];

    vi.mocked(useSimplifiedKnowledgeHub).mockReturnValue({
      selectedCategory: 'Procedures',
      selectedContent: mockContent,
      isLoading: false,
      error: null,
      refetchContent: vi.fn(),
      deleteContent: vi.fn(),
      updateContentStatus: vi.fn(),
      validationError: null,
      clearValidationError: vi.fn(),
      getCategoryCount: vi.fn(() => 0),
      setSelectedCategory: vi.fn(),
    });

    renderWithProvider(<ContentTable />);
    // The component should show the selected category
    expect(
      screen.getByRole('heading', { name: /procedures/i })
    ).toBeInTheDocument();
    // Since isLoading is false, we should see the actual content, not a loading skeleton
    expect(screen.getByText('Procedure 1')).toBeInTheDocument();
  });

  it('renders PoliciesTable when Policies category is selected', () => {
    const mockContent = [{ id: '1', title: 'Policy 1', category: 'Policies' }];

    vi.mocked(useSimplifiedKnowledgeHub).mockReturnValue({
      selectedCategory: 'Policies',
      selectedContent: mockContent,
      isLoading: false,
      error: null,
      refetchContent: vi.fn(),
      deleteContent: vi.fn(),
      updateContentStatus: vi.fn(),
      validationError: null,
      clearValidationError: vi.fn(),
      getCategoryCount: vi.fn(() => 0),
      setSelectedCategory: vi.fn(),
    });

    renderWithProvider(<ContentTable />);
    // The component should show the selected category
    expect(
      screen.getByRole('heading', { name: /policies/i })
    ).toBeInTheDocument();
    // Since isLoading is false, we should see the actual content, not a loading skeleton
    expect(screen.getByText('Policy 1')).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading is true', () => {
    vi.mocked(useSimplifiedKnowledgeHub).mockReturnValue({
      selectedCategory: 'Courses',
      selectedContent: [],
      isLoading: true,
      error: null,
      refetchContent: vi.fn(),
      deleteContent: vi.fn(),
      updateContentStatus: vi.fn(),
      validationError: null,
      clearValidationError: vi.fn(),
      getCategoryCount: vi.fn(() => 0),
      setSelectedCategory: vi.fn(),
    });

    renderWithProvider(<ContentTable />);
    // When loading, we should see the loading skeleton with animate-pulse class
    const loadingSkeleton = document.querySelector('.animate-pulse');
    expect(loadingSkeleton).toBeInTheDocument();
  });

  it('shows empty state for unknown category', () => {
    vi.mocked(useSimplifiedKnowledgeHub).mockReturnValue({
      selectedCategory: 'Unknown',
      selectedContent: [],
      deleteContent: vi.fn(),
      updateContentStatus: vi.fn(),
      validationError: null,
      clearValidationError: vi.fn(),
      isLoading: false,
      error: null,
      refetchContent: vi.fn(),
      getCategoryCount: vi.fn(() => 0),
      setSelectedCategory: vi.fn(),
    });

    renderWithProvider(<ContentTable />);
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});
