import React, { useState } from 'react';
import Icon from '@mdi/react';
import {
  mdiBookOpen,
  mdiPlus,
  mdiTrashCan,
  mdiFormatText,
  mdiImage,
  mdiVideo,
  mdiFileDocument,
  mdiLink,
} from '@mdi/js';
import RichTextEditor from './RichTextEditor';
import MediaUploadZone from './MediaUploadZone';

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

interface LessonEditorProps {
  lessonData: LessonData;
  onUpdateLesson: (updates: Partial<LessonData>) => void;
  onClose: () => void;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
  lessonData,
  onUpdateLesson,
  onClose,
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(
    lessonData.sections.length > 0 ? lessonData.sections[0].id : null
  );
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [newSectionType, setNewSectionType] =
    useState<ContentSection['type']>('text');
  const [showMediaUpload, setShowMediaUpload] = useState(false);

  const addSection = () => {
    const newSection: ContentSection = {
      id: `section-${Date.now()}`,
      type: newSectionType,
      content: '',
      order: lessonData.sections.length,
    };

    const updatedSections = [...lessonData.sections, newSection];
    onUpdateLesson({ sections: updatedSections });
    setActiveSection(newSection.id);
    setShowSectionForm(false);
  };

  const updateSection = (
    sectionId: string,
    updates: Partial<ContentSection>
  ) => {
    const updatedSections = lessonData.sections.map((section) =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    onUpdateLesson({ sections: updatedSections });
  };

  const removeSection = (sectionId: string) => {
    const updatedSections = lessonData.sections
      .filter((section) => section.id !== sectionId)
      .map((section, index) => ({ ...section, order: index }));

    onUpdateLesson({ sections: updatedSections });

    // Handle activeSection state when removing sections
    if (activeSection === sectionId) {
      if (updatedSections.length === 0) {
        setActiveSection(null);
      } else if (updatedSections.length === 1) {
        setActiveSection(updatedSections[0].id);
      } else {
        const currentIndex = lessonData.sections.findIndex(
          (s) => s.id === sectionId
        );
        const nextIndex =
          currentIndex >= updatedSections.length
            ? updatedSections.length - 1
            : currentIndex;
        setActiveSection(updatedSections[nextIndex].id);
      }
    }
  };

  const getSectionIcon = (type: ContentSection['type']) => {
    switch (type) {
      case 'text':
        return mdiFormatText;
      case 'image':
        return mdiImage;
      case 'video':
        return mdiVideo;
      case 'file':
        return mdiFileDocument;
      case 'link':
        return mdiLink;
      default:
        return mdiFormatText;
    }
  };

  const getSectionColor = (type: ContentSection['type']) => {
    switch (type) {
      case 'text':
        return 'bg-blue-100 text-blue-600';
      case 'image':
        return 'bg-green-100 text-green-600';
      case 'video':
        return 'bg-purple-100 text-purple-600';
      case 'file':
        return 'bg-orange-100 text-orange-600';
      case 'link':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const renderSectionContent = (section: ContentSection) => {
    switch (section.type) {
      case 'text':
        return (
          <RichTextEditor
            value={section.content}
            onChange={(content) => updateSection(section.id, { content })}
            placeholder="Start writing your lesson content..."
          />
        );
      case 'image':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <input
                type="text"
                value={section.metadata?.url || ''}
                onChange={(e) =>
                  updateSection(section.id, {
                    metadata: { ...section.metadata, url: e.target.value },
                  })
                }
                placeholder="Image URL"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={section.metadata?.alt || ''}
                onChange={(e) =>
                  updateSection(section.id, {
                    metadata: { ...section.metadata, alt: e.target.value },
                  })
                }
                placeholder="Alt text for accessibility"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={section.metadata?.caption || ''}
                onChange={(e) =>
                  updateSection(section.id, {
                    metadata: { ...section.metadata, caption: e.target.value },
                  })
                }
                placeholder="Image caption (optional)"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="border-t pt-4">
              <button
                onClick={() => setShowMediaUpload(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Icon path={mdiPlus} size={0.8} />
                Upload Image
              </button>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <input
                type="text"
                value={section.metadata?.url || ''}
                onChange={(e) =>
                  updateSection(section.id, {
                    metadata: { ...section.metadata, url: e.target.value },
                  })
                }
                placeholder="Video URL"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="number"
                value={section.metadata?.duration || ''}
                onChange={(e) =>
                  updateSection(section.id, {
                    metadata: {
                      ...section.metadata,
                      duration: parseInt(e.target.value) || 0,
                    },
                  })
                }
                placeholder="Duration in seconds"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="border-t pt-4">
              <button
                onClick={() => setShowMediaUpload(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              >
                <Icon path={mdiPlus} size={0.8} />
                Upload Video
              </button>
            </div>
          </div>
        );
      case 'file':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <input
                type="text"
                value={section.metadata?.url || ''}
                onChange={(e) =>
                  updateSection(section.id, {
                    metadata: { ...section.metadata, url: e.target.value },
                  })
                }
                placeholder="File URL"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                value={section.metadata?.size || ''}
                onChange={(e) =>
                  updateSection(section.id, {
                    metadata: { ...section.metadata, size: e.target.value },
                  })
                }
                placeholder="File size (e.g., 2.5 MB)"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="border-t pt-4">
              <button
                onClick={() => setShowMediaUpload(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
              >
                <Icon path={mdiPlus} size={0.8} />
                Upload File
              </button>
            </div>
          </div>
        );
      case 'link':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={section.metadata?.url || ''}
              onChange={(e) =>
                updateSection(section.id, {
                  metadata: { ...section.metadata, url: e.target.value },
                })
              }
              placeholder="Link URL"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              value={section.content}
              onChange={(e) =>
                updateSection(section.id, { content: e.target.value })
              }
              placeholder="Link text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon path={mdiBookOpen} size={1.5} className="text-blue-600" />
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {lessonData.title}
              </h1>
              <p className="text-sm text-gray-600">Editing lesson content</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon path={mdiPlus} size={1.5} className="rotate-45" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Section Management */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Content Sections
            </h3>
            <button
              onClick={() => setShowSectionForm(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Icon path={mdiPlus} size={0.8} />
              Add Section
            </button>
          </div>

          {showSectionForm && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Add New Section
              </h4>
              <div className="space-y-3">
                <select
                  value={newSectionType}
                  onChange={(e) =>
                    setNewSectionType(e.target.value as ContentSection['type'])
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="file">File</option>
                  <option value="link">Link</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={addSection}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowSectionForm(false)}
                    className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {lessonData.sections.map((section, index) => (
              <div
                key={section.id}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  activeSection === section.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setActiveSection(section.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveSection(section.id);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Select ${section.type} section ${index + 1}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-md ${getSectionColor(section.type)}`}
                  >
                    <Icon path={getSectionIcon(section.type)} size={0.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {section.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        #{index + 1}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {section.content || 'No content'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSection(section.id);
                    }}
                    className="p-1 text-red-400 hover:text-red-600"
                    title="Delete section"
                  >
                    <Icon path={mdiTrashCan} size={0.8} />
                  </button>
                </div>
              </div>
            ))}

            {lessonData.sections.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Icon
                  path={mdiBookOpen}
                  size={2}
                  className="mx-auto text-gray-300 mb-2"
                />
                <p className="text-sm">No content sections yet</p>
                <p className="text-xs">Click "Add Section" to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Canvas */}
        <div className="flex-1 flex flex-col">
          {activeSection &&
          lessonData.sections.find((s) => s.id === activeSection) ? (
            <div className="flex-1 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className={`p-2 rounded-md ${getSectionColor(lessonData.sections.find((s) => s.id === activeSection)?.type || 'text')}`}
                    >
                      <Icon
                        path={getSectionIcon(
                          lessonData.sections.find(
                            (s) => s.id === activeSection
                          )?.type || 'text'
                        )}
                        size={1}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 capitalize">
                        {
                          lessonData.sections.find(
                            (s) => s.id === activeSection
                          )?.type
                        }{' '}
                        Section
                      </h3>
                      <p className="text-sm text-gray-500">
                        Edit your{' '}
                        {
                          lessonData.sections.find(
                            (s) => s.id === activeSection
                          )?.type
                        }{' '}
                        content
                      </p>
                    </div>
                  </div>

                  {renderSectionContent(
                    lessonData.sections.find((s) => s.id === activeSection)!
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Icon
                  path={mdiBookOpen}
                  size={3}
                  className="mx-auto text-gray-300 mb-4"
                />
                <p>Select a section to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Upload Modal */}
      {showMediaUpload && (
        <MediaUploadZone
          onFileUpload={(files) => {
            if (files.length > 0 && activeSection) {
              const file = files[0];
              updateSection(activeSection, {
                metadata: { url: file.url },
              });
            }
            setShowMediaUpload(false);
          }}
        />
      )}
    </div>
  );
};
