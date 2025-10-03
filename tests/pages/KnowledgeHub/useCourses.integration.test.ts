import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
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

describe('useCourses - Integration', () => {
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

  describe('Integration with External Data', () => {
    it('should handle courses without content type', () => {
      const coursesWithoutContentType: Course[] = [
        {
          id: '1',
          title: 'No Content Type Course',
          domain: 'General',
          progress: 0,
          status: 'Not Started',
        },
      ];

      const { result } = renderHook(() =>
        useCourses({
          ...defaultProps,
          assigned: coursesWithoutContentType,
          recommended: [],
          library: [],
          completed: [],
        })
      );

      act(() => {
        result.current.setSelectedContentType('Video');
      });

      expect(result.current.getFilteredCourses()).toHaveLength(0);
    });

    it('should handle courses without domain', () => {
      const coursesWithoutDomain: Course[] = [
        {
          id: '1',
          title: 'No Domain Course',
          domain: '',
          progress: 0,
          status: 'Not Started',
        },
      ];

      const { result } = renderHook(() =>
        useCourses({
          ...defaultProps,
          assigned: coursesWithoutDomain,
          recommended: [],
          library: [],
          completed: [],
        })
      );

      act(() => {
        result.current.setSelectedDomain('Safety');
      });

      expect(result.current.getFilteredCourses()).toHaveLength(0);
    });

    it('should handle search by domain', () => {
      const { result } = renderHook(() => useCourses(defaultProps));

      act(() => {
        result.current.setSearchQuery('Safety');
      });

      expect(result.current.getFilteredCourses()).toHaveLength(1);
      expect(result.current.getFilteredCourses()[0].domain).toBe('Safety');
    });

    it('should handle large datasets efficiently', () => {
      const largeCourseSet: Course[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i + 1}`,
        title: `Course ${i + 1}`,
        domain: ['Safety', 'Hygiene', 'General'][i % 3],
        contentType: ['Video', 'Interactive', 'Document'][i % 3],
        progress: i % 100,
        status: ['Not Started', 'In Progress', 'Completed'][i % 3],
        tags: ['Required', 'Optional', 'New'][i % 3]
          ? ['Required', 'Optional', 'New'][i % 3]
          : [],
      }));

      const { result } = renderHook(() =>
        useCourses({
          ...defaultProps,
          assigned: largeCourseSet,
          recommended: [],
          library: [],
          completed: [],
        })
      );

      const startTime = Date.now();
      act(() => {
        result.current.setSearchQuery('Course 1');
        result.current.setSelectedDomain('Safety');
        result.current.setSelectedContentType('Video');
      });
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100); // Should be fast
      expect(result.current.getFilteredCourses()).toBeDefined();
    });
  });

  describe('Persistence Integration', () => {
    it('should maintain state across re-renders', () => {
      const { result, rerender } = renderHook(() => useCourses(defaultProps));

      act(() => {
        result.current.setActiveCourseTab('recommended');
        result.current.setSearchQuery('Hygiene');
        result.current.setSelectedDomain('Hygiene');
      });

      const firstRender = {
        activeCourseTab: result.current.activeCourseTab,
        searchQuery: result.current.searchQuery,
        selectedDomain: result.current.selectedDomain,
      };

      rerender();

      expect(result.current.activeCourseTab).toBe(firstRender.activeCourseTab);
      expect(result.current.searchQuery).toBe(firstRender.searchQuery);
      expect(result.current.selectedDomain).toBe(firstRender.selectedDomain);
    });

    it('should persist filter state when switching tabs', () => {
      const { result } = renderHook(() => useCourses(defaultProps));

      act(() => {
        result.current.setSearchQuery('Safety');
        result.current.setSelectedDomain('Safety');
        result.current.setSelectedContentType('Video');
      });

      act(() => {
        result.current.setActiveCourseTab('recommended');
      });

      // Filters should persist
      expect(result.current.searchQuery).toBe('Safety');
      expect(result.current.selectedDomain).toBe('Safety');
      expect(result.current.selectedContentType).toBe('Video');
    });

    it('should handle pagination state persistence', () => {
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

      act(() => {
        result.current.setCurrentPage(3);
      });

      expect(result.current.currentPage).toBe(3);
      expect(result.current.getPaginatedCourses()).toHaveLength(5);
    });
  });

  describe('Error Handling', () => {
    it('should handle pagination edge cases', () => {
      const { result } = renderHook(() => useCourses(defaultProps));

      // Test with no courses
      act(() => {
        result.current.setActiveCourseTab('library');
        result.current.setSearchQuery('nonexistent');
      });

      expect(result.current.getPaginatedCourses()).toHaveLength(0);
      expect(result.current.totalPages).toBe(0);

      // Test with exactly 10 courses
      const exactlyTenCourses: Course[] = Array.from(
        { length: 10 },
        (_, i) => ({
          id: `${i + 1}`,
          title: `Course ${i + 1}`,
          domain: 'General',
          progress: 0,
          status: 'Not Started',
        })
      );

      const { result: result2 } = renderHook(() =>
        useCourses({
          ...defaultProps,
          assigned: exactlyTenCourses,
          recommended: [],
          library: [],
          completed: [],
        })
      );

      expect(result2.current.getPaginatedCourses()).toHaveLength(10);
      expect(result2.current.totalPages).toBe(1);
    });

    it('should handle invalid page numbers', () => {
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

      act(() => {
        result.current.setCurrentPage(0);
      });

      expect(result.current.currentPage).toBe(0);

      act(() => {
        result.current.setCurrentPage(999);
      });

      expect(result.current.currentPage).toBe(999);
    });

    it('should handle malformed course data', () => {
      const malformedCourses: any[] = [
        {
          id: '1',
          title: 'Valid Course',
          domain: 'Safety',
          contentType: 'Video',
          progress: 50,
          status: 'In Progress',
        },
        {
          id: '2',
          // Missing required fields
          title: 'Invalid Course',
        },
        null,
        undefined,
      ];

      expect(() => {
        renderHook(() =>
          useCourses({
            ...defaultProps,
            assigned: malformedCourses,
            recommended: [],
            library: [],
            completed: [],
          })
        );
      }).not.toThrow();
    });

    it('should handle empty props gracefully', () => {
      const emptyProps = {
        assigned: [],
        recommended: [],
        library: [],
        completed: [],
        handleStartCourse: mockHandleStartCourse,
        handleCompleteCourse: mockHandleCompleteCourse,
      };

      const { result } = renderHook(() => useCourses(emptyProps));

      expect(result.current.uniqueDomains).toEqual([]);
      expect(result.current.uniqueContentTypes).toEqual([]);
      expect(result.current.getFilteredCourses()).toEqual([]);
      expect(result.current.getPaginatedCourses()).toEqual([]);
    });

    it('should handle undefined handlers gracefully', () => {
      const propsWithUndefinedHandlers = {
        ...defaultProps,
        handleStartCourse: undefined as any,
        handleCompleteCourse: undefined as any,
      };

      const { result } = renderHook(() =>
        useCourses(propsWithUndefinedHandlers)
      );

      expect(() => {
        act(() => {
          result.current.handleCourseAction(mockCourses[0], 'start');
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.handleCourseAction(mockCourses[0], 'complete', 85);
        });
      }).not.toThrow();
    });
  });
});
