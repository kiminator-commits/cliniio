export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: string;
}

export interface ModuleValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface LessonValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class ContentBuilderModuleProvider {
  /**
   * Create a new module
   */
  createModule(): Module {
    return {
      id: this.generateId(),
      title: '',
      description: '',
      lessons: [],
    };
  }

  /**
   * Create a new lesson
   */
  createLesson(type: string = 'text'): Lesson {
    return {
      id: this.generateId(),
      title: '',
      content: '',
      type,
    };
  }

  /**
   * Update module properties
   */
  updateModule(module: Module, updates: Partial<Omit<Module, 'id' | 'lessons'>>): Module {
    return {
      ...module,
      ...updates,
    };
  }

  /**
   * Update lesson properties
   */
  updateLesson(
    module: Module,
    lessonId: string,
    updates: Partial<Omit<Lesson, 'id'>>
  ): Module {
    const updatedLessons = module.lessons.map((lesson) =>
      lesson.id === lessonId ? { ...lesson, ...updates } : lesson
    );

    return {
      ...module,
      lessons: updatedLessons,
    };
  }

  /**
   * Add lesson to module
   */
  addLessonToModule(module: Module, lesson?: Lesson): Module {
    const newLesson = lesson || this.createLesson();
    return {
      ...module,
      lessons: [...module.lessons, newLesson],
    };
  }

  /**
   * Remove lesson from module
   */
  removeLessonFromModule(module: Module, lessonId: string): Module {
    return {
      ...module,
      lessons: module.lessons.filter((lesson) => lesson.id !== lessonId),
    };
  }

  /**
   * Reorder lessons in module
   */
  reorderLessons(module: Module, fromIndex: number, toIndex: number): Module {
    const lessons = [...module.lessons];
    const [movedLesson] = lessons.splice(fromIndex, 1);
    lessons.splice(toIndex, 0, movedLesson);

    return {
      ...module,
      lessons,
    };
  }

  /**
   * Duplicate module
   */
  duplicateModule(module: Module): Module {
    return {
      ...module,
      id: this.generateId(),
      title: `${module.title} (Copy)`,
      lessons: module.lessons.map((lesson) => ({
        ...lesson,
        id: this.generateId(),
      })),
    };
  }

  /**
   * Duplicate lesson
   */
  duplicateLesson(module: Module, lessonId: string): Module {
    const lessonToDuplicate = module.lessons.find((lesson) => lesson.id === lessonId);
    if (!lessonToDuplicate) return module;

    const duplicatedLesson = {
      ...lessonToDuplicate,
      id: this.generateId(),
      title: `${lessonToDuplicate.title} (Copy)`,
    };

    return {
      ...module,
      lessons: [...module.lessons, duplicatedLesson],
    };
  }

  /**
   * Validate module
   */
  validateModule(module: Module): ModuleValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check title
    if (!module.title.trim()) {
      errors.push('Module title is required');
    } else if (module.title.trim().length < 3) {
      warnings.push('Module title should be at least 3 characters long');
    }

    // Check description
    if (!module.description.trim()) {
      warnings.push('Module description is recommended');
    } else if (module.description.trim().length < 10) {
      warnings.push('Module description should be more descriptive');
    }

    // Check lessons
    if (module.lessons.length === 0) {
      errors.push('Module must have at least one lesson');
    }

    // Validate individual lessons
    module.lessons.forEach((lesson, index) => {
      const lessonValidation = this.validateLesson(lesson);
      if (!lessonValidation.isValid) {
        errors.push(`Lesson ${index + 1}: ${lessonValidation.errors.join(', ')}`);
      }
      if (lessonValidation.warnings.length > 0) {
        warnings.push(`Lesson ${index + 1}: ${lessonValidation.warnings.join(', ')}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate lesson
   */
  validateLesson(lesson: Lesson): LessonValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check title
    if (!lesson.title.trim()) {
      errors.push('Lesson title is required');
    } else if (lesson.title.trim().length < 3) {
      warnings.push('Lesson title should be at least 3 characters long');
    }

    // Check content
    if (!lesson.content.trim()) {
      errors.push('Lesson content is required');
    } else if (lesson.content.trim().length < 50) {
      warnings.push('Lesson content should be more substantial');
    }

    // Check type
    if (!lesson.type) {
      errors.push('Lesson type is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get module statistics
   */
  getModuleStatistics(module: Module): {
    totalLessons: number;
    completedLessons: number;
    completionPercentage: number;
    averageLessonLength: number;
    totalContentLength: number;
  } {
    const totalLessons = module.lessons.length;
    const completedLessons = module.lessons.filter(
      (lesson) => lesson.title.trim() && lesson.content.trim()
    ).length;

    const completionPercentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    const totalContentLength = module.lessons.reduce(
      (sum, lesson) => sum + lesson.content.length,
      0
    );

    const averageLessonLength = totalLessons > 0 
      ? Math.round(totalContentLength / totalLessons) 
      : 0;

    return {
      totalLessons,
      completedLessons,
      completionPercentage,
      averageLessonLength,
      totalContentLength,
    };
  }

  /**
   * Get lesson statistics
   */
  getLessonStatistics(lesson: Lesson): {
    wordCount: number;
    characterCount: number;
    readingTimeMinutes: number;
    isEmpty: boolean;
    isComplete: boolean;
  } {
    const wordCount = lesson.content.trim().split(/\s+/).filter(word => word.length > 0).length;
    const characterCount = lesson.content.length;
    const readingTimeMinutes = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
    const isEmpty = !lesson.title.trim() && !lesson.content.trim();
    const isComplete = lesson.title.trim() && lesson.content.trim();

    return {
      wordCount,
      characterCount,
      readingTimeMinutes,
      isEmpty,
      isComplete,
    };
  }

  /**
   * Get module recommendations
   */
  getModuleRecommendations(module: Module): Array<{
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    action: string;
  }> {
    const recommendations: Array<{
      type: 'error' | 'warning' | 'suggestion';
      message: string;
      action: string;
    }> = [];

    const validation = this.validateModule(module);

    // Add validation errors as recommendations
    validation.errors.forEach((error) => {
      recommendations.push({
        type: 'error',
        message: error,
        action: 'Fix this issue to complete the module',
      });
    });

    validation.warnings.forEach((warning) => {
      recommendations.push({
        type: 'warning',
        message: warning,
        action: 'Consider improving this aspect',
      });
    });

    // Add content suggestions
    if (module.lessons.length === 0) {
      recommendations.push({
        type: 'error',
        message: 'Module has no lessons',
        action: 'Add at least one lesson to make the module functional',
      });
    } else if (module.lessons.length < 3) {
      recommendations.push({
        type: 'suggestion',
        message: 'Module has few lessons',
        action: 'Consider adding more lessons for better learning experience',
      });
    }

    // Check for lesson variety
    const lessonTypes = new Set(module.lessons.map(lesson => lesson.type));
    if (lessonTypes.size === 1 && module.lessons.length > 1) {
      recommendations.push({
        type: 'suggestion',
        message: 'All lessons are of the same type',
        action: 'Consider mixing different lesson types for variety',
      });
    }

    return recommendations;
  }

  /**
   * Get lesson recommendations
   */
  getLessonRecommendations(lesson: Lesson): Array<{
    type: 'error' | 'warning' | 'suggestion';
    message: string;
    action: string;
  }> {
    const recommendations: Array<{
      type: 'error' | 'warning' | 'suggestion';
      message: string;
      action: string;
    }> = [];

    const validation = this.validateLesson(lesson);

    // Add validation errors as recommendations
    validation.errors.forEach((error) => {
      recommendations.push({
        type: 'error',
        message: error,
        action: 'Fix this issue to complete the lesson',
      });
    });

    validation.warnings.forEach((warning) => {
      recommendations.push({
        type: 'warning',
        message: warning,
        action: 'Consider improving this aspect',
      });
    });

    // Add content suggestions
    const stats = this.getLessonStatistics(lesson);
    
    if (stats.wordCount < 100) {
      recommendations.push({
        type: 'suggestion',
        message: 'Lesson content is quite short',
        action: 'Consider adding more content for better learning value',
      });
    }

    if (stats.readingTimeMinutes < 2) {
      recommendations.push({
        type: 'suggestion',
        message: 'Lesson reading time is very short',
        action: 'Consider expanding the content to provide more value',
      });
    }

    return recommendations;
  }

  /**
   * Export module data
   */
  exportModuleData(module: Module): string {
    const statistics = this.getModuleStatistics(module);
    const validation = this.validateModule(module);
    const recommendations = this.getModuleRecommendations(module);

    return JSON.stringify({
      module,
      statistics,
      validation,
      recommendations,
      timestamp: new Date().toISOString(),
    }, null, 2);
  }

  /**
   * Import module data
   */
  importModuleData(jsonData: string): {
    success: boolean;
    module: Module | null;
    errors: string[];
  } {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.module) {
        return {
          success: false,
          module: null,
          errors: ['Invalid format: module data not found'],
        };
      }

      const module = data.module as Module;
      const validation = this.validateModule(module);

      return {
        success: validation.isValid,
        module: validation.isValid ? module : null,
        errors: validation.errors,
      };
    } catch {
      return {
        success: false,
        module: null,
        errors: ['Invalid JSON format'],
      };
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get available lesson types
   */
  getAvailableLessonTypes(): Array<{
    value: string;
    label: string;
    description: string;
    icon: string;
  }> {
    return [
      {
        value: 'text',
        label: 'Text Lesson',
        description: 'Text-based learning content',
        icon: '📄',
      },
      {
        value: 'video',
        label: 'Video Lesson',
        description: 'Video-based learning content',
        icon: '🎥',
      },
      {
        value: 'interactive',
        label: 'Interactive Lesson',
        description: 'Interactive learning activities',
        icon: '🎮',
      },
      {
        value: 'assessment',
        label: 'Assessment',
        description: 'Knowledge assessment',
        icon: '📝',
      },
      {
        value: 'resource',
        label: 'Resource',
        description: 'Additional learning resources',
        icon: '📚',
      },
      {
        value: 'quiz',
        label: 'Quiz',
        description: 'Quick knowledge check',
        icon: '❓',
      },
    ];
  }

  /**
   * Get module templates
   */
  getModuleTemplates(): Array<{
    name: string;
    description: string;
    template: Module;
  }> {
    return [
      {
        name: 'Basic Module',
        description: 'A simple module with text lessons',
        template: {
          id: this.generateId(),
          title: 'New Module',
          description: 'Module description',
          lessons: [
            {
              id: this.generateId(),
              title: 'Introduction',
              content: 'Welcome to this module...',
              type: 'text',
            },
          ],
        },
      },
      {
        name: 'Video Module',
        description: 'A module focused on video content',
        template: {
          id: this.generateId(),
          title: 'Video Module',
          description: 'Learn through video content',
          lessons: [
            {
              id: this.generateId(),
              title: 'Introduction Video',
              content: 'Watch this introduction video...',
              type: 'video',
            },
            {
              id: this.generateId(),
              title: 'Main Content Video',
              content: 'Main learning content...',
              type: 'video',
            },
          ],
        },
      },
      {
        name: 'Interactive Module',
        description: 'A module with interactive elements',
        template: {
          id: this.generateId(),
          title: 'Interactive Module',
          description: 'Engage with interactive content',
          lessons: [
            {
              id: this.generateId(),
              title: 'Introduction',
              content: 'Welcome to this interactive module...',
              type: 'text',
            },
            {
              id: this.generateId(),
              title: 'Interactive Activity',
              content: 'Complete this interactive activity...',
              type: 'interactive',
            },
            {
              id: this.generateId(),
              title: 'Knowledge Check',
              content: 'Test your understanding...',
              type: 'quiz',
            },
          ],
        },
      },
    ];
  }
}
