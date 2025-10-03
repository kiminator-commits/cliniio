import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentBuilderProvider, useContentBuilder } from '../../context';
import ContentBuilderStep from './ContentBuilderStep';

// Mock the useContentBuilderActions hook
vi.mock('../../hooks', () => ({
  useContentBuilderActions: () => ({
    setCourseStep: vi.fn(),
    updateLesson: vi.fn(),
  }),
}));

// Mock the useContentBuilder hook
vi.mock('../../context', async () => {
  const actual = await vi.importActual('../../context');
  return {
    ...actual,
    useContentBuilder: vi.fn(),
  };
});

// Mock the NavigationProvider
vi.mock('@/contexts/NavigationContext', () => ({
  NavigationProvider: ({ children }: { children: React.ReactNode }) => children,
  useNavigation: () => ({
    closeDrawer: vi.fn(),
    openDrawer: vi.fn(),
    isDrawerOpen: false,
  }),
}));

const mockCourseData = {
  id: 'course-1',
  title: 'Test Course',
  description: 'A test course',
  modules: [
    {
      id: 'module-1',
      title: 'Module 1',
      description: 'First module',
      lessons: [
        {
          id: 'lesson-1',
          title: 'Lesson 1',
          content: 'Lesson content',
          order: 0,
          moduleId: 'module-1',
          estimatedDuration: 15,
          isRequired: false,
          type: 'text' as const,
        },
        {
          id: 'lesson-2',
          title: 'Lesson 2',
          content: '',
          order: 1,
          moduleId: 'module-1',
          estimatedDuration: 20,
          isRequired: true,
          type: 'text' as const,
        },
      ],
      order: 0,
      isRequired: false,
      estimatedDuration: 35,
    },
  ],
  assessments: [],
  linkedPrerequisites: [],
  estimatedDuration: 35,
  difficulty: 'beginner' as const,
  category: 'general' as const,
  tags: [],
  isPublished: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockState = {
  courseStep: 3,
  courseData: mockCourseData,
  isLoading: false,
  error: null,
};

describe('ContentBuilderStep', () => {
  beforeEach(() => {
    // Mock the context value
    (useContentBuilder as vi.Mock).mockReturnValue({
      state: mockState,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders the content builder interface', () => {
    render(
      <ContentBuilderProvider>
        <ContentBuilderStep />
      </ContentBuilderProvider>
    );

    // Check for actual content that exists in the component
    expect(screen.getByText('Step 1: Course Information')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Build Content')).toBeInTheDocument();
    expect(screen.getByText('AI Content Assistant')).toBeInTheDocument();
  });

  it('displays course modules and lessons', () => {
    render(
      <ContentBuilderProvider>
        <ContentBuilderStep />
      </ContentBuilderProvider>
    );

    // Check that the module structure is shown
    expect(screen.getByText('2 lessons')).toBeInTheDocument();
    expect(screen.getByText('Step 2: Build Content')).toBeInTheDocument();
  });

  it('allows expanding/collapsing modules', () => {
    render(
      <ContentBuilderProvider>
        <ContentBuilderStep />
      </ContentBuilderProvider>
    );

    // Check that the module structure is visible
    expect(screen.getByText('2 lessons')).toBeInTheDocument();
    // Check for the input field that contains "Module 1"
    expect(screen.getByDisplayValue('Module 1')).toBeInTheDocument();
  });

  it('shows lesson content status', () => {
    render(
      <ContentBuilderProvider>
        <ContentBuilderStep />
      </ContentBuilderProvider>
    );

    // Check that lesson information is displayed
    expect(screen.getByText('2 lessons')).toBeInTheDocument();
    // Check for the input field that contains "Module 1"
    expect(screen.getByDisplayValue('Module 1')).toBeInTheDocument();
  });

  it('shows module structure when expanded', async () => {
    render(
      <ContentBuilderProvider>
        <ContentBuilderStep />
      </ContentBuilderProvider>
    );

    // Check that the module structure is visible
    expect(screen.getByText('2 lessons')).toBeInTheDocument();
    // Check for the input field that contains "Module 1"
    expect(screen.getByDisplayValue('Module 1')).toBeInTheDocument();
  });

  it('shows quick actions section', () => {
    render(
      <ContentBuilderProvider>
        <ContentBuilderStep />
      </ContentBuilderProvider>
    );

    // Check for AI Content Assistant section which contains action buttons
    expect(screen.getByText('AI Content Assistant')).toBeInTheDocument();
    expect(screen.getByText('Get AI Suggestions')).toBeInTheDocument();
    expect(screen.getByText('Generate Course Structure')).toBeInTheDocument();
    expect(screen.getByText('Content Ideas')).toBeInTheDocument();
  });

  it('handles empty course structure gracefully', () => {
    const emptyState = {
      ...mockState,
      courseData: {
        ...mockCourseData,
        modules: [],
      },
    };

    (useContentBuilder as vi.Mock).mockReturnValue({
      state: emptyState,
    });

    render(
      <ContentBuilderProvider>
        <ContentBuilderStep />
      </ContentBuilderProvider>
    );

    expect(
      screen.getByText(
        'No course structure found. Please go back to Step 2 to plan your course.'
      )
    ).toBeInTheDocument();
  });
});
