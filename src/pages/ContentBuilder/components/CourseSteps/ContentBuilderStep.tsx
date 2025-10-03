import React, { useState, useCallback, useEffect } from 'react';
import { useContentBuilder } from '../../context';
import { useContentBuilderActions } from '../../hooks';
import { useNavigation } from '../../../../contexts/NavigationContext';
import { ModuleNavigation } from './ModuleNavigation';
import { AISuggestionsService } from './AISuggestionsService';
import { ContentQualityValidator } from './ContentQualityValidator';
import { LessonEditor } from './LessonEditor';

interface ContentSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'file' | 'link';
  content: string;
  metadata?: {
    url?: string;
    alt?: string;
    caption?: string;
    duration?: number;
    size?: string;
  };
  order: number;
}

interface LessonData {
  id: string;
  title: string;
  description: string;
  sections: ContentSection[];
  estimatedDuration: number;
  isRequired: boolean;
}

const ContentBuilderStep: React.FC = () => {
  const { state } = useContentBuilder();
  const {
    updateLesson,
    addModule,
    addLesson,
    updateCourseField,
    updateModule,
  } = useContentBuilderActions();
  const { courseData } = state;
  const { closeDrawer } = useNavigation();

  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [isStep1Collapsed, setIsStep1Collapsed] = useState(false);

  // Auto-close the main menu drawer when entering Step 3 to maximize text editor space
  useEffect(() => {
    closeDrawer();
  }, [closeDrawer]);

  const openLessonEditor = useCallback(
    (lessonId: string) => {
      const lesson = courseData.modules
        .flatMap((module) => module.lessons)
        .find((l) => l.id === lessonId);

      if (lesson) {
        const sections: ContentSection[] =
          lesson.content && typeof lesson.content === 'string'
            ? [
                {
                  id: '1',
                  type: 'text',
                  content: lesson.content,
                  order: 0,
                },
              ]
            : [];

        setLessonData({
          id: lesson.id,
          title: lesson.title || `Lesson ${lesson.id}`,
          description: (lesson as { description?: string }).description || '',
          sections,
          estimatedDuration: lesson.estimatedDuration || 15,
          isRequired: lesson.isRequired || false,
        });
        setSelectedLesson(lessonId);
      }
    },
    [courseData.modules]
  );

  const toggleModuleExpansion = (moduleId: string) => {
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
    }
    setExpandedModules(newExpanded);
  };

  const handleLessonReorder = (
    moduleId: string,
    sourceIndex: number,
    destinationIndex: number
  ) => {
    const module = courseData.modules.find((m) => m.id === moduleId);
    if (!module) return;

    const lessons = [...module.lessons];
    const [reorderedLesson] = lessons.splice(sourceIndex, 1);
    lessons.splice(destinationIndex, 0, reorderedLesson);

    // Update the module with reordered lessons
    updateModule(moduleId, { lessons });
  };

  const handleUpdateLesson = (updates: Partial<LessonData>) => {
    if (!lessonData) return;

    const updatedLessonData = { ...lessonData, ...updates };
    setLessonData(updatedLessonData);

    // Find the module containing this lesson
    const module = courseData.modules.find((m) =>
      m.lessons.some((l) => l.id === lessonData.id)
    );

    if (module) {
      // Convert sections back to content string for storage
      const content = updatedLessonData.sections
        .map((section) => section.content)
        .join('\n\n');

      updateLesson(module.id, lessonData.id, {
        title: updatedLessonData.title,
        // description: (updatedLessonData as any).description,
        content,
        estimatedDuration: updatedLessonData.estimatedDuration,
        isRequired: updatedLessonData.isRequired,
      });
    }
  };

  const closeLessonEditor = () => {
    setSelectedLesson(null);
    setLessonData(null);
  };

  // If a lesson is selected, show the lesson editor
  if (selectedLesson && lessonData) {
    return (
      <LessonEditor
        lessonData={lessonData}
        onUpdateLesson={handleUpdateLesson}
        onClose={closeLessonEditor}
      />
    );
  }

  // Main content builder view
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Step 1: Course Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div
            className="mb-4 cursor-pointer flex items-center justify-between"
            onClick={() => setIsStep1Collapsed(!isStep1Collapsed)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setIsStep1Collapsed(!isStep1Collapsed);
              }
            }}
            tabIndex={0}
            role="button"
            aria-label="Toggle Step 1: Course Information"
          >
            <div className="flex items-center gap-3">
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  Step 1: Course Information
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  Set your course title and description
                </p>
              </div>
            </div>
          </div>

          {!isStep1Collapsed && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="course-title-step3"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Course Title *
                </label>
                <input
                  id="course-title-step3"
                  type="text"
                  value={courseData.title}
                  onChange={(e) => updateCourseField({ title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                  placeholder="Enter your course title..."
                />
              </div>
              <div>
                <label
                  htmlFor="course-description-step3"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Course Description *
                </label>
                <textarea
                  id="course-description-step3"
                  rows={2}
                  value={courseData.description}
                  onChange={(e) =>
                    updateCourseField({ description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent"
                  placeholder="Describe what learners will gain from this course..."
                />
              </div>
            </div>
          )}
        </div>

        {/* AI Suggestions Service */}
        <AISuggestionsService
          lessonData={lessonData}
          courseTitle={courseData.title}
          onUpdateLesson={handleUpdateLesson}
          onAddModule={addModule}
          onAddLesson={addLesson}
        />

        {/* Content Quality Validator */}
        <ContentQualityValidator lessonData={lessonData} />

        {/* Module Navigation */}
        <ModuleNavigation
          modules={courseData.modules}
          expandedModules={expandedModules}
          onToggleModuleExpansion={toggleModuleExpansion}
          onUpdateModule={
            updateModule as (
              moduleId: string,
              updates: Record<string, unknown>
            ) => void
          }
          onUpdateLesson={(moduleId, lessonId, updates) => {
            updateLesson(moduleId, lessonId, updates);
          }}
          onOpenLessonEditor={openLessonEditor}
          onLessonReorder={handleLessonReorder}
        />
      </div>
    </div>
  );
};

export default ContentBuilderStep;
