import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Course } from '../types';
import { UserLearningProgressService } from '../services/userData/UserLearningProgressService';
import { KnowledgeHubService } from '../services/knowledgeHubService';
import CourseCard from './CourseCard';
import { Quiz } from '../services/types/knowledgeHubTypes';
import { QuizService } from '../services/quizService';
import QuizComponent from './QuizComponent';

// calculateRepeatStatus function removed as it's not used

// extractMediaInfo function removed as it's not used

const CoursesTab = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showContentViewer, setShowContentViewer] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [courseQuizzes, setCourseQuizzes] = useState<Quiz[]>([]);

  const progressService = useMemo(() => new UserLearningProgressService(), []);

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch courses from KnowledgeHubService
      const contentItems = await KnowledgeHubService.getKnowledgeArticles();

      // Filter for courses only and transform to Course format
      const courseItems = contentItems.filter(
        (item) => item.category === 'Courses'
      );

      const transformedCourses: Course[] = courseItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.data?.description,
        domain: item.domain || 'General',
        contentType: item.contentType,
        tags: item.data?.tags,
        progress: item.progress || 0,
        status: item.status,
        dueDate: item.dueDate,
        assignedBy: '', // ContentItem doesn't have assignedBy
        lastCompleted: '', // ContentItem doesn't have lastCompleted
        isRepeat: false, // ContentItem doesn't have isRepeat
        score: 0, // ContentItem doesn't have score
        media: {
          url: '', // ContentItem doesn't have content.url
          type: 'course',
        },
      }));

      setCourses(transformedCourses);
    } catch (err) {
      console.error('Error loading courses:', err);
      setError('Failed to load courses. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Global error handler
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught in CoursesTab:', event.error);
      setError('An unexpected error occurred. Please try refreshing the page.');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection in CoursesTab:', event.reason);
      setError('An unexpected error occurred. Please try refreshing the page.');
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener(
        'unhandledrejection',
        handleUnhandledRejection
      );
    };
  }, []);

  const handleCourseClick = async (course: Course) => {
    try {
      // Track that user viewed this course (non-blocking)
      progressService
        .trackLearningActivity({
          contentId: course.id,
          action: 'viewed',
          category: 'Courses',
        })
        .catch((err) => {
          console.warn('Failed to track course view (non-critical):', err);
        });

      // Load quizzes for this course (non-blocking)
      loadCourseQuizzes(course.id).catch((err) => {
        console.warn('Failed to load course quizzes (non-critical):', err);
      });

      // Always show the course regardless of tracking/quiz loading failures
      setSelectedCourse(course);
      setShowContentViewer(true);
    } catch (err) {
      console.error('Critical error in handleCourseClick:', err);
      // Fallback: still show the course even if everything fails
      setSelectedCourse(course);
      setShowContentViewer(true);
    }
  };

  const loadCourseQuizzes = async (courseId: string) => {
    try {
      // Get quizzes for the course category
      const quizzes = await QuizService.getQuizzesByCategory(courseId);
      setCourseQuizzes(quizzes || []);
    } catch (err) {
      console.warn('Error loading course quizzes (non-critical):', err);
      setCourseQuizzes([]);
    }
  };

  const handleCourseStart = async (course: Course) => {
    try {
      // Track course start (non-blocking)
      progressService
        .trackLearningActivity({
          contentId: course.id,
          action: 'started',
          category: 'Courses',
        })
        .catch((err) => {
          console.warn('Failed to track course start (non-critical):', err);
        });

      // Reload courses to update progress
      await loadCourses();
    } catch (err) {
      console.warn('Error starting course (non-critical):', err);
    }
  };

  const handleCourseComplete = async (course: Course) => {
    try {
      // Track course completion (non-blocking)
      progressService
        .trackLearningActivity({
          contentId: course.id,
          action: 'completed',
          category: 'Courses',
        })
        .catch((err) => {
          console.warn(
            'Failed to track course completion (non-critical):',
            err
          );
        });

      // Reload courses to update progress
      await loadCourses();
    } catch (err) {
      console.warn('Error completing course (non-critical):', err);
    }
  };

  const handleQuizComplete = async (score: number, passed: boolean) => {
    if (selectedCourse) {
      try {
        // Update course progress based on quiz result (commented out as not used)
        // const newProgress = passed ? 100 : Math.max(selectedCourse.progress, 50);

        await progressService.trackLearningActivity({
          contentId: selectedCourse.id,
          action: passed ? 'completed' : 'viewed',
          category: 'Courses',
        });

        // Reload courses to update progress
        await loadCourses();
      } catch (err) {
        console.error('Error updating course progress after quiz:', err);
      }
    }
  };

  const closeContentViewer = () => {
    setShowContentViewer(false);
    setShowQuiz(false);
    setSelectedCourse(null);
    setCourseQuizzes([]);
  };

  const openQuiz = () => {
    setShowQuiz(true);
  };

  const closeQuiz = () => {
    setShowQuiz(false);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Courses</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading courses...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-4">Courses</h2>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Error loading courses</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button
            onClick={loadCourses}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Courses</h2>
        <div className="text-sm text-gray-600">
          {courses.length} course{courses.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-600 mb-2">No courses available</div>
          <div className="text-sm text-gray-500">
            Check back later for new courses
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isCourseDueForRepeat={course.isRepeat || false}
              onClick={() => handleCourseClick(course)}
            />
          ))}
        </div>
      )}

      {/* Course Content Viewer Modal */}
      {showContentViewer && selectedCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">
                {selectedCourse?.title || 'Untitled Course'}
              </h3>
              <button
                onClick={closeContentViewer}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4">
              <p className="text-gray-600">
                {selectedCourse?.description || 'No description available'}
              </p>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-gray-600">
                  {selectedCourse?.progress || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${selectedCourse?.progress || 0}%` }}
                ></div>
              </div>
            </div>

            {/* Quiz Section */}
            {courseQuizzes.length > 0 && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Available Quizzes</h4>
                <div className="space-y-2">
                  {courseQuizzes.map((quiz: Quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm">{quiz.title}</span>
                      <button
                        onClick={openQuiz}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                      >
                        Take Quiz
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {selectedCourse?.status === 'draft' && (
                <button
                  onClick={() => handleCourseStart(selectedCourse)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Start Course
                </button>
              )}

              {selectedCourse?.status === 'review' && (
                <button
                  onClick={() => handleCourseComplete(selectedCourse)}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark Complete
                </button>
              )}

              <button
                onClick={closeContentViewer}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuiz && selectedCourse && courseQuizzes.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">
                Quiz: {courseQuizzes[0]?.title || 'Untitled Quiz'}
              </h3>
              <button
                onClick={closeQuiz}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <QuizComponent
              quizId={courseQuizzes[0]?.id || ''}
              onComplete={handleQuizComplete}
              onClose={closeQuiz}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesTab;
