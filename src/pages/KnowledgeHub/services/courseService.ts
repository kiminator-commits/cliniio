import { Course } from '../models';

export interface CourseFilterOptions {
  searchQuery: string;
  selectedDomain: string;
  selectedContentType: string;
  activeTab: string;
}

export interface CourseSortOptions {
  field: keyof Course;
  direction: 'asc' | 'desc';
}

export class CourseService {
  static getUniqueDomains(courses: Course[]): string[] {
    const domains = new Set<string>();
    courses.forEach((course) => {
      if (course && course.domain) domains.add(course.domain);
    });
    return Array.from(domains);
  }

  static getUniqueContentTypes(courses: Course[]): string[] {
    const types = new Set<string>();
    courses.forEach((course) => {
      if (course && course.contentType) types.add(course.contentType);
    });
    return Array.from(types);
  }

  static filterCourses(
    courses: Course[],
    options: CourseFilterOptions
  ): Course[] {
    const { searchQuery, selectedDomain, selectedContentType } = options;

    const normalizedSearchQuery = searchQuery.toLowerCase().trim();
    const hasSearchQuery = normalizedSearchQuery.length > 0;
    const hasDomainFilter = selectedDomain !== 'All';
    const hasContentTypeFilter = selectedContentType !== 'All';

    return courses.filter((course) => {
      // Search filter
      if (hasSearchQuery) {
        const matchesSearch =
          course.title.toLowerCase().includes(normalizedSearchQuery) ||
          course.domain.toLowerCase().includes(normalizedSearchQuery);
        if (!matchesSearch) return false;
      }

      // Domain filter
      if (hasDomainFilter && course.domain !== selectedDomain) {
        return false;
      }

      // Content type filter
      if (hasContentTypeFilter && course.contentType !== selectedContentType) {
        return false;
      }

      return true;
    });
  }

  static sortCourses(courses: Course[], options: CourseSortOptions): Course[] {
    const { field, direction } = options;

    return [...courses].sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return direction === 'asc' ? -1 : 1;
      if (bValue == null) return direction === 'asc' ? 1 : -1;

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  }

  static paginateCourses(
    courses: Course[],
    page: number,
    pageSize: number
  ): Course[] {
    const startIndex = (page - 1) * pageSize;
    return courses.slice(startIndex, startIndex + pageSize);
  }

  static isCourseDueForRepeat(
    course: Course,
    repeatIntervalDays: number = 30
  ): boolean {
    if (!course.isRepeat || !course.lastCompleted) return false;

    const lastCompleted = new Date(course.lastCompleted);
    const now = new Date();
    const daysSinceCompletion = Math.floor(
      (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceCompletion >= repeatIntervalDays;
  }

  static getCoursesByTab(
    assigned: Course[],
    recommended: Course[],
    library: Course[],
    completed: Course[],
    activeTab: string
  ): Course[] {
    switch (activeTab) {
      case 'assigned':
        return assigned;
      case 'recommended':
        return recommended;
      case 'library':
        return library;
      case 'completed':
        return completed;
      default:
        return assigned;
    }
  }
}
