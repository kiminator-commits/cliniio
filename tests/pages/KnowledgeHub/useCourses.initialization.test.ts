import { renderHook } from '@testing-library/react';
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

describe('useCourses - Initialization', () => {
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

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    expect(result.current.activeCourseTab).toBe('assigned');
    expect(result.current.currentPage).toBe(1);
    expect(result.current.searchQuery).toBe('');
    expect(result.current.selectedDomain).toBe('All');
    expect(result.current.selectedContentType).toBe('All');
    expect(result.current.selectedCourse).toBeNull();
    expect(result.current.showCourseDetail).toBe(false);
  });

  it('should extract unique domains', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    expect(result.current.uniqueDomains).toContain('Safety');
    expect(result.current.uniqueDomains).toContain('Hygiene');
    expect(result.current.uniqueDomains).toContain('General');
    expect(result.current.uniqueDomains).toHaveLength(3);
  });

  it('should extract unique content types', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    expect(result.current.uniqueContentTypes).toContain('Video');
    expect(result.current.uniqueContentTypes).toContain('Interactive');
    expect(result.current.uniqueContentTypes).toContain('Document');
    expect(result.current.uniqueContentTypes).toHaveLength(3);
  });

  it('should handle empty course arrays', () => {
    const { result } = renderHook(() =>
      useCourses({
        ...defaultProps,
        assigned: [],
        recommended: [],
        library: [],
        completed: [],
      })
    );

    expect(result.current.uniqueDomains).toEqual([]);
    expect(result.current.uniqueContentTypes).toEqual([]);
  });

  it('should get tag colors correctly', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    expect(result.current.getTagColor('Required')).toBe(
      'bg-red-100 text-red-800'
    );
    expect(result.current.getTagColor('Optional')).toBe(
      'bg-blue-100 text-blue-800'
    );
    expect(result.current.getTagColor('New')).toBe(
      'bg-green-100 text-green-800'
    );
    expect(result.current.getTagColor('Updated')).toBe(
      'bg-yellow-100 text-yellow-800'
    );
    expect(result.current.getTagColor('Unknown')).toBe(
      'bg-gray-100 text-gray-800'
    );
  });

  it('should check if course is due for repeat', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    const courseDueForRepeat: Course = {
      ...mockCourses[0],
      isRepeat: true,
      lastCompleted: '2023-12-01', // More than 30 days ago
    };

    const courseNotDueForRepeat: Course = {
      ...mockCourses[0],
      isRepeat: true,
      lastCompleted: new Date().toISOString().split('T')[0], // Today's date
    };

    const courseNotRepeat: Course = {
      ...mockCourses[0],
      isRepeat: false,
      lastCompleted: '2023-12-01',
    };

    const courseNoLastCompleted: Course = {
      ...mockCourses[0],
      isRepeat: true,
      lastCompleted: undefined,
    };

    expect(result.current.isCourseDueForRepeat(courseDueForRepeat)).toBe(true);
    expect(result.current.isCourseDueForRepeat(courseNotDueForRepeat)).toBe(
      false
    );
    expect(result.current.isCourseDueForRepeat(courseNotRepeat)).toBe(false);
    expect(result.current.isCourseDueForRepeat(courseNoLastCompleted)).toBe(
      false
    );
  });

  it('should initialize with correct default tab', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    expect(result.current.activeCourseTab).toBe('assigned');
  });

  it('should initialize with correct default pagination', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    expect(result.current.currentPage).toBe(1);
  });

  it('should initialize with empty search query', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    expect(result.current.searchQuery).toBe('');
  });

  it('should initialize with default filter values', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    expect(result.current.selectedDomain).toBe('All');
    expect(result.current.selectedContentType).toBe('All');
  });

  it('should initialize with no selected course', () => {
    const { result } = renderHook(() => useCourses(defaultProps));

    expect(result.current.selectedCourse).toBeNull();
    expect(result.current.showCourseDetail).toBe(false);
  });
});
