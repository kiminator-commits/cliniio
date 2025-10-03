import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiChevronUp,
  mdiChevronDown,
  mdiBookOpen,
  mdiCheck,
  mdiClose,
  mdiDrag,
} from '@mdi/js';

interface Module {
  id: string;
  title?: string;
  lessons: Array<{
    id: string;
    title?: string;
    content?: string;
  }>;
}

interface ModuleNavigationProps {
  modules: Module[];
  expandedModules: Set<string>;
  onToggleModuleExpansion: (moduleId: string) => void;
  onUpdateModule: (moduleId: string, updates: Partial<Module>) => void;
  onUpdateLesson: (
    moduleId: string,
    lessonId: string,
    updates: Partial<{ title?: string }>
  ) => void;
  onOpenLessonEditor: (lessonId: string) => void;
  onLessonReorder: (
    moduleId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => void;
}

export const ModuleNavigation: React.FC<ModuleNavigationProps> = ({
  modules,
  expandedModules,
  onToggleModuleExpansion,
  onUpdateModule,
  onUpdateLesson,
  onOpenLessonEditor,
  onLessonReorder,
}) => {
  const [isModulesCollapsed, setIsModulesCollapsed] = useState(false);

  const handleDragStart = (e: React.DragEvent, lessonId: string) => {
    e.dataTransfer.setData('text/plain', lessonId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent,
    moduleId: string,
    targetLessonId: string
  ) => {
    e.preventDefault();
    const draggedLessonId = e.dataTransfer.getData('text/plain');

    if (draggedLessonId === targetLessonId) return;

    const module = modules.find((m) => m.id === moduleId);
    if (!module) return;

    const sourceIndex = module.lessons.findIndex(
      (l) => l.id === draggedLessonId
    );
    const destinationIndex = module.lessons.findIndex(
      (l) => l.id === targetLessonId
    );

    if (sourceIndex !== -1 && destinationIndex !== -1) {
      onLessonReorder(moduleId, sourceIndex, destinationIndex);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div
        className="mb-4 cursor-pointer flex items-center justify-between"
        onClick={() => setIsModulesCollapsed(!isModulesCollapsed)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsModulesCollapsed(!isModulesCollapsed);
          }
        }}
        tabIndex={0}
        role="button"
        aria-label="Toggle Step 2: Build Content"
      >
        <div className="flex items-center gap-3">
          <div>
            <h4 className="text-lg font-medium text-gray-900">
              Step 2: Build Content
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Create modules and lessons for your course
            </p>
          </div>
          {isModulesCollapsed && (
            <div className="flex items-center gap-2">
              {modules.length > 0 ? (
                <div className="flex items-center gap-1 text-green-600">
                  <Icon path={mdiCheck} size={1} />
                  <span className="text-xs font-medium">
                    {modules.length} Module{modules.length !== 1 ? 's' : ''}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-500">
                  <Icon path={mdiClose} size={1} />
                  <span className="text-xs font-medium">No Modules</span>
                </div>
              )}
            </div>
          )}
        </div>
        <Icon
          path={isModulesCollapsed ? mdiChevronDown : mdiChevronUp}
          size={1}
          className="text-gray-400"
        />
      </div>

      {!isModulesCollapsed && (
        <>
          {modules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon
                path={mdiBookOpen}
                size={3}
                className="mx-auto text-gray-300 mb-4"
              />
              <p>
                No course structure found. Please go back to Step 2 to plan your
                course.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((module, moduleIndex) => (
                <div
                  key={module.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => onToggleModuleExpansion(module.id)}
                        className="text-left hover:text-blue-600 transition-colors"
                      >
                        <Icon
                          path={
                            expandedModules.has(module.id)
                              ? mdiChevronDown
                              : mdiChevronUp
                          }
                          size={0.8}
                          className="text-gray-400"
                        />
                      </button>
                      <input
                        type="text"
                        value={module.title || `Module ${moduleIndex + 1}`}
                        onChange={(e) =>
                          onUpdateModule(module.id, { title: e.target.value })
                        }
                        className="font-medium text-gray-900 border-none focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] rounded px-2 py-1 bg-transparent hover:bg-gray-50"
                        placeholder={`Module ${moduleIndex + 1}`}
                      />
                    </div>
                    <span className="text-sm text-gray-500">
                      {module.lessons.length} lesson
                      {module.lessons.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {expandedModules.has(module.id) &&
                    module.lessons.length > 0 && (
                      <div className="ml-6 space-y-2">
                        {module.lessons.map((lesson, lessonIndex) => (
                          <div
                            key={lesson.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, lesson.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, module.id, lesson.id)}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => onOpenLessonEditor(lesson.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onOpenLessonEditor(lesson.id);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`Open lesson editor for ${lesson.title || `Lesson ${lessonIndex + 1}`}`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <div className="cursor-grab hover:cursor-grabbing p-1 text-gray-400 hover:text-gray-600">
                                <Icon path={mdiDrag} size={0.8} />
                              </div>
                              <Icon
                                path={mdiBookOpen}
                                size={0.8}
                                className="text-gray-400"
                              />
                              <input
                                type="text"
                                value={
                                  lesson.title || `Lesson ${lessonIndex + 1}`
                                }
                                onChange={(e) => {
                                  onUpdateLesson(module.id, lesson.id, {
                                    title: e.target.value,
                                  });
                                }}
                                className="text-sm font-medium text-gray-700 border-none focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] rounded px-2 py-1 bg-transparent hover:bg-gray-100"
                                placeholder={`Lesson ${lessonIndex + 1}`}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              {lesson.content &&
                              lesson.content.toString().trim() ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  Content Added
                                </span>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  No Content
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
