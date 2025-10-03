import React, {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  useCallback,
} from 'react';
import {
  ContentBuilderState,
  CourseData,
  CourseModule,
  CourseLesson,
  CourseAssessment,
  Content,
  AISuggestion,
  MediaItem,
} from '../types';

type ContentBuilderAction =
  | { type: 'SET_SELECTED_CONTENT_TYPE'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_COURSE_STEP'; payload: number }
  | { type: 'SET_COURSE_DATA'; payload: CourseData }
  | { type: 'UPDATE_COURSE_FIELD'; payload: Partial<CourseData> }
  | { type: 'ADD_MODULE'; payload: CourseModule }
  | { type: 'ADD_LESSON'; payload: { moduleId: string; lesson: CourseLesson } }
  | { type: 'ADD_ASSESSMENT'; payload: CourseAssessment }
  | {
      type: 'UPDATE_MODULE';
      payload: { moduleId: string; updates: Partial<CourseModule> };
    }
  | {
      type: 'UPDATE_LESSON';
      payload: {
        moduleId: string;
        lessonId: string;
        updates: Partial<CourseLesson>;
      };
    }
  | {
      type: 'UPDATE_ASSESSMENT';
      payload: { assessmentId: string; updates: Partial<CourseAssessment> };
    }
  | { type: 'REMOVE_MODULE'; payload: string }
  | { type: 'REMOVE_LESSON'; payload: { moduleId: string; lessonId: string } }
  | { type: 'REMOVE_ASSESSMENT'; payload: string }
  | { type: 'SET_AI_SUGGESTIONS'; payload: AISuggestion[] }
  | { type: 'UPDATE_CONTENT'; payload: Partial<Content> }
  | { type: 'ADD_MEDIA'; payload: MediaItem }
  | { type: 'REMOVE_MEDIA'; payload: string }
  | {
      type: 'BULK_CREATE_COURSE_STRUCTURE';
      payload: {
        modules: number;
        lessonsPerModule: number;
        assessments: number;
      };
    };

const initialState: ContentBuilderState = {
  contentType: 'course',
  selectedContentType: 'course',
  activeTab: 'content',
  courseStep: 1,
  courseData: {
    id: '',
    title: '',
    description: '',
    objectives: [''],
    prerequisites: [''],
    linkedPrerequisites: [],
    modules: [],
    assessments: [],
    estimatedDuration: 0,
    difficulty: 'beginner',
    tags: [],
    isPublished: false,
    settings: {
      difficulty: 'beginner',
      estimatedDuration: 0,
      tags: '',
      allowRetakes: true,
      certificateOnCompletion: true,
    },
  },
  policyData: {},
  procedureData: {},
  smsData: {},
  pathwayData: {},
  textFormattingData: {},
  tableData: {},
  mediaData: {},
  currentContent: undefined,
  aiSuggestions: [],
  mediaLibrary: [],
  isDirty: false,
  isSaving: false,
  validationErrors: {},
};

function contentBuilderReducer(
  state: ContentBuilderState,
  action: ContentBuilderAction
): ContentBuilderState {
  switch (action.type) {
    case 'SET_SELECTED_CONTENT_TYPE':
      return { ...state, selectedContentType: action.payload };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'SET_COURSE_STEP':
      return { ...state, courseStep: action.payload };

    case 'SET_COURSE_DATA':
      return { ...state, courseData: action.payload };

    case 'UPDATE_COURSE_FIELD':
      return {
        ...state,
        courseData: { ...state.courseData, ...action.payload },
      };

    case 'ADD_MODULE':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          modules: [...state.courseData.modules, action.payload],
        },
      };

    case 'ADD_LESSON':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          modules: state.courseData.modules.map((module: CourseModule) =>
            module.id === action.payload.moduleId
              ? {
                  ...module,
                  lessons: [...module.lessons, action.payload.lesson],
                }
              : module
          ),
        },
      };

    case 'ADD_ASSESSMENT':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          assessments: [...state.courseData.assessments, action.payload],
        },
      };

    case 'UPDATE_MODULE':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          modules: state.courseData.modules.map((module: CourseModule) =>
            module.id === action.payload.moduleId
              ? { ...module, ...action.payload.updates }
              : module
          ),
        },
      };

    case 'UPDATE_LESSON':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          modules: state.courseData.modules.map((module: CourseModule) =>
            module.id === action.payload.moduleId
              ? {
                  ...module,
                  lessons: module.lessons.map((lesson: CourseLesson) =>
                    lesson.id === action.payload.lessonId
                      ? { ...lesson, ...action.payload.updates }
                      : lesson
                  ),
                }
              : module
          ),
        },
      };

    case 'UPDATE_ASSESSMENT':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          assessments: state.courseData.assessments.map(
            (assessment: CourseAssessment) =>
              assessment.id === action.payload.assessmentId
                ? { ...assessment, ...action.payload.updates }
                : assessment
          ),
        },
      };

    case 'REMOVE_MODULE':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          modules: state.courseData.modules.filter(
            (module: CourseModule) => module.id !== action.payload
          ),
        },
      };

    case 'REMOVE_LESSON':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          modules: state.courseData.modules.map((module: CourseModule) =>
            module.id === action.payload.moduleId
              ? {
                  ...module,
                  lessons: module.lessons.filter(
                    (lesson: CourseLesson) =>
                      lesson.id !== action.payload.lessonId
                  ),
                }
              : module
          ),
        },
      };

    case 'REMOVE_ASSESSMENT':
      return {
        ...state,
        courseData: {
          ...state.courseData,
          assessments: state.courseData.assessments.filter(
            (assessment: CourseAssessment) => assessment.id !== action.payload
          ),
        },
      };

    case 'BULK_CREATE_COURSE_STRUCTURE': {
      const { modules, lessonsPerModule, assessments } = action.payload;

      // Create new modules with lessons
      const timestamp = Date.now();
      const newModules: CourseModule[] = Array.from(
        { length: modules },
        (_, index) => {
          const moduleId = `module-${timestamp}-${index}`;
          return {
            id: moduleId,
            title: `Module ${index + 1}`,
            description: `Module ${index + 1} description`,
            lessons: Array.from(
              { length: lessonsPerModule },
              (_, lessonIndex) => ({
                id: `lesson-${timestamp}-${index}-${lessonIndex}`,
                title: `Lesson ${lessonIndex + 1}`,
                content: `Lesson ${lessonIndex + 1} content`,
                order: lessonIndex,
                moduleId: moduleId,
                estimatedDuration: 15,
                isRequired: false,
                type: 'text' as const,
              })
            ),
            order: index,
            isRequired: false,
            estimatedDuration: lessonsPerModule * 15,
          };
        }
      );

      // Create new assessments
      const newAssessments: CourseAssessment[] = Array.from(
        { length: assessments },
        (_, index) => ({
          id: `assessment-${Date.now()}-${index}`,
          title: `Assessment ${index + 1}`,
          questions: [],
          passingScore: 70,
          isRequired: false,
        })
      );

      return {
        ...state,
        courseData: {
          ...state.courseData,
          modules: newModules,
          assessments: newAssessments,
        },
      };
    }

    case 'SET_AI_SUGGESTIONS':
      return { ...state, aiSuggestions: action.payload };

    case 'UPDATE_CONTENT':
      return {
        ...state,
        currentContent: state.currentContent
          ? { ...state.currentContent, ...action.payload }
          : (action.payload as Content),
      };

    case 'ADD_MEDIA':
      return {
        ...state,
        mediaLibrary: [...(state.mediaLibrary || []), action.payload],
      };

    case 'REMOVE_MEDIA':
      return {
        ...state,
        mediaLibrary: (state.mediaLibrary || []).filter(
          (media: { id: string }) => media.id !== action.payload
        ),
      };

    default:
      return state;
  }
}

interface ContentBuilderContextType {
  state: ContentBuilderState;
  dispatch: React.Dispatch<ContentBuilderAction>;
  createNewContent: (type: string) => void;
}

const ContentBuilderContext = createContext<
  ContentBuilderContextType | undefined
>(undefined);

export function ContentBuilderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(contentBuilderReducer, initialState);

  const createNewContent = useCallback(
    (type: string) => {
      dispatch({ type: 'SET_SELECTED_CONTENT_TYPE', payload: type });
    },
    [dispatch]
  );

  return (
    <ContentBuilderContext.Provider
      value={{ state, dispatch, createNewContent }}
    >
      {children}
    </ContentBuilderContext.Provider>
  );
}

export function useContentBuilder() {
  const context = useContext(ContentBuilderContext);
  if (context === undefined) {
    throw new Error(
      'useContentBuilder must be used within a ContentBuilderProvider'
    );
  }
  return context;
}
