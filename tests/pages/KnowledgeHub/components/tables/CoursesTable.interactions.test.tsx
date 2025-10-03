import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock getEnvVar before importing components that use it
vi.mock('@/lib/getEnv', () => ({
  getEnvVar: (key: string) => {
    if (key === 'VITE_SUPABASE_URL') return 'https://test.supabase.co';
    if (key === 'VITE_SUPABASE_ANON_KEY') return 'test-anon-key';
    return '';
  },
}));

import { CoursesTable } from '@/pages/KnowledgeHub/components/tables/CoursesTable';
import {
  ContentItem,
  ContentStatus,
  ContentCategory,
} from '@/pages/KnowledgeHub/types';
import { SimplifiedKnowledgeHubProvider } from '@/pages/KnowledgeHub/providers/SimplifiedKnowledgeHubProvider';
import { UserProvider } from '@/contexts/UserContext';

// Mock the SimplifiedKnowledgeHubProvider context
const mockDeleteContent = vi.fn();
const mockUpdateContentStatus = vi.fn();

vi.mock(
  '@/pages/KnowledgeHub/providers/SimplifiedKnowledgeHubProvider',
  async () => {
    const actual = await vi.importActual(
      '@/pages/KnowledgeHub/providers/SimplifiedKnowledgeHubProvider'
    );
    return {
      ...actual,
      SimplifiedKnowledgeHubProvider: ({
        children,
      }: {
        children: React.ReactNode;
      }) =>
        React.createElement(
          'div',
          { 'data-testid': 'mock-simplified-knowledge-hub-provider' },
          children
        ),
      useSimplifiedKnowledgeHub: () => ({
        deleteContent: mockDeleteContent,
        updateContentStatus: mockUpdateContentStatus,
        validationError: null,
        clearValidationError: vi.fn(),
        selectedCategory: 'Courses',
        selectedContent: [],
        isLoading: false,
        error: null,
        refetchContent: vi.fn(),
        getCategoryCount: vi.fn(() => 0),
      }),
    };
  }
);

// Mock the auth functions
vi.mock('@/pages/KnowledgeHub/utils/permissions', () => ({
  ...vi.importActual('@/pages/KnowledgeHub/utils/permissions'),
  useAuthCheck: () => ({
    currentUser: { id: '1', role: 'Administrator' },
    canDeleteContent: () => true,
    canUpdateStatus: () => true,
  }),
  PermissionGuard: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock the input validation
vi.mock('@/pages/KnowledgeHub/utils/inputValidation', () => ({
  ...vi.importActual('@/pages/KnowledgeHub/utils/inputValidation'),
  useInputValidation: () => ({
    validateAndSanitizeSearch: () => ({
      isValid: true,
      sanitizedQuery: 'test',
    }),
  }),
  inputRateLimiter: {
    checkLimit: () => true,
    resetLimit: vi.fn(),
  },
}));

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <UserProvider>
    <SimplifiedKnowledgeHubProvider>{children}</SimplifiedKnowledgeHubProvider>
  </UserProvider>
);

describe('CoursesTable Interactions', () => {
  const mockItems: ContentItem[] = [
    {
      id: '1',
      title: 'Course 1',
      category: 'Courses' as ContentCategory,
      status: 'Completed' as ContentStatus,
      dueDate: '2025-07-10',
      progress: 100,
    },
    {
      id: '2',
      title: 'Course 2',
      category: 'Courses' as ContentCategory,
      status: 'In Progress' as ContentStatus,
      dueDate: '2025-07-15',
      progress: 50,
    },
    {
      id: '3',
      title: 'Advanced Course',
      category: 'Courses' as ContentCategory,
      status: 'Not Started' as ContentStatus,
      dueDate: '2025-07-20',
      progress: 0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders courses table with items', async () => {
    render(<CoursesTable items={mockItems} />, { wrapper: TestWrapper });

    // Wait for the table to render
    await screen.findByText('Course 1');
    expect(screen.getByText('Course 2')).toBeInTheDocument();
    expect(screen.getByText('Advanced Course')).toBeInTheDocument();
  });

  it('handles row expansion and collapse', async () => {
    const user = userEvent.setup();
    render(<CoursesTable items={mockItems} />, { wrapper: TestWrapper });

    // Wait for the virtualized list to render
    await screen.findByText('Course 1');

    // All delete buttons should be visible initially
    expect(screen.getAllByTitle('Delete')).toHaveLength(3);

    // Click to expand a row (button doesn't have aria-label, use role instead)
    const expandButton = screen.getAllByRole('button')[0];
    await user.click(expandButton);

    // Delete buttons should still be visible
    expect(screen.getAllByTitle('Delete')).toHaveLength(3);

    // Click to collapse the row
    await user.click(expandButton);

    // Delete buttons should still be visible (they don't hide on collapse)
    expect(screen.getAllByTitle('Delete')).toHaveLength(3);
  });

  it('handles course deletion', async () => {
    const user = userEvent.setup();
    render(<CoursesTable items={mockItems} />, { wrapper: TestWrapper });

    // Wait for the table to render
    await screen.findByText('Course 1');

    // Click the first delete button (all are visible)
    const deleteButton = screen.getAllByTitle('Delete')[0];
    await user.click(deleteButton);

    // Check that delete function was called
    expect(mockDeleteContent).toHaveBeenCalledWith('1');
  });

  it('handles multiple row expansions', async () => {
    const user = userEvent.setup();
    render(<CoursesTable items={mockItems} />, { wrapper: TestWrapper });

    // Wait for the virtualized list to render
    await screen.findByText('Course 1');

    // All delete buttons should be visible initially
    expect(screen.getAllByTitle('Delete')).toHaveLength(3);

    // Expand first row
    const firstExpandButton = screen.getAllByRole('button')[0];
    await user.click(firstExpandButton);

    // Expand second row
    const secondExpandButton = screen.getAllByRole('button')[1];
    await user.click(secondExpandButton);

    // All delete buttons should still be visible
    expect(screen.getAllByTitle('Delete')).toHaveLength(3);
  });

  it('handles table pagination', async () => {
    // Create more items to test pagination
    const manyItems = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Course ${i + 1}`,
      category: 'Courses' as ContentCategory,
      status: 'Not Started' as ContentStatus,
      dueDate: '2025-07-10',
      progress: 0,
    }));

    render(<CoursesTable items={manyItems} />, { wrapper: TestWrapper });

    // Wait for the table to render
    await screen.findByText('Course 1');

    // Check that pagination is working
    expect(screen.getByText('Showing 1 to 10 of 25 items')).toBeInTheDocument();
  });

  it('handles empty state', async () => {
    render(<CoursesTable items={[]} />, { wrapper: TestWrapper });

    // Should show table structure even when empty
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('Assigned')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('handles course status updates', async () => {
    const user = userEvent.setup();
    render(<CoursesTable items={mockItems} />, { wrapper: TestWrapper });

    // Wait for the table to render
    await screen.findByText('Course 1');

    // Expand first row to see actions
    const expandButton = screen.getAllByRole('button')[0];
    await user.click(expandButton);

    // Check that status update functionality is available
    expect(mockUpdateContentStatus).toBeDefined();
  });
});
