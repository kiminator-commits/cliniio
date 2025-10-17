import { renderHook, act } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, it } from 'vitest';
import { useCourses } from '@/pages/KnowledgeHub/hooks/useCourses';
import { Course } from '@/pages/KnowledgeHub/models';

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Safety Course',
    domain: 'Safety',
    contentType: 'Video',
    tags: ['Required', 'New'],
    progress: 75,
    status: 'In Progress',
    dueDate: '2024-02-01',
    assignedBy: 'Manager',
    lastCompleted: '2024-01-15',
    isRepeat: true,
    score: 85,
  },
  {
    id: '2',
    title: 'Hygiene Course',
    domain: 'Hygiene',
    contentType: 'Interactive',
    tags: ['Required'],
    progress: 100,
    status: 'Completed',
    assignedBy: 'Supervisor',
    lastCompleted: '2024-01-20',
    score: 92,
  },
  {
    id: '3',
    title: 'General Course',
    domain: 'General',
    contentType: 'Document',
    tags: ['Optional'],
    progress: 0,
    status: 'Not Started',
    assignedBy: 'Admin',
  },
];

const mockHandleStartCourse = vi.fn();
const mockHandleCompleteCourse = vi.fn();

describe('useCourses - Actions', () => {
  const defaultProps = {
    assigned: [mockCourses[0]],
    recommended: [mockCourses[1]],
    library: [mockCourses[2]],
    completed: [mockCourses[1]],
    handleStartCourse: mockHandleStartCourse,
    handleCompleteCourse: mockHandleCompleteCourse,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should filter courses by tab', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    // Test assigned tab
    act(() => {
      result.current.setActiveCourseTab('assigned');
    });
    expect(result.current.getFilteredCourses()).toHaveLength(1);
    expect(result.current.getFilteredCourses()[0].title).toBe('Safety Course');

    // Test recommended tab
    act(() => {
      result.current.setActiveCourseTab('recommended');
    });
    expect(result.current.getFilteredCourses()).toHaveLength(1);
    expect(result.current.getFilteredCourses()[0].title).toBe('Hygiene Course');

    // Test library tab
    act(() => {
      result.current.setActiveCourseTab('library');
    });
    expect(result.current.getFilteredCourses()).toHaveLength(1);
    expect(result.current.getFilteredCourses()[0].title).toBe('General Course');

    // Test completed tab
    act(() => {
      result.current.setActiveCourseTab('completed');
    });
    expect(result.current.getFilteredCourses()).toHaveLength(1);
    expect(result.current.getFilteredCourses()[0].title).toBe('Hygiene Course');

    // Test unknown tab (should default to assigned)
    act(() => {
      result.current.setActiveCourseTab('unknown');
    });
    expect(result.current.getFilteredCourses()).toHaveLength(1);
    expect(result.current.getFilteredCourses()[0].title).toBe('Safety Course');
  });

  it('should filter courses by search query', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    act(() => {
      result.current.setSearchQuery('Safety');
    });

    expect(result.current.getFilteredCourses()).toHaveLength(1);
    expect(result.current.getFilteredCourses()[0].title).toBe('Safety Course');

    act(() => {
      result.current.setActiveCourseTab('recommended');
      result.current.setSearchQuery('Hygiene');
    });

    expect(result.current.getFilteredCourses()).toHaveLength(1);
    expect(result.current.getFilteredCourses()[0].title).toBe('Hygiene Course');

    act(() => {
      result.current.setSearchQuery('nonexistent');
    });

    expect(result.current.getFilteredCourses()).toHaveLength(0);
  });

  it('should filter courses by domain', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    act(() => {
      result.current.setSelectedDomain('Safety');
    });

    expect(result.current.getFilteredCourses()).toHaveLength(1);
    expect(result.current.getFilteredCourses()[0].domain).toBe('Safety');

    act(() => {
      result.current.setSelectedDomain('All');
    });

    expect(result.current.getFilteredCourses()).toHaveLength(1);
  });

  it('should filter courses by content type', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    act(() => {
      result.current.setSelectedContentType('Video');
    });

    expect(result.current.getFilteredCourses()).toHaveLength(1);
    expect(result.current.getFilteredCourses()[0].contentType).toBe('Video');

    act(() => {
      result.current.setSelectedContentType('All');
    });

    expect(result.current.getFilteredCourses()).toHaveLength(1);
  });

  it('should paginate courses correctly', () => {
    const manyCourses: Course[] = Array.from({ length: 25 }, (_, i) => ({
      id: `${i + 1}`,
      title: `Course ${i + 1}`,
      domain: 'General',
      progress: 0,
      status: 'Not Started',
    }));

    const { result } = renderHook(() =>
      useCourses({
        ...defaultProps,
        assigned: manyCourses,
        recommended: [],
        library: [],
        completed: [],
      })
    );

    // First page should have 10 items
    expect(result.current.getPaginatedCourses()).toHaveLength(10);
    expect(result.current.totalPages).toBe(3);

    // Second page
    act(() => {
      result.current.setCurrentPage(2);
    });
    expect(result.current.getPaginatedCourses()).toHaveLength(10);

    // Third page should have 5 items
    act(() => {
      result.current.setCurrentPage(3);
    });
    expect(result.current.getPaginatedCourses()).toHaveLength(5);
  });

  it('should handle course click', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    act(() => {
      result.current.handleCourseClick(mockCourses[0]);
    });

    expect(result.current.selectedCourse).toBe(mockCourses[0]);
    expect(result.current.showCourseDetail).toBe(true);
  });

  it('should handle close course detail', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    // First set a selected course
    act(() => {
      result.current.handleCourseClick(mockCourses[0]);
    });

    expect(result.current.selectedCourse).toBe(mockCourses[0]);
    expect(result.current.showCourseDetail).toBe(true);

    // Then close it
    act(() => {
      result.current.handleCloseCourseDetail();
    });

    expect(result.current.selectedCourse).toBeNull();
    expect(result.current.showCourseDetail).toBe(false);
  });

  it('should handle course action - start', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    act(() => {
      result.current.handleCourseAction(mockCourses[0], 'start');
    });

    expect(mockHandleStartCourse).toHaveBeenCalledWith(mockCourses[0]);
    expect(result.current.showCourseDetail).toBe(false);
  });

  it('should handle course action - complete', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    act(() => {
      result.current.handleCourseAction(mockCourses[0], 'complete', 85);
    });

    expect(mockHandleCompleteCourse).toHaveBeenCalledWith(mockCourses[0], 85);
    expect(result.current.showCourseDetail).toBe(false);
  });

  it('should handle course action with undefined score', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    act(() => {
      result.current.handleCourseAction(mockCourses[0], 'complete');
    });

    expect(mockHandleCompleteCourse).toHaveBeenCalledWith(mockCourses[0], 0);
    expect(result.current.showCourseDetail).toBe(false);
  });

  it('should handle case-insensitive search', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    act(() => {
      result.current.setSearchQuery('safety');
    });

    expect(result.current.getFilteredCourses()).toHaveLength(1);
    expect(result.current.getFilteredCourses()[0].title).toBe('Safety Course');
  });

  it('should handle empty search query', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    act(() => {
      result.current.setSearchQuery('');
    });

    expect(result.current.getFilteredCourses()).toHaveLength(1);
  });

  it('should handle combined filters', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    act(() => {
      result.current.setSearchQuery('Safety');
      result.current.setSelectedDomain('Safety');
      result.current.setSelectedContentType('Video');
    });

    expect(result.current.getFilteredCourses()).toHaveLength(1);
    expect(result.current.getFilteredCourses()[0].title).toBe('Safety Course');
  });

  it('should handle no matches with combined filters', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    act(() => {
      result.current.setSearchQuery('Safety');
      result.current.setSelectedDomain('Hygiene');
    });

    expect(result.current.getFilteredCourses()).toHaveLength(0);
  });
});
