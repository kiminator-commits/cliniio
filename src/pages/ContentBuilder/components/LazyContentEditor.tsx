import React, { Suspense, lazy, memo } from 'react';

// Lazy load content type editors
const PolicyEditor = lazy(() => import('./PolicyEditor'));
const CourseBuilder = lazy(() => import('./CourseBuilder'));

// Loading fallback component
const EditorLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4ECDC4]"></div>
    <span className="ml-3 text-gray-600">Loading editor...</span>
  </div>
);

interface LazyContentEditorProps {
  contentType: { id: string; label: string; description: string };
  title: string;
  description: string;
  content: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onPublish: () => void;
  onAIAssistant: () => void;
}

const LazyContentEditor: React.FC<LazyContentEditorProps> = memo(
  ({
    contentType,
    title,
    description,
    content,
    onTitleChange,
    onDescriptionChange,
    onContentChange,
    onSave,
    onPublish,
    onAIAssistant,
  }) => {
    // Render the appropriate editor based on content type
    const renderEditor = () => {
      const commonProps = {
        title,
        description,
        content,
        onTitleChange,
        onDescriptionChange,
        onContentChange,
        onSave,
        onPublish,
        onAIAssistant,
        contentType,
      };

      switch (contentType.id) {
        case 'policy':
          return <PolicyEditor {...commonProps} />;
        case 'course':
          return <CourseBuilder />;
        default:
          return (
            <div className="text-center p-8 text-gray-500">
              <p>
                Content type "{contentType.label}" editor not yet implemented
              </p>
            </div>
          );
      }
    };

    return (
      <Suspense fallback={<EditorLoadingFallback />}>{renderEditor()}</Suspense>
    );
  }
);

LazyContentEditor.displayName = 'LazyContentEditor';

export default LazyContentEditor;
