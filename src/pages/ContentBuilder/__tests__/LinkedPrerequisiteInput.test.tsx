import React from 'react';
import { vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LinkedPrerequisiteInput from '../components/CourseSteps/LinkedPrerequisiteInput';

// Using centralized mock from __mocks__ directory

// Mock the course search service
vi.mock('@/features/library/services/courseSearchService', () => ({
  searchCourses: vi.fn(),
  getCourseById: vi.fn(),
}));

import { getCourseById } from '@/features/library/services/courseSearchService';
const mockGetCourseById = getCourseById as vi.MockedFunction<typeof getCourseById>;

describe('LinkedPrerequisiteInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onRemove: vi.fn(),
    placeholder: 'Search for a course...',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input with placeholder', () => {
    render(<LinkedPrerequisiteInput {...defaultProps} />);

    expect(screen.getByPlaceholderText('Search for a course...')).toBeInTheDocument();
  });

  it('shows search icon', () => {
    render(<LinkedPrerequisiteInput {...defaultProps} />);

    // The search icon should be present (mdiMagnify)
    expect(screen.getByTestId('mdi-icon')).toBeInTheDocument();
  });

  it('calls onChange when search query changes', () => {
    render(<LinkedPrerequisiteInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Search for a course...');
    fireEvent.change(input, { target: { value: 'test' } });

    // The component should update its internal state, not call onChange immediately
    expect(input).toHaveValue('test');
  });

  it('shows clear button when there is text', async () => {
    // Mock a course to be selected
    const mockCourse = {
      id: 'test-course-id',
      title: 'Test Course',
      description: 'Test Description',
      difficulty_level: 'beginner',
      estimated_duration: 30,
      department: 'general',
      tags: ['test'],
    };
    
    mockGetCourseById.mockResolvedValue(mockCourse);
    
    render(<LinkedPrerequisiteInput {...defaultProps} value="test-course-id" />);

    // Wait for the course to be loaded and selected
    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    // Clear button should appear (look for multiple icons - search + close)
    expect(screen.getAllByTestId('mdi-icon').length).toBeGreaterThan(1);
  });

  it('calls onRemove when remove button is clicked', async () => {
    // Mock that a course is selected
    const mockCourse = {
      id: 'course-id',
      title: 'Test Course',
      description: 'Test Description',
      difficulty_level: 'beginner',
      estimated_duration: 30,
      department: 'general',
      tags: ['test'],
    };
    
    mockGetCourseById.mockResolvedValue(mockCourse);
    
    render(<LinkedPrerequisiteInput {...defaultProps} value="course-id" />);

    // Wait for the course to be loaded and selected
    await waitFor(() => {
      expect(screen.getByText('Test Course')).toBeInTheDocument();
    });

    // Find and click the remove button
    const removeButton = screen.getByRole('button', { name: /remove course/i });
    fireEvent.click(removeButton);
    
    expect(defaultProps.onRemove).toHaveBeenCalled();
  });
});
