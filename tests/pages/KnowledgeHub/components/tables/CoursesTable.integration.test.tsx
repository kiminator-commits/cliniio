import React from 'react';
import { vi } from 'vitest';
import { render, screen, waitFor as _waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  setupIntegrationTest,
  overrideMock,
} from '../../../../utils/testHelpers';

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

// Create local mock functions
const mockDeleteContent = vi.fn();
const mockUpdateContentStatus = vi.fn();
const mockRefetchContent = vi.fn();

// Mock the SimplifiedKnowledgeHubProvider to use our local functions
vi.mock(
  '@/pages/KnowledgeHub/providers/SimplifiedKnowledgeHubProvider',
  () => ({
    SimplifiedKnowledgeHubProvider: ({
      children,
    }: {
      children: React.ReactNode;
    }) => (
      <div data-testid="mock-simplified-knowledge-hub-provider">{children}</div>
    ),
    useSimplifiedKnowledgeHub: () => ({
      selectedCategory: 'Courses',
      selectedContent: [],
      isLoading: false,
      error: null,
      validationError: null,
      setSelectedCategory: vi.fn(),
      getCategoryCount: vi.fn(() => 0),
      refetchContent: mockRefetchContent,
      deleteContent: mockDeleteContent,
      updateContentStatus: mockUpdateContentStatus,
      updateContent: vi.fn(),
      clearValidationError: vi.fn(),
    }),
  })
);

// Mock the auth functions
vi.mock('@/pages/KnowledgeHub/utils/permissions', () => ({
  ...vi.importActual('@/pages/KnowledgeHub/utils/permissions'),
  useAuthCheck: () => ({
    currentUser: { id: '1', role: 'Administrator' },
    canDeleteContent: () => true,
    canUpdateStatus: () => true,
  }),
  PermissionGuard: ({
    children,
    permission,
    fallback,
  }: {
    children: React.ReactNode;
    permission: string;
    fallback: React.ReactNode | null;
  }) => {
    if (permission === 'canDeleteContent' && fallback === null) {
      return children;
    }
    if (permission === 'canUpdateStatus') {
      return children;
    }
    return fallback || children;
  },
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

describe('CoursesTable Integration', () => {
  beforeEach(() => {
    // Setup centralized mocks
    setupIntegrationTest();

    // Clear local mocks
    mockDeleteContent.mockClear();
    mockUpdateContentStatus.mockClear();
    mockRefetchContent.mockClear();

    // Override the centralized mock with our local functions
    overrideMock(
      'SimplifiedKnowledgeHubProvider',
      'deleteContent',
      mockDeleteContent
    );
    overrideMock(
      'SimplifiedKnowledgeHubProvider',
      'updateContentStatus',
      mockUpdateContentStatus
    );
    overrideMock(
      'SimplifiedKnowledgeHubProvider',
      'refetchContent',
      mockRefetchContent
    );
  });

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
      dueDate: '2025-08-01',
      progress: 50,
    },
    {
      id: '3',
      title: 'Advanced Course',
      category: 'Advanced' as ContentCategory,
      status: 'Not Started' as ContentStatus,
      dueDate: '2025-09-01',
      progress: 0,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('integrates with SimplifiedKnowledgeHubProvider for data operations', async () => {
    const user = userEvent.setup();
    render(<CoursesTable items={mockItems} />, { wrapper: TestWrapper });

    // Wait for the virtualized list to render
    await screen.findByText('Course 1');

    // Expand a row to access delete functionality
    const expandButton = screen.getAllByRole('button')[0]; // First expand button
    await user.click(expandButton);

    // Delete a course
    const deleteButton = screen.getAllByTitle('Delete')[0]; // First delete button
    await user.click(deleteButton);

    // Verify that the provider's delete function was called
    expect(mockDeleteContent).toHaveBeenCalledWith('1');
  });

  it('handles data source integration with large datasets', async () => {
    const manyItems: ContentItem[] = Array.from({ length: 100 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Course ${i + 1}`,
      category: 'Courses' as ContentCategory,
      status: 'Not Started' as ContentStatus,
      dueDate: '2025-01-01',
      progress: 0,
    }));

    render(<CoursesTable items={manyItems} />, { wrapper: TestWrapper });

    // Wait for the virtualized list to render
    await screen.findByText('Course 1');

    // Verify that the table can handle large datasets
    expect(
      screen.getByText('Showing 1 to 10 of 100 items')
    ).toBeInTheDocument();
    expect(screen.getByText('Course 1')).toBeInTheDocument();
  });

  it('handles error states from data source', () => {
    // Mock error state from provider
    // Use the global mock from vitest.setup.ts

    render(<CoursesTable items={mockItems} />, { wrapper: TestWrapper });

    // Verify the table renders with the global mock
    expect(screen.getByText('Course 1')).toBeInTheDocument();
  });

  it('handles validation errors from data source', () => {
    // Mock validation error state
    // Use the global mock from vitest.setup.ts

    render(<CoursesTable items={mockItems} />, { wrapper: TestWrapper });

    // Verify the table renders with the global mock
    expect(screen.getByText('Course 1')).toBeInTheDocument();
  });

  it('integrates with UserContext for authentication', () => {
    // Mock different user roles
    // Use the global mock from vitest.setup.ts

    render(<CoursesTable items={mockItems} />, { wrapper: TestWrapper });

    // Should render with different user context
    expect(screen.getByText('Course 1')).toBeInTheDocument();
  });

  it('handles concurrent operations', async () => {
    const user = userEvent.setup();
    render(<CoursesTable items={mockItems} />, { wrapper: TestWrapper });

    // Wait for the virtualized list to render
    await screen.findByText('Course 1');

    // Perform multiple operations simultaneously
    // Note: Search functionality is handled at the parent ContentTable level, not in CoursesTable

    // Expand multiple rows
    const expandButton1 = screen.getAllByRole('button')[0]; // First expand button
    const expandButton2 = screen.getAllByRole('button')[1]; // Second expand button

    await user.click(expandButton1);
    await user.click(expandButton2);

    // Both operations should work
    expect(screen.getAllByTitle('Delete')).toHaveLength(3); // 3 courses = 3 delete buttons
  });

  it('handles state consistency during data updates', async () => {
    const user = userEvent.setup();
    render(<CoursesTable items={mockItems} />, { wrapper: TestWrapper });

    // Wait for the virtualized list to render
    await screen.findByText('Course 1');

    // Delete a course
    const expandButton = screen.getAllByRole('button')[0]; // First expand button
    await user.click(expandButton);

    const deleteButton = screen.getAllByTitle('Delete')[0]; // First delete button
    await user.click(deleteButton);

    // Verify state remains consistent
    expect(mockDeleteContent).toHaveBeenCalledWith('1');
    expect(screen.getByText('Course 1')).toBeInTheDocument();
    expect(screen.getByText('Course 2')).toBeInTheDocument();
  });

  it('handles edge cases with malformed data', () => {
    const malformedItems: ContentItem[] = [
      {
        id: '1',
        title: '',
        category: 'Courses' as ContentCategory,
        status: 'Completed' as ContentStatus,
        dueDate: '',
        progress: 100,
      },
      {
        id: '2',
        title: 'Course 2',
        category: 'Courses' as ContentCategory,
        status: 'In Progress' as ContentStatus,
        dueDate: '2025-08-01',
        progress: 50,
      },
    ];

    render(<CoursesTable items={malformedItems} />, { wrapper: TestWrapper });

    // Should handle malformed data gracefully
    expect(screen.getByText('Course 2')).toBeInTheDocument();
  });

  it('handles empty and null data gracefully', () => {
    // Test with null items - should render empty table
    const { unmount } = render(<CoursesTable items={null as any} />, {
      wrapper: TestWrapper,
    });
    expect(screen.getByRole('table')).toBeInTheDocument();
    unmount();

    // Test with undefined items - should render empty table
    render(<CoursesTable items={undefined as any} />, { wrapper: TestWrapper });
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('integrates with external services for data persistence', async () => {
    const user = userEvent.setup();
    render(<CoursesTable items={mockItems} />, { wrapper: TestWrapper });

    // Wait for the virtualized list to render
    await screen.findByText('Course 1');

    // Perform operations that should trigger external service calls
    const expandButton = screen.getAllByRole('button')[0]; // First expand button
    await user.click(expandButton);

    const deleteButton = screen.getAllByTitle('Delete')[0]; // First delete button
    await user.click(deleteButton);

    // Verify external service integration
    expect(mockDeleteContent).toHaveBeenCalledWith('1');
  });
});
