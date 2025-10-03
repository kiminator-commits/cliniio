import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiRobot, mdiLightbulb } from '@mdi/js';

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

interface AISuggestionsServiceProps {
  lessonData: LessonData | null;
  courseTitle: string;
  onUpdateLesson: (updates: Partial<LessonData>) => void;
  onAddModule: (module: { title: string }) => void;
  onAddLesson: (
    moduleId: string,
    lesson: {
      title: string;
      description: string;
      estimatedDuration: number;
      isRequired: boolean;
    }
  ) => void;
}

export const AISuggestionsService: React.FC<AISuggestionsServiceProps> = ({
  lessonData,
  courseTitle,
  onUpdateLesson,
  onAddModule,
  onAddLesson,
}) => {
  const [aiSuggestions, setAiSuggestions] = useState<string[] | null>(null);

  const getAISuggestions = () => {
    if (!lessonData) return;

    const suggestions: string[] = [];

    // Generate content suggestions based on lesson type and context
    if (lessonData.title) {
      suggestions.push(
        `📝 **Enhanced Title**: "${lessonData.title}" → "${generateEnhancedTitle(lessonData.title)}"`
      );
      suggestions.push(
        `🎯 **Learning Objective**: "${generateLearningObjective(lessonData.title)}"`
      );
    }

    if (lessonData.description) {
      suggestions.push(
        `📖 **Expanded Description**: "${lessonData.description}" → "${generateExpandedDescription(lessonData.description)}"`
      );
    }

    if (lessonData.sections.length > 0) {
      const firstSection = lessonData.sections[0];
      if (firstSection.content) {
        suggestions.push(
          `✨ **Content Enhancement**: "${firstSection.content.substring(0, 50)}..." → "${generateEnhancedContent(firstSection.content, lessonData.title)}"`
        );
      } else {
        suggestions.push(
          `🚀 **Starter Content**: "${generateStarterContent(lessonData.title)}"`
        );
      }
    } else {
      suggestions.push(`📚 **Lesson Structure**: ${generateLessonStructure()}`);
    }

    setAiSuggestions(suggestions);
  };

  // AI Content Generation Functions
  const generateEnhancedTitle = (title: string): string => {
    const enhancements = [
      `Master ${title}: Complete Guide`,
      `${title} - Essential Skills & Techniques`,
      `Advanced ${title}: From Beginner to Expert`,
      `${title} Fundamentals & Best Practices`,
      `Professional ${title}: Industry Insights`,
    ];
    return enhancements[Math.floor(Math.random() * enhancements.length)];
  };

  const generateLearningObjective = (title: string): string => {
    const objectives = [
      `By the end of this lesson, you will understand the core principles of ${title}`,
      `Learn practical techniques and strategies for mastering ${title}`,
      `Develop comprehensive knowledge and skills in ${title}`,
      `Gain hands-on experience with ${title} through real-world examples`,
      `Master the fundamentals and advanced concepts of ${title}`,
    ];
    return objectives[Math.floor(Math.random() * objectives.length)];
  };

  const generateExpandedDescription = (description: string): string => {
    const expansions = [
      `${description} This comprehensive lesson covers essential concepts, practical applications, and industry best practices.`,
      `${description} Learn through interactive examples, case studies, and hands-on exercises designed for real-world success.`,
      `${description} Discover proven strategies, common pitfalls to avoid, and expert tips for mastering this topic.`,
      `${description} Perfect for both beginners and experienced professionals looking to enhance their skills.`,
    ];
    return expansions[Math.floor(Math.random() * expansions.length)];
  };

  const generateEnhancedContent = (content: string, title: string): string => {
    const enhancements = [
      `# ${title}\n\n${content}\n\n## Key Takeaways\n• Point 1\n• Point 2\n• Point 3\n\n## Next Steps\nContinue building on these foundations...`,
      `${content}\n\n## Practical Examples\nHere are real-world applications...\n\n## Common Mistakes to Avoid\n1. Mistake 1\n2. Mistake 2\n\n## Expert Tips\n• Tip 1\n• Tip 2`,
      `${content}\n\n## Summary\nThis lesson covered...\n\n## Practice Exercise\nTry this activity to reinforce your learning...\n\n## Additional Resources\nExplore these materials for deeper understanding...`,
    ];
    return enhancements[Math.floor(Math.random() * enhancements.length)];
  };

  const generateStarterContent = (title: string): string => {
    const starters = [
      `# Welcome to ${title}\n\nThis lesson will guide you through the essential concepts and practical applications of ${title}.\n\n## What You'll Learn\n• Fundamental principles\n• Key techniques\n• Real-world applications\n\n## Getting Started\nLet's begin with the basics...`,
      `# Introduction to ${title}\n\n${title} is a fundamental concept that forms the foundation for advanced learning in this field.\n\n## Learning Objectives\n• Understand core concepts\n• Apply basic techniques\n• Build practical skills\n\n## Lesson Overview\nWe'll cover...`,
      `# ${title} Essentials\n\nIn this comprehensive lesson, you'll discover everything you need to know about ${title}.\n\n## Topics Covered\n• Basic concepts\n• Intermediate techniques\n• Advanced applications\n\n## Your Learning Journey\nStart here and build your expertise...`,
    ];
    return starters[Math.floor(Math.random() * starters.length)];
  };

  const generateLessonStructure = (): string => {
    const structures = [
      `📋 **Recommended Structure**:\n1. Introduction & Overview\n2. Core Concepts\n3. Practical Examples\n4. Hands-on Exercise\n5. Summary & Next Steps`,
      `🏗️ **Content Framework**:\n• Opening Hook\n• Learning Objectives\n• Main Content (3-4 sections)\n• Practice Activities\n• Assessment Questions\n• Conclusion`,
      `📚 **Lesson Flow**:\n• Warm-up Activity\n• Theory & Concepts\n• Real-world Applications\n• Interactive Practice\n• Knowledge Check\n• Future Learning Path`,
    ];
    return structures[Math.floor(Math.random() * structures.length)];
  };

  // AI Course Structure Generation
  const generateCourseStructure = () => {
    if (!courseTitle) {
      alert(
        'Please enter a course title first to generate structure suggestions.'
      );
      return;
    }

    const courseType = courseTitle.toLowerCase();
    let suggestedModules: Array<{
      title: string;
      lessons: Array<{ title: string; description: string }>;
    }> = [];

    if (
      courseType.includes('beginner') ||
      courseType.includes('fundamental') ||
      courseType.includes('basic')
    ) {
      suggestedModules = [
        {
          title: 'Getting Started',
          lessons: [
            {
              title: 'Introduction to the Topic',
              description: 'Basic concepts and overview',
            },
            {
              title: 'Essential Tools and Setup',
              description: 'Required software and environment',
            },
            {
              title: 'First Steps',
              description: 'Your first practical exercise',
            },
          ],
        },
        {
          title: 'Core Concepts',
          lessons: [
            {
              title: 'Understanding the Basics',
              description: 'Fundamental principles',
            },
            {
              title: 'Key Techniques',
              description: 'Essential methods and approaches',
            },
            {
              title: 'Common Patterns',
              description: 'Frequently used solutions',
            },
          ],
        },
        {
          title: 'Practical Application',
          lessons: [
            {
              title: 'Real-World Examples',
              description: 'Case studies and scenarios',
            },
            {
              title: 'Hands-on Projects',
              description: 'Build something practical',
            },
            {
              title: 'Troubleshooting',
              description: 'Common issues and solutions',
            },
          ],
        },
      ];
    } else if (
      courseType.includes('advanced') ||
      courseType.includes('expert') ||
      courseType.includes('professional')
    ) {
      suggestedModules = [
        {
          title: 'Advanced Theory',
          lessons: [
            {
              title: 'Complex Concepts',
              description: 'Advanced theoretical knowledge',
            },
            {
              title: 'Advanced Techniques',
              description: 'Sophisticated methods',
            },
            {
              title: 'Performance Optimization',
              description: 'Speed and efficiency',
            },
          ],
        },
        {
          title: 'Professional Skills',
          lessons: [
            {
              title: 'Industry Best Practices',
              description: 'Professional standards',
            },
            {
              title: 'Advanced Problem Solving',
              description: 'Complex scenarios',
            },
            {
              title: 'Expert Tips and Tricks',
              description: 'Pro-level insights',
            },
          ],
        },
        {
          title: 'Mastery and Beyond',
          lessons: [
            {
              title: 'Cutting-Edge Trends',
              description: 'Latest developments',
            },
            {
              title: 'Innovation and Creativity',
              description: 'Pushing boundaries',
            },
            { title: 'Teaching Others', description: 'Sharing your expertise' },
          ],
        },
      ];
    } else {
      // General course structure
      suggestedModules = [
        {
          title: 'Foundation',
          lessons: [
            {
              title: 'Introduction and Overview',
              description: 'Course overview and objectives',
            },
            { title: 'Basic Concepts', description: 'Fundamental principles' },
            { title: 'Getting Started', description: 'First practical steps' },
          ],
        },
        {
          title: 'Core Learning',
          lessons: [
            { title: 'Main Concepts', description: 'Key learning areas' },
            {
              title: 'Practical Examples',
              description: 'Real-world applications',
            },
            {
              title: 'Interactive Practice',
              description: 'Hands-on exercises',
            },
          ],
        },
        {
          title: 'Advanced Topics',
          lessons: [
            {
              title: 'Complex Scenarios',
              description: 'Advanced applications',
            },
            { title: 'Best Practices', description: 'Industry standards' },
            { title: 'Next Steps', description: 'Future learning path' },
          ],
        },
      ];
    }

    // Apply the suggested structure
    suggestedModules.forEach((module, moduleIndex) => {
      const newModuleId = `module-${Date.now()}-${moduleIndex}`;
      onAddModule({ title: module.title });

      // Add lessons to the module
      module.lessons.forEach((lesson) => {
        onAddLesson(newModuleId, {
          title: lesson.title,
          description: lesson.description,
          estimatedDuration: 15,
          isRequired: true,
        });
      });
    });

    alert(
      `Generated ${suggestedModules.length} modules with ${suggestedModules.reduce((acc, m) => acc + m.lessons.length, 0)} lessons!`
    );
  };

  const generateContentIdeas = () => {
    if (!courseTitle) {
      alert('Please enter a course title first to generate content ideas.');
      return;
    }

    const contentIdeas = [
      '📚 **Interactive Quizzes**: Add knowledge checks throughout lessons',
      '🎯 **Learning Objectives**: Clear goals for each lesson',
      '💡 **Case Studies**: Real-world examples and scenarios',
      '🛠️ **Hands-on Exercises**: Practical activities and projects',
      '📊 **Progress Tracking**: Visual indicators of learning progress',
      '🔗 **Additional Resources**: Links to further reading and tools',
      '📝 **Summary Points**: Key takeaways at the end of each lesson',
      '❓ **Discussion Questions**: Topics for group discussion',
      '🎬 **Video Demonstrations**: Screen recordings and tutorials',
      '📋 **Checklists**: Step-by-step guides and procedures',
    ];

    const ideasText = contentIdeas.join('\n\n');

    // Create a new text section with content ideas
    if (lessonData && lessonData.sections.length > 0) {
      const updatedSections = [...lessonData.sections];
      const firstSection = updatedSections[0];
      if (firstSection && firstSection.type === 'text') {
        firstSection.content = `# Content Ideas for ${courseTitle}\n\n${ideasText}\n\n## How to Use These Ideas\n\n1. **Review each suggestion** and determine relevance to your course\n2. **Prioritize** based on your learning objectives\n3. **Integrate** into your lesson structure\n4. **Customize** to fit your specific topic and audience\n5. **Test** with learners to ensure effectiveness`;

        onUpdateLesson({ sections: updatedSections });
        alert('Content ideas have been added to your current lesson!');
      }
    } else {
      alert('Please open a lesson first to add content ideas.');
    }
  };

  const previewSuggestion = (suggestion: string) => {
    let previewContent = '';

    if (suggestion.includes('📝 **Enhanced Title**')) {
      const newTitle = suggestion.split('→ "')[1].split('"')[0];
      previewContent = `# Preview: ${newTitle}\n\nThis enhanced title is more engaging and descriptive, making it clear what learners will gain from this lesson.`;
    } else if (suggestion.includes('🎯 **Learning Objective**')) {
      const newObjective = suggestion.split('→ "')[1].split('"')[0];
      previewContent = `# Learning Objective Preview\n\n**New Objective:**\n${newObjective}\n\nThis objective clearly defines what learners will accomplish by the end of the lesson.`;
    } else if (
      suggestion.includes('✨ **Content Enhancement**') ||
      suggestion.includes('🚀 **Starter Content**')
    ) {
      const newContent = suggestion.split('→ "')[1].split('"')[0];
      previewContent = `# Content Preview\n\n**Enhanced Content:**\n\n${newContent}\n\nThis enhanced content provides a more comprehensive and structured learning experience.`;
    } else if (suggestion.includes('📚 **Lesson Structure**')) {
      previewContent = `# Structure Preview\n\n**Recommended Lesson Structure:**\n\n1. **Introduction & Overview** - Set the context and learning goals\n2. **Core Concepts** - Explain fundamental principles\n3. **Practical Examples** - Show real-world applications\n4. **Hands-on Exercise** - Provide interactive practice\n5. **Summary & Next Steps** - Reinforce learning and guide future study\n\nThis structure follows proven learning principles and ensures comprehensive coverage.`;
    }

    if (previewContent) {
      // Show preview in a modal or replace current content temporarily
      alert(
        `Preview:\n\n${previewContent}\n\nClick "Use this suggestion" to apply it to your lesson.`
      );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon path={mdiRobot} size={1.5} className="text-blue-600" />
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            AI Content Assistant
          </h3>
          <p className="text-sm text-gray-600">
            Get intelligent suggestions for your course content and structure
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={getAISuggestions}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Icon path={mdiLightbulb} size={0.8} />
          Get AI Suggestions
        </button>
        <button
          onClick={generateCourseStructure}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Icon path={mdiRobot} size={0.8} />
          Generate Course Structure
        </button>
        <button
          onClick={generateContentIdeas}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <Icon path={mdiLightbulb} size={0.8} />
          Content Ideas
        </button>
      </div>

      {aiSuggestions && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">AI Suggestions:</h4>
          {aiSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 whitespace-pre-line">{suggestion}</div>
                <div className="flex gap-2">
                  <button
                    onClick={() => previewSuggestion(suggestion)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
