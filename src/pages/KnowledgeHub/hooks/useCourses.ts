import { useState, useMemo } from 'react';
import { Course } from '../models';

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

  // Derived state
  const uniqueDomains = useMemo(() => {
    const domains = new Set<string>();
    [...assigned, ...recommended, ...library, ...completed].forEach(course => {
      if (course.domain) domains.add(course.domain);
    });
    return Array.from(domains);
  }, [assigned, recommended, library, completed]);

  const uniqueContentTypes = useMemo(() => {
    const types = new Set<string>();
    [...assigned, ...recommended, ...library, ...completed].forEach(course => {
      if (course.contentType) types.add(course.contentType);
    });
    return Array.from(types);
  }, [assigned, recommended, library, completed]);

  // Helper functions
  const getTagColor = (tag: string) => {
    const colors: { [key: string]: string } = {
      Required: 'bg-red-100 text-red-800',
      Optional: 'bg-blue-100 text-blue-800',
      New: 'bg-green-100 text-green-800',
      Updated: 'bg-yellow-100 text-yellow-800',
    };
    return colors[tag] || 'bg-gray-100 text-gray-800';
  };

  const isCourseDueForRepeat = (course: Course) => {
    if (!course.isRepeat || !course.lastCompleted) return false;
    const lastCompleted = new Date(course.lastCompleted);
    const now = new Date();
    const daysSinceCompletion = Math.floor(
      (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceCompletion >= 30; // Example: repeat every 30 days
  };

  const getFilteredCourses = () => {
    let courses: Course[] = [];
    switch (activeCourseTab) {
      case 'assigned':
        courses = assigned;
        break;
      case 'recommended':
        courses = recommended;
        break;
      case 'library':
        courses = library;
        break;
      case 'completed':
        courses = completed;
        break;
      default:
        courses = assigned;
    }

    return courses.filter(course => {
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.domain.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDomain = selectedDomain === 'All' || course.domain === selectedDomain;
      const matchesContentType =
        selectedContentType === 'All' || course.contentType === selectedContentType;
      return matchesSearch && matchesDomain && matchesContentType;
    });
  };

  const getPaginatedCourses = () => {
    const filtered = getFilteredCourses();
    const startIndex = (currentPage - 1) * 10;
    return filtered.slice(startIndex, startIndex + 10);
  };

  const totalPages = Math.ceil(getFilteredCourses().length / 10);

  // Event handlers
  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseDetail(true);
  };

  const handleCourseAction = (course: Course, action: 'start' | 'complete', score?: number) => {
    if (action === 'start') {
      handleStartCourse(course);
    } else if (action === 'complete' && score !== undefined) {
      handleCompleteCourse(course, score);
    }
    setShowCourseDetail(false);
  };

  const handleCloseCourseDetail = () => {
    setShowCourseDetail(false);
    setSelectedCourse(null);
  };

  return {
    activeCourseTab,
    setActiveCourseTab,
    currentPage,
    setCurrentPage,
    searchQuery,
    setSearchQuery,
    selectedDomain,
    setSelectedDomain,
    selectedContentType,
    setSelectedContentType,
    uniqueDomains,
    uniqueContentTypes,
    selectedCourse,
    showCourseDetail,
    getTagColor,
    isCourseDueForRepeat,
    getPaginatedCourses,
    totalPages,
    handleCourseClick,
    handleCourseAction,
    handleCloseCourseDetail,
  };
};
