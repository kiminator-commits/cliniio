import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useCourseViewerData } from '@/features/learning/hooks/useCourseViewerData';
import { CourseService } from '@/features/learning/services/CourseService';
import { supabase } from '@/lib/supabaseClient';
import {
  CourseHeader as _CourseHeader,
  ProgressBar as _ProgressBar,
  ModuleTree as _ModuleTree,
  ActionBar as _ActionBar,
  ContentRenderer as _ContentRenderer,
} from '@/features/learning/shared';

interface Lesson {
  id: string;
  title: string;
  content: string | { body?: string };
  duration: number;
  isCompleted: boolean;
  estimated_duration?: number;
}

export default function CourseViewer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const {
    course,
    progress,
    isLoading,
    error,
    markLessonComplete,
    resumeLesson,
  } = useCourseViewerData(courseId || '', currentUser?.id || '');

  const XP_PER_LEVEL = 100;
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [xpEarned, setXpEarned] = useState<number | null>(null);
  const [totalXP, setTotalXP] = useState<number>(0);
  const [level, setLevel] = useState<number>(0);
  const [xpToNext, setXpToNext] = useState<number>(0);
  const [levelUp, setLevelUp] = useState<boolean>(false);
  const previousLevel = useRef<number>(0);

  useEffect(() => {
    const fetchTotalXP = async () => {
      try {
        const { data, error } = await supabase
          .from('home_challenge_completions')
          .select('points_earned')
          .eq('user_id', currentUser?.id);

        if (error) throw error;
        const total =
          data?.reduce((sum, row) => sum + (row.points_earned || 0), 0) || 0;
        setTotalXP(total);
      } catch (err) {
        console.error('Error fetching total XP:', err);
      }
    };

    if (currentUser?.id) fetchTotalXP();
  }, [currentUser?.id, xpEarned]); // re-fetch after earning new XP

  useEffect(() => {
    if (totalXP >= 0) {
      const currentLevel = Math.floor(totalXP / XP_PER_LEVEL);
      const remainder = totalXP % XP_PER_LEVEL;
      setLevel(currentLevel);
      setXpToNext(remainder);

      // 🎉 Detect level-up
      if (currentLevel > previousLevel.current) {
        setLevelUp(true);
        previousLevel.current = currentLevel;
        setTimeout(() => setLevelUp(false), 2000);
      }
    }
  }, [totalXP]);

  useEffect(() => {
    if (!course || !progress) return;
    console.log('✅ CourseViewer hydrated:', {
      courseTitle: course.title,
      moduleCount: course.lessons?.length ?? 0,
      progressPercent: progress.progressPercent ?? 0,
    });
  }, [course, progress]);

  if (isLoading) return <div className="p-6">Loading course...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;
  if (!course) return <div className="p-6">No course found.</div>;

  const activeLesson =
    course.lessons
      ?.find((l: Lesson) => l.id === activeLessonId) || null;

  const toggleModule = (moduleId: string) =>
    setOpenModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Enhanced Header */}
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 shadow-sm">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-teal rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {course.title}
              </h1>
              <p className="text-sm text-slate-600 font-medium">
                {progress.progressPercent}% complete
              </p>
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="w-full max-w-md">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Progress</span>
              <span>
                {progress.completedLessons}/{progress.totalLessons} lessons
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
              <div
                className="h-3 bg-teal rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${progress.progressPercent}%` }}
              ></div>
            </div>
          </div>
          {/* Gamification Badge */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full shadow-sm">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
              <span className="text-sm font-semibold">Level {level}</span>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <span className="text-sm font-medium">{totalXP} XP</span>
            </div>
            <div className="text-xs text-gray-500">
              {xpToNext} XP to next level
            </div>
          </div>

          {/* Enhanced Resume Banner */}
          {progress.completedLessons > 0 && !activeLessonId && (
            <div className="mt-4 p-4 bg-teal/10 border border-teal/20 rounded-xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal/20 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-teal"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-semibold text-slate-700">
                    Resume where you left off
                  </span>
                  <p className="text-sm text-teal font-medium">
                    {course.title}
                  </p>
                </div>
              </div>
              <button
                onClick={async () => {
                  const next = await resumeLesson();
                  if (next) setActiveLessonId(next);
                }}
                className="text-sm font-medium text-white bg-teal hover:bg-teal-hover px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Continue Learning
              </button>
            </div>
          )}
        </div>

        <button
          onClick={() => navigate('/knowledge-hub')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-800 px-4 py-2 rounded-lg hover:bg-white/50 transition-all duration-200 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="font-medium">Back to Knowledge Hub</span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Enhanced Sidebar */}
        <aside className="w-80 border-r border-slate-200 bg-slate-50 overflow-y-auto shadow-sm">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Course Content
              </h2>
              <p className="text-sm text-slate-600">
                Navigate through the learning modules
              </p>
            </div>

            <nav className="space-y-3">
              {course.lessons?.map((lesson: Lesson) => (
                <div
                  key={lesson.id}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <button
                    onClick={() => toggleModule(lesson.id)}
                    className="w-full text-left p-4 hover:bg-slate-50 transition-colors duration-200 flex justify-between items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-slate-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">
                          {lesson.title}
                        </span>
                        <p className="text-xs text-slate-500">
                          1 lesson
                        </p>
                      </div>
                    </div>
                    <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                      <span className="text-slate-600 text-sm font-medium">
                        {openModules[lesson.id] ? '−' : '+'}
                      </span>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 bg-slate-50/50">
                    <div className="p-2 space-y-1">
                      {(() => {
                        const isCompleted = lesson.isCompleted;
                        const isActive = lesson.id === activeLessonId;
                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLessonId(lesson.id)}
                            className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${
                              isActive
                                ? 'bg-teal/10 border border-teal/20 shadow-sm'
                                : isCompleted
                                  ? 'bg-green-50 hover:bg-green-100 border border-green-200'
                                  : 'hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200'
                            }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    isActive
                                      ? 'bg-teal/20'
                                      : isCompleted
                                        ? 'bg-green-100'
                                        : 'bg-slate-100'
                                  }`}
                                >
                                  {isCompleted ? (
                                    <svg
                                      className="w-3 h-3 text-green-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  ) : (
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        isActive ? 'bg-teal' : 'bg-slate-400'
                                      }`}
                                    ></div>
                                  )}
                                </div>
                                <div className="text-left">
                                  <span
                                    className={`text-sm font-medium ${
                                      isActive
                                        ? 'text-teal'
                                        : isCompleted
                                          ? 'text-green-800 line-through'
                                          : 'text-slate-700'
                                    }`}
                                  >
                                    {lesson.title}
                                  </span>
                                  {lesson.estimated_duration && (
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      {lesson.estimated_duration} min
                                    </p>
                                  )}
                                </div>
                              </div>
                              {isCompleted && (
                                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                              )}
                            </button>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Enhanced Main Content */}
        <main className="flex-1 overflow-y-auto bg-white">
          {activeLesson ? (
            <div className="max-w-4xl mx-auto p-8">
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-teal/20 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-teal"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900">
                      {activeLesson.title}
                    </h2>
                    {activeLesson.duration && (
                      <p className="text-sm text-slate-600 mt-1">
                        Estimated time: {activeLesson.duration}{' '}
                        minutes
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-8">
                  <article className="prose prose-slate max-w-none">
                    {activeLesson.content && typeof activeLesson.content === 'string' ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: activeLesson.content,
                        }}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg
                            className="w-8 h-8 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          No content available
                        </h3>
                        <p className="text-slate-600">
                          This lesson doesn't have any content yet.
                        </p>
                      </div>
                    )}
                  </article>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Select a lesson to begin learning
                </h3>
                <p className="text-slate-600">
                  Choose a lesson from the sidebar to start your learning
                  journey.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Enhanced Bottom Action Bar */}
      {activeLesson && (
        <footer className="sticky bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg">
          <div className="max-w-4xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-2 h-2 bg-teal rounded-full"></div>
                  <span>
                    Currently viewing:{' '}
                    <span className="font-medium text-slate-900">
                      {activeLesson.title}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={async () => {
                    const result = await CourseService.markLessonComplete(
                      currentUser?.id || '',
                      activeLesson.id
                    );
                    if (result.success && result.pointsEarned > 0) {
                      setXpEarned(result.pointsEarned);
                      // auto-hide after 2s
                      setTimeout(() => setXpEarned(null), 2000);
                    }
                    await markLessonComplete(activeLesson.id);
                    alert('Lesson marked complete!');
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-teal hover:bg-teal-hover text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Mark Complete
                </button>

                <button
                  onClick={async () => {
                    const next = await resumeLesson();
                    if (next) setActiveLessonId(next);
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-teal/10 hover:bg-teal/20 text-teal font-medium rounded-lg transition-all duration-200 border border-teal/20 hover:border-teal/30"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                  Next Lesson
                </button>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* XP Toast */}
      {xpEarned && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg animate-fade-in-out z-[9999]">
          +{xpEarned} XP
        </div>
      )}

      {/* Level Up Toast */}
      {levelUp && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-green-600 text-white px-5 py-2 rounded-full shadow-xl animate-fade-in-out z-[9999]">
          🎉 Level Up! You're now Level {level}
        </div>
      )}
    </div>
  );
}
