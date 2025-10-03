import { useContentBuilder } from '../context';
import {
  CourseModule,
  CourseLesson,
  CourseAssessment,
  CourseData,
} from '../types';
import { useCallback } from 'react';

export function useContentBuilderActions() {
  const { dispatch } = useContentBuilder();

  const setSelectedContentType = useCallback(
    (contentType: string) => {
      dispatch({ type: 'SET_SELECTED_CONTENT_TYPE', payload: contentType });
    },
    [dispatch]
  );

  const setActiveTab = useCallback(
    (tab: string) => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    },
    [dispatch]
  );

  const setCourseStep = useCallback(
    (step: number) => {
      dispatch({ type: 'SET_COURSE_STEP', payload: step });
    },
    [dispatch]
  );

  const updateCourseField = useCallback(
    (updates: Partial<CourseData>) => {
      dispatch({ type: 'UPDATE_COURSE_FIELD', payload: updates });
    },
    [dispatch]
  );

  const addModule = useCallback(() => {
    const newModule: CourseModule = {
      id: `module-${Date.now()}`,
      title: `Module ${Date.now()}`,
      description: '',
      lessons: [],
      order: Date.now(),
      isRequired: false,
      estimatedDuration: 30,
    };
    dispatch({ type: 'ADD_MODULE', payload: newModule });
  }, [dispatch]);

  const addLesson = useCallback(
    (moduleId: string) => {
      const newLesson: CourseLesson = {
        id: `lesson-${Date.now()}`,
        title: `Lesson ${Date.now()}`,
        content: '',
        order: Date.now(),
        moduleId: moduleId,
        estimatedDuration: 15,
        isRequired: false,
        type: 'text',
      };
      dispatch({
        type: 'ADD_LESSON',
        payload: { moduleId, lesson: newLesson },
      });
    },
    [dispatch]
  );

  const addAssessment = useCallback(() => {
    const newAssessment: CourseAssessment = {
      id: `assessment-${Date.now()}`,
      title: `Assessment ${Date.now()}`,
      questions: [],
      passingScore: 70,
      isRequired: false,
    };
    dispatch({ type: 'ADD_ASSESSMENT', payload: newAssessment });
  }, [dispatch]);

  const updateModule = useCallback(
    (moduleId: string, updates: Partial<CourseModule>) => {
      dispatch({ type: 'UPDATE_MODULE', payload: { moduleId, updates } });
    },
    [dispatch]
  );

  const updateLesson = useCallback(
    (moduleId: string, lessonId: string, updates: Partial<CourseLesson>) => {
      dispatch({
        type: 'UPDATE_LESSON',
        payload: { moduleId, lessonId, updates },
      });
    },
    [dispatch]
  );

  const updateAssessment = useCallback(
    (assessmentId: string, updates: Partial<CourseAssessment>) => {
      dispatch({
        type: 'UPDATE_ASSESSMENT',
        payload: { assessmentId, updates },
      });
    },
    [dispatch]
  );

  const removeModule = useCallback(
    (moduleId: string) => {
      dispatch({ type: 'REMOVE_MODULE', payload: moduleId });
    },
    [dispatch]
  );

  const removeLesson = useCallback(
    (moduleId: string, lessonId: string) => {
      dispatch({ type: 'REMOVE_LESSON', payload: { moduleId, lessonId } });
    },
    [dispatch]
  );

  const removeAssessment = useCallback(
    (assessmentId: string) => {
      dispatch({ type: 'REMOVE_ASSESSMENT', payload: assessmentId });
    },
    [dispatch]
  );

  const bulkCreateCourseStructure = useCallback(
    (modules: number, lessonsPerModule: number, assessments: number) => {
      dispatch({
        type: 'BULK_CREATE_COURSE_STRUCTURE',
        payload: { modules, lessonsPerModule, assessments },
      });
    },
    [dispatch]
  );

  return {
    setSelectedContentType,
    setActiveTab,
    setCourseStep,
    updateCourseField,
    addModule,
    addLesson,
    addAssessment,
    updateModule,
    updateLesson,
    updateAssessment,
    removeModule,
    removeLesson,
    removeAssessment,
    bulkCreateCourseStructure,
  };
}
