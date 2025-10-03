import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiEye, mdiPublish, mdiClock } from '@mdi/js';
import { useContentBuilder } from '../../context';
import { useContentBuilderActions } from '../../hooks';
import CourseValidation from './CourseValidation';
import PublishingSettings from './PublishingSettings';
import SEOMetadata from './SEOMetadata';
import CoursePreview from './CoursePreview';
import PublishingWorkflow from './PublishingWorkflow';
import ValidationStatus from './ValidationStatus';

interface ValidationResult {
  field: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
}

const CourseStep4: React.FC = () => {
  const { state } = useContentBuilder();
  const { updateCourseField } = useContentBuilderActions();
  const { courseData } = state;

  const [validationResults, setValidationResults] = useState<
    ValidationResult[]
  >([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSettings, setPublishSettings] = useState({
    isPublic: true,
    requireEnrollment: false,
    allowGuestAccess: false,
    maxEnrollments: 0,
    enrollmentStartDate: '',
    enrollmentEndDate: '',
    courseStartDate: '',
    courseEndDate: '',
    autoArchive: false,
    archiveAfterDays: 30,
  });
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: courseData.title || '',
    metaDescription: courseData.description || '',
    keywords: '',
    canonicalUrl: '',
    ogImage: '',
    structuredData: true,
  });

  const [collapsedSections, setCollapsedSections] = useState({
    review: false,
    settings: false,
    seo: false,
    access: false,
    preview: false,
  });

  // Validation logic
  useEffect(() => {
    const validateCourse = () => {
      const results: ValidationResult[] = [];

      // Course title validation
      if (!courseData.title || courseData.title.trim().length < 5) {
        results.push({
          field: 'title',
          status: 'error',
          message: 'Course title must be at least 5 characters long',
        });
      } else if (courseData.title.length > 100) {
        results.push({
          field: 'title',
          status: 'warning',
          message: 'Course title is quite long, consider shortening it',
        });
      } else {
        results.push({
          field: 'title',
          status: 'valid',
          message: 'Course title is appropriate length',
        });
      }

      // Course description validation
      if (
        !courseData.description ||
        courseData.description.trim().length < 20
      ) {
        results.push({
          field: 'description',
          status: 'error',
          message: 'Course description must be at least 20 characters long',
        });
      } else if (courseData.description.length > 500) {
        results.push({
          field: 'description',
          status: 'warning',
          message: 'Course description is quite long, consider shortening it',
        });
      } else {
        results.push({
          field: 'description',
          status: 'valid',
          message: 'Course description is appropriate length',
        });
      }

      // Modules validation
      if (courseData.modules.length === 0) {
        results.push({
          field: 'modules',
          status: 'error',
          message: 'Course must have at least one module',
        });
      } else {
        const totalLessons = courseData.modules.reduce(
          (acc, module) => acc + module.lessons.length,
          0
        );
        if (totalLessons === 0) {
          results.push({
            field: 'lessons',
            status: 'error',
            message: 'Course must have at least one lesson',
          });
        } else if (totalLessons < 3) {
          results.push({
            field: 'lessons',
            status: 'warning',
            message: 'Consider adding more lessons for a comprehensive course',
          });
        } else {
          results.push({
            field: 'lessons',
            status: 'valid',
            message: `Course has ${totalLessons} lessons across ${courseData.modules.length} modules`,
          });
        }
      }

      // Settings validation
      if (!courseData.settings?.difficulty) {
        results.push({
          field: 'difficulty',
          status: 'error',
          message: 'Difficulty level must be set',
        });
      } else {
        results.push({
          field: 'difficulty',
          status: 'valid',
          message: `Difficulty level: ${courseData.settings.difficulty}`,
        });
      }

      // Assessment validation
      if (courseData.assessments && courseData.assessments.length > 0) {
        results.push({
          field: 'assessments',
          status: 'valid',
          message: `Course has ${courseData.assessments.length} assessment(s)`,
        });
      } else {
        results.push({
          field: 'assessments',
          status: 'warning',
          message: 'Consider adding assessments to evaluate learning',
        });
      }

      setValidationResults(results);
    };

    validateCourse();
  }, [courseData]);

  const getValidationStatus = () => {
    const errors = validationResults.filter((r) => r.status === 'error').length;
    const warnings = validationResults.filter(
      (r) => r.status === 'warning'
    ).length;

    if (errors > 0)
      return { status: 'error', message: `${errors} issues must be resolved` };
    if (warnings > 0)
      return { status: 'warning', message: `${warnings} warnings to consider` };
    return { status: 'valid', message: 'Course is ready to publish' };
  };

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePublish = async () => {
    const validationStatus = getValidationStatus();
    if (validationStatus.status === 'error') {
      alert('Please resolve all validation errors before publishing');
      return;
    }

    setIsPublishing(true);

    try {
      // Simulate publishing process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update course status
      updateCourseField({ isPublished: true });

      alert(
        'Course published successfully! It is now available in the library.'
      );
    } catch (err) {
      console.error(err);
      alert('Failed to publish course. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const generatePreview = () => {
    // Generate course preview data
    const previewData = {
      title: courseData.title,
      description: courseData.description,
      modules: courseData.modules.length,
      lessons: courseData.modules.reduce((acc, m) => acc + m.lessons.length, 0),
      duration: courseData.settings?.estimatedDuration || 0,
      difficulty: courseData.settings?.difficulty || 'beginner',
    };

    alert(
      `Course Preview:\n\nTitle: ${previewData.title}\nDescription: ${previewData.description}\nModules: ${previewData.modules}\nLessons: ${previewData.lessons}\nDuration: ${previewData.duration} minutes\nDifficulty: ${previewData.difficulty}`
    );
  };

  const validationStatus = getValidationStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-2xl font-semibold text-gray-900">
            Publish & Settings
          </h4>
          <p className="text-sm text-gray-600">
            Final review and configuration before publishing your course
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={generatePreview}
            className="inline-flex items-center gap-2 px-4 py-2 border border-blue-200 rounded-lg bg-blue-50 hover:border-blue-300 hover:bg-blue-100 transition-colors"
          >
            <Icon path={mdiEye} size={1} className="text-blue-600" />
            <span className="font-medium text-blue-900 text-sm">Preview</span>
          </button>
          <button
            onClick={handlePublish}
            disabled={validationStatus.status === 'error' || isPublishing}
            className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
              validationStatus.status === 'error' || isPublishing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Icon path={isPublishing ? mdiClock : mdiPublish} size={1} />
            <span>{isPublishing ? 'Publishing...' : 'Publish Course'}</span>
          </button>
        </div>
      </div>

      {/* Validation Status */}
      <ValidationStatus
        validationStatus={
          validationStatus as {
            status: 'error' | 'warning' | 'valid';
            message: string;
          }
        }
      />

      {/* Course Review Section */}
      <CourseValidation
        collapsedSections={collapsedSections}
        toggleSection={toggleSection}
      />

      {/* Publishing Settings Section */}
      <PublishingSettings
        collapsedSections={collapsedSections}
        toggleSection={toggleSection}
        publishSettings={publishSettings}
        setPublishSettings={setPublishSettings}
      />

      {/* SEO & Metadata Section */}
      <SEOMetadata
        collapsedSections={collapsedSections}
        toggleSection={toggleSection}
        seoSettings={seoSettings}
        setSeoSettings={setSeoSettings}
      />

      {/* Course Preview & Testing Tools */}
      <CoursePreview
        collapsedSections={collapsedSections}
        toggleSection={toggleSection}
        generatePreview={generatePreview}
      />

      {/* Publishing Workflow */}
      <PublishingWorkflow
        validationStatus={
          validationStatus as {
            status: 'error' | 'warning' | 'valid';
            message: string;
          }
        }
        isPublishing={isPublishing}
        handlePublish={handlePublish}
      />
    </div>
  );
};

export default CourseStep4;
