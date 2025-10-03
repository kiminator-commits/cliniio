import { useState, useMemo, useCallback } from 'react';
import { Course } from '../models';
import { CourseService } from '../services/courseService';
import { COURSE_REPEAT_INTERVAL_DAYS } from '../config/courseConfig';
import { getTagColor } from '../utils/courseUtils';

interface UseCoursesProps {
  assigned: Course[];
  recommended: Course[];
  library: Course[];
  completed: Course[];
  handleStartCourse: (course: Course) => void;
  handleCompleteCourse: (course: Course, score: number) => void;
}

export const useCourses = ({
  assigned,
  recommended,
  library,
  completed,
  handleStartCourse,
  handleCompleteCourse,
}: UseCoursesProps) => {
  // State management
  const [activeCourseTab, setActiveCourseTab] = useState('assigned');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedContentType, setSelectedContentType] = useState('All');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);

  // Memoized derived state using service layer
  const uniqueDomains = useMemo(() => {
    const allCourses = [...assigned, ...recommended, ...library, ...completed];
    return CourseService.getUniqueDomains(allCourses);
  }, [assigned, recommended, library, completed]);

  const uniqueContentTypes = useMemo(() => {
    const allCourses = [...assigned, ...recommended, ...library, ...completed];
    return CourseService.getUniqueContentTypes(allCourses);
  }, [assigned, recommended, library, completed]);

  // Business logic functions using service layer
  const isCourseDueForRepeat = useCallback((course: Course) => {
    return CourseService.isCourseDueForRepeat(
      course,
      COURSE_REPEAT_INTERVAL_DAYS
    );
  }, []);

  // Memoized filtered courses using service layer
  const filteredCourses = useMemo(() => {
    const courses = CourseService.getCoursesByTab(
      assigned,
      recommended,
      library,
      completed,
      activeCourseTab
    );

    return CourseService.filterCourses(courses, {
      searchQuery,
      selectedDomain,
      selectedContentType,
      activeTab: activeCourseTab,
    });
  }, [
    activeCourseTab,
    assigned,
    recommended,
    library,
    completed,
    searchQuery,
    selectedDomain,
    selectedContentType,
  ]);

  // Memoized paginated courses using service layer
  const paginatedCourses = useMemo(() => {
    return CourseService.paginateCourses(filteredCourses, currentPage, 10);
  }, [filteredCourses, currentPage]);

  // Memoized total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredCourses.length / 10);
  }, [filteredCourses.length]);

  // Memoized event handlers
  const handleCourseClick = useCallback((course: Course) => {
    setSelectedCourse(course);
    setShowCourseDetail(true);
  }, []);

  const handleCourseAction = useCallback(
    (course: Course, action: 'start' | 'complete', score?: number) => {
      if (action === 'start' && handleStartCourse) {
        handleStartCourse(course);
      } else if (action === 'complete' && handleCompleteCourse) {
        handleCompleteCourse(course, score || 0);
      }
      setShowCourseDetail(false);
    },
    [handleStartCourse, handleCompleteCourse]
  );

  const handleCloseCourseDetail = useCallback(() => {
    setShowCourseDetail(false);
    setSelectedCourse(null);
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  const handleDomainChange = useCallback((domain: string) => {
    setSelectedDomain(domain);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handleContentTypeChange = useCallback((contentType: string) => {
    setSelectedContentType(contentType);
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setActiveCourseTab(tab);
    setCurrentPage(1); // Reset to first page when changing tabs
  }, []);

  return {
    // State
    activeCourseTab,
    currentPage,
    searchQuery,
    selectedDomain,
    selectedContentType,
    selectedCourse,
    showCourseDetail,

    // Memoized data
    uniqueDomains,
    uniqueContentTypes,
    filteredCourses,
    paginatedCourses,
    totalPages,

    // Business logic functions
    isCourseDueForRepeat,
    getTagColor,
    handleCourseClick,
    handleCourseAction,
    handleCloseCourseDetail,
    handleSearchChange,
    handleDomainChange,
    handleContentTypeChange,
    handleTabChange,

    // Direct setters for tests
    setActiveCourseTab,
    setSearchQuery,
    setSelectedDomain,
    setSelectedContentType,
    setCurrentPage,

    // Getters for tests
    getFilteredCourses: () => filteredCourses,
    getPaginatedCourses: () => paginatedCourses,
  };
};
