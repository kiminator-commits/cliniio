export interface CourseData {
  modules: Array<{
    id: string;
    title: string;
    description: string;
    lessons: Array<{
      id: string;
      title: string;
      content: string;
      type: string;
    }>;
  }>;
  assessments: Array<{
    id: string;
    title: string;
    questions: unknown[];
    passingScore: number;
    timeLimit?: number;
  }>;
  estimatedDuration?: number;
}

export interface CompletionStatus {
  modules: { total: number; completed: number };
  lessons: { total: number; completed: number };
  assessments: { total: number; completed: number };
}

export interface ProgressMetrics {
  overallProgress: number;
  completionStatus: CompletionStatus;
  moduleProgress: Record<string, number>;
  assessmentProgress: Record<string, number>;
}

export class ContentBuilderProgressProvider {
  /**
   * Get completion status for all course components
   */
  getCompletionStatus(courseData: CourseData): CompletionStatus {
    const totalModules = courseData.modules.length;
    const totalLessons = courseData.modules.reduce(
      (sum, module) => sum + module.lessons.length,
      0
    );
    const totalAssessments = courseData.assessments.length;

    const completedModules = courseData.modules.filter(
      (module) =>
        module.title.trim() &&
        (module as { description?: string }).description?.trim() &&
        module.lessons.length > 0
    ).length;

    const completedLessons = courseData.modules.reduce(
      (sum, module) =>
        sum +
        module.lessons.filter(
          (lesson) => lesson.title.trim() && lesson.content.trim()
        ).length,
      0
    );

    const completedAssessments = courseData.assessments.filter(
      (assessment) => assessment.title.trim() && assessment.questions.length > 0
    ).length;

    return {
      modules: { total: totalModules, completed: completedModules },
      lessons: { total: totalLessons, completed: completedLessons },
      assessments: { total: totalAssessments, completed: completedAssessments },
    };
  }

  /**
   * Calculate overall progress percentage
   */
  calculateOverallProgress(completionStatus: CompletionStatus): number {
    const totalItems =
      completionStatus.modules.total +
      completionStatus.lessons.total +
      completionStatus.assessments.total;

    if (totalItems === 0) return 0;

    const completedItems =
      completionStatus.modules.completed +
      completionStatus.lessons.completed +
      completionStatus.assessments.completed;

    return Math.round((completedItems / totalItems) * 100);
  }

  /**
   * Calculate progress for a specific module
   */
  calculateModuleProgress(module: CourseData['modules'][0]): number {
    if (module.lessons.length === 0) return 0;

    const completedLessons = module.lessons.filter(
      (lesson) => lesson.title.trim() && lesson.content.trim()
    ).length;

    return Math.round((completedLessons / module.lessons.length) * 100);
  }

  /**
   * Calculate progress for a specific assessment
   */
  calculateAssessmentProgress(assessment: CourseData['assessments'][0]): number {
    return assessment.questions.length > 0 ? 100 : 0;
  }

  /**
   * Get all progress metrics
   */
  getProgressMetrics(courseData: CourseData): ProgressMetrics {
    const completionStatus = this.getCompletionStatus(courseData);
    const overallProgress = this.calculateOverallProgress(completionStatus);

    const moduleProgress: Record<string, number> = {};
    courseData.modules.forEach((module) => {
      moduleProgress[module.id] = this.calculateModuleProgress(module);
    });

    const assessmentProgress: Record<string, number> = {};
    courseData.assessments.forEach((assessment) => {
      assessmentProgress[assessment.id] = this.calculateAssessmentProgress(assessment);
    });

    return {
      overallProgress,
      completionStatus,
      moduleProgress,
      assessmentProgress,
    };
  }

  /**
   * Get progress summary for dashboard
   */
  getProgressSummary(courseData: CourseData): {
    totalModules: number;
    totalLessons: number;
    totalAssessments: number;
    completedModules: number;
    completedLessons: number;
    completedAssessments: number;
    overallProgress: number;
    estimatedDuration: number;
  } {
    const completionStatus = this.getCompletionStatus(courseData);
    const overallProgress = this.calculateOverallProgress(completionStatus);

    return {
      totalModules: completionStatus.modules.total,
      totalLessons: completionStatus.lessons.total,
      totalAssessments: completionStatus.assessments.total,
      completedModules: completionStatus.modules.completed,
      completedLessons: completionStatus.lessons.completed,
      completedAssessments: completionStatus.assessments.completed,
      overallProgress,
      estimatedDuration: courseData.estimatedDuration || 0,
    };
  }

  /**
   * Get progress recommendations
   */
  getProgressRecommendations(courseData: CourseData): Array<{
    type: 'module' | 'lesson' | 'assessment';
    priority: 'high' | 'medium' | 'low';
    message: string;
    action: string;
  }> {
    const recommendations: Array<{
      type: 'module' | 'lesson' | 'assessment';
      priority: 'high' | 'medium' | 'low';
      message: string;
      action: string;
    }> = [];

    const completionStatus = this.getCompletionStatus(courseData);

    // Check for empty modules
    if (completionStatus.modules.total === 0) {
      recommendations.push({
        type: 'module',
        priority: 'high',
        message: 'No modules created yet',
        action: 'Add your first module to start building the course',
      });
    }

    // Check for modules without lessons
    const modulesWithoutLessons = courseData.modules.filter(
      (module) => module.lessons.length === 0
    );
    if (modulesWithoutLessons.length > 0) {
      recommendations.push({
        type: 'lesson',
        priority: 'high',
        message: `${modulesWithoutLessons.length} module(s) have no lessons`,
        action: 'Add lessons to complete your modules',
      });
    }

    // Check for incomplete lessons
    const incompleteLessons = courseData.modules.reduce(
      (sum, module) =>
        sum +
        module.lessons.filter(
          (lesson) => !lesson.title.trim() || !lesson.content.trim()
        ).length,
      0
    );
    if (incompleteLessons > 0) {
      recommendations.push({
        type: 'lesson',
        priority: 'medium',
        message: `${incompleteLessons} lesson(s) need content`,
        action: 'Complete lesson titles and content',
      });
    }

    // Check for assessments without questions
    const assessmentsWithoutQuestions = courseData.assessments.filter(
      (assessment) => assessment.questions.length === 0
    );
    if (assessmentsWithoutQuestions.length > 0) {
      recommendations.push({
        type: 'assessment',
        priority: 'medium',
        message: `${assessmentsWithoutQuestions.length} assessment(s) have no questions`,
        action: 'Add questions to make assessments functional',
      });
    }

    // Check for missing assessments
    if (completionStatus.assessments.total === 0) {
      recommendations.push({
        type: 'assessment',
        priority: 'low',
        message: 'No assessments created yet',
        action: 'Add assessments to test learner knowledge',
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get progress statistics
   */
  getProgressStatistics(courseData: CourseData): {
    averageModuleCompletion: number;
    averageLessonCompletion: number;
    averageAssessmentCompletion: number;
    totalContentItems: number;
    completedContentItems: number;
    completionRate: number;
  } {
    const completionStatus = this.getCompletionStatus(courseData);

    const averageModuleCompletion =
      completionStatus.modules.total > 0
        ? (completionStatus.modules.completed / completionStatus.modules.total) * 100
        : 0;

    const averageLessonCompletion =
      completionStatus.lessons.total > 0
        ? (completionStatus.lessons.completed / completionStatus.lessons.total) * 100
        : 0;

    const averageAssessmentCompletion =
      completionStatus.assessments.total > 0
        ? (completionStatus.assessments.completed / completionStatus.assessments.total) * 100
        : 0;

    const totalContentItems =
      completionStatus.modules.total +
      completionStatus.lessons.total +
      completionStatus.assessments.total;

    const completedContentItems =
      completionStatus.modules.completed +
      completionStatus.lessons.completed +
      completionStatus.assessments.completed;

    const completionRate =
      totalContentItems > 0 ? (completedContentItems / totalContentItems) * 100 : 0;

    return {
      averageModuleCompletion,
      averageLessonCompletion,
      averageAssessmentCompletion,
      totalContentItems,
      completedContentItems,
      completionRate,
    };
  }

  /**
   * Validate course completion
   */
  validateCourseCompletion(courseData: CourseData): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for empty course
    if (courseData.modules.length === 0) {
      errors.push('Course must have at least one module');
    }

    // Check for modules without lessons
    const modulesWithoutLessons = courseData.modules.filter(
      (module) => module.lessons.length === 0
    );
    if (modulesWithoutLessons.length > 0) {
      errors.push(`${modulesWithoutLessons.length} module(s) have no lessons`);
    }

    // Check for incomplete modules
    const incompleteModules = courseData.modules.filter(
      (module) => !module.title.trim() || !module.description.trim()
    );
    if (incompleteModules.length > 0) {
      errors.push(`${incompleteModules.length} module(s) are incomplete`);
    }

    // Check for incomplete lessons
    const incompleteLessons = courseData.modules.reduce(
      (sum, module) =>
        sum +
        module.lessons.filter(
          (lesson) => !lesson.title.trim() || !lesson.content.trim()
        ).length,
      0
    );
    if (incompleteLessons > 0) {
      warnings.push(`${incompleteLessons} lesson(s) are incomplete`);
    }

    // Check for assessments without questions
    const assessmentsWithoutQuestions = courseData.assessments.filter(
      (assessment) => assessment.questions.length === 0
    );
    if (assessmentsWithoutQuestions.length > 0) {
      warnings.push(`${assessmentsWithoutQuestions.length} assessment(s) have no questions`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get progress milestones
   */
  getProgressMilestones(): Array<{
    percentage: number;
    name: string;
    description: string;
    icon: string;
  }> {
    return [
      {
        percentage: 25,
        name: 'Getting Started',
        description: 'First module and lessons created',
        icon: '🚀',
      },
      {
        percentage: 50,
        name: 'Halfway There',
        description: 'Half of the course content completed',
        icon: '🎯',
      },
      {
        percentage: 75,
        name: 'Almost Ready',
        description: 'Most content completed, finishing touches needed',
        icon: '✨',
      },
      {
        percentage: 100,
        name: 'Course Complete',
        description: 'All modules, lessons, and assessments finished',
        icon: '🏆',
      },
    ];
  }

  /**
   * Check if milestone is reached
   */
  isMilestoneReached(currentProgress: number, milestonePercentage: number): boolean {
    return currentProgress >= milestonePercentage;
  }

  /**
   * Get next milestone
   */
  getNextMilestone(currentProgress: number): {
    percentage: number;
    name: string;
    description: string;
    icon: string;
    progressToNext: number;
  } | null {
    const milestones = this.getProgressMilestones();
    const nextMilestone = milestones.find(m => m.percentage > currentProgress);
    
    if (!nextMilestone) return null;

    const progressToNext = nextMilestone.percentage - currentProgress;

    return {
      ...nextMilestone,
      progressToNext,
    };
  }

  /**
   * Export progress data
   */
  exportProgressData(courseData: CourseData): string {
    const progressMetrics = this.getProgressMetrics(courseData);
    const statistics = this.getProgressStatistics(courseData);
    const recommendations = this.getProgressRecommendations(courseData);

    return JSON.stringify({
      progressMetrics,
      statistics,
      recommendations,
      timestamp: new Date().toISOString(),
    }, null, 2);
  }
}
