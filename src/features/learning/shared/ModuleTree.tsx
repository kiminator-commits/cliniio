import React from 'react';

interface Lesson {
  id: string;
  title: string;
  completed?: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons?: Lesson[];
}

interface ModuleTreeProps {
  modules: Module[];
  activeLessonId?: string;
  onLessonSelect?: (lessonId: string) => void;
}

export default function ModuleTree({
  modules = [],
  activeLessonId,
  onLessonSelect,
}: ModuleTreeProps) {
  return (
    <aside className="w-full sm:w-64 bg-white border-r border-gray-100 p-4 rounded-md shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">
        Course Modules
      </h2>
      <ul className="space-y-3">
        {modules.map((module) => (
          <li key={module.id}>
            <h3 className="text-sm font-medium text-gray-800">
              {module.title}
            </h3>
            <ul className="ml-3 mt-1 space-y-1">
              {module.lessons?.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    onClick={() => onLessonSelect?.(lesson.id)}
                    className={`text-xs px-2 py-1 rounded-md w-full text-left transition ${
                      activeLessonId === lesson.id
                        ? 'bg-teal-100 text-teal-800 font-medium'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {lesson.title}
                    {lesson.completed && (
                      <span className="ml-1 text-green-500">✔</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </aside>
  );
}
