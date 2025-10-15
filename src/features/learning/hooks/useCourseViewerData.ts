import { useEffect, useState, useCallback } from 'react';
import { CourseService } from '../services/CourseService';

export function useCourseViewerData(courseId: string, userId: string) {
  const [course, setCourse] = useState<{
    id: string;
    title: string;
    description: string;
    lessons: Array<{
      id: string;
      title: string;
      content: string;
      duration: number;
      isCompleted: boolean;
    }>;
    totalDuration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category: string;
    instructor: string;
    createdAt: string;
    updatedAt: string;
  } | null>(null);
  const [progress, setProgress] = useState<{
    completedLessons: number;
    totalLessons: number;
    progressPercent: number;
  }>({
    completedLessons: 0,
    totalLessons: 0,
    progressPercent: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCourse = useCallback(async () => {
    if (!courseId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await CourseService.getCourse(courseId);
      setCourse(data);
      if (userId) {
        const userProgress = await CourseService.getUserProgress(
          userId,
          courseId
        );
        setProgress(userProgress);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, userId]);

  const markLessonComplete = useCallback(
    async (lessonId: string) => {
      try {
        const result = await CourseService.markLessonComplete(userId, lessonId);
        if (result.success && result.pointsEarned > 0) {
          console.log(
            `🎉 Earned ${result.pointsEarned} XP for completing lesson!`
          );
        }
        const updated = await CourseService.getUserProgress(userId, courseId);
        setProgress(updated);
      } catch (err: unknown) {
        console.error('❌ Error marking lesson complete:', err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [userId, courseId]
  );

  const resumeLesson = useCallback(async () => {
    try {
      const lessonId = await CourseService.resumeCourse(userId, courseId);
      return lessonId;
    } catch (err: unknown) {
      console.error('❌ Error resuming course:', err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, [userId, courseId]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  return {
    course,
    progress,
    isLoading,
    error,
    loadCourse,
    markLessonComplete,
    resumeLesson,
  };
}
