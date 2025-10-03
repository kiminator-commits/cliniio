import React, { useState, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiContentSave,
  mdiPlus,
  mdiTrashCan,
  mdiImage,
  mdiVideo,
  mdiFileDocument,
  mdiLink,
} from '@mdi/js';
import { CourseLesson } from '../../types/contentTypes';
import RichTextEditor from './RichTextEditor';

interface LessonEditModalProps {
  lesson: CourseLesson;
  moduleId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    moduleId: string,
    lessonId: string,
    updates: Partial<CourseLesson>
  ) => void;
}

interface ContentSection {
  id: string;
  type: 'text' | 'image' | 'video' | 'file' | 'link' | 'quiz';
  content: string;
  title?: string;
  description?: string;
  order: number;
}

const LessonEditModal: React.FC<LessonEditModalProps> = ({
  lesson,
  moduleId,
  isOpen,
  onClose,
  onSave,
}) => {
  const [lessonData, setLessonData] = useState<CourseLesson>(lesson);
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [newSectionType, setNewSectionType] = useState<
    'text' | 'image' | 'video' | 'file' | 'link' | 'quiz'
  >('text');

  useEffect(() => {
    if (lesson) {
      setLessonData(lesson);
      // Initialize sections from lesson content if it exists
      if (lesson.content && typeof lesson.content === 'object') {
        setSections(lesson.content as ContentSection[]);
      } else {
        // Create default text section if no content
        setSections([
          {
            id: `section-${Date.now()}`,
            type: 'text',
            content: lesson.content || '',
            title: 'Introduction',
            order: 0,
          },
        ]);
      }
    }
  }, [lesson]);

  const addSection = () => {
    const newSection: ContentSection = {
      id: `section-${Date.now()}`,
      type: newSectionType,
      content: '',
      title: `New ${newSectionType.charAt(0).toUpperCase() + newSectionType.slice(1)} Section`,
      order: sections.length,
    };
    setSections([...sections, newSection]);
    setActiveSection(newSection.id);
    setShowSectionForm(false);
  };

  const updateSection = (
    sectionId: string,
    updates: Partial<ContentSection>
  ) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    );
  };

  const removeSection = (sectionId: string) => {
    setSections(sections.filter((section) => section.id !== sectionId));
    if (activeSection === sectionId) {
      setActiveSection(sections.length > 1 ? sections[0].id : null);
    }
  };

  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex((s) => s.id === sectionId);
    if (currentIndex === -1) return;

    const newSections = [...sections];
    if (direction === 'up' && currentIndex > 0) {
      [newSections[currentIndex], newSections[currentIndex - 1]] = [
        newSections[currentIndex - 1],
        newSections[currentIndex],
      ];
    } else if (direction === 'down' && currentIndex < sections.length - 1) {
      [newSections[currentIndex], newSections[currentIndex + 1]] = [
        newSections[currentIndex + 1],
        newSections[currentIndex],
      ];
    }

    // Update order numbers
    newSections.forEach((section, index) => {
      section.order = index;
    });
    setSections(newSections);
  };

  const handleSave = () => {
    // Save the lesson with structured content
    onSave(moduleId, lesson.id, {
      ...lessonData,
      content: JSON.stringify(sections),
    });
    onClose();
  };

  const renderSectionContent = (section: ContentSection) => {
    switch (section.type) {
      case 'text':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={section.title || ''}
              onChange={(e) =>
                updateSection(section.id, { title: e.target.value })
              }
              placeholder="Section title..."
              className="w-full text-lg font-medium border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <RichTextEditor
              value={section.content}
              onChange={(content) => updateSection(section.id, { content })}
              onSave={async (content) => {
                // Autosave the section content
                updateSection(section.id, { content });
              }}
              placeholder="Write your lesson content here..."
              className="w-full min-h-[200px] border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              showSaveStatus={true}
            />
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={section.title || ''}
              onChange={(e) =>
                updateSection(section.id, { title: e.target.value })
              }
              placeholder="Image title..."
              className="w-full text-lg font-medium border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              value={section.content}
              onChange={(e) =>
                updateSection(section.id, { content: e.target.value })
              }
              placeholder="Image URL..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={section.description || ''}
              onChange={(e) =>
                updateSection(section.id, { description: e.target.value })
              }
              placeholder="Image description or caption..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>
        );

      case 'video':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={section.title || ''}
              onChange={(e) =>
                updateSection(section.id, { title: e.target.value })
              }
              placeholder="Video title..."
              className="w-full text-lg font-medium border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              value={section.content}
              onChange={(e) =>
                updateSection(section.id, { content: e.target.value })
              }
              placeholder="Video URL (YouTube, Vimeo, etc.)..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={section.description || ''}
              onChange={(e) =>
                updateSection(section.id, { description: e.target.value })
              }
              placeholder="Video description or transcript..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>
        );

      case 'file':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={section.title || ''}
              onChange={(e) =>
                updateSection(section.id, { title: e.target.value })
              }
              placeholder="File title..."
              className="w-full text-lg font-medium border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              value={section.content}
              onChange={(e) =>
                updateSection(section.id, { content: e.target.value })
              }
              placeholder="File URL or upload link..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={section.description || ''}
              onChange={(e) =>
                updateSection(section.id, { description: e.target.value })
              }
              placeholder="File description..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>
        );

      case 'link':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={section.title || ''}
              onChange={(e) =>
                updateSection(section.id, { title: e.target.value })
              }
              placeholder="Link title..."
              className="w-full text-lg font-medium border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="url"
              value={section.content}
              onChange={(e) =>
                updateSection(section.id, { content: e.target.value })
              }
              placeholder="URL..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={section.description || ''}
              onChange={(e) =>
                updateSection(section.id, { description: e.target.value })
              }
              placeholder="Link description..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'text':
        return mdiFileDocument;
      case 'image':
        return mdiImage;
      case 'video':
        return mdiVideo;
      case 'file':
        return mdiFileDocument;
      case 'link':
        return mdiLink;
      default:
        return mdiFileDocument;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Lesson</h2>
            <p className="text-gray-600">
              Create rich, engaging content for your students
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <Icon path={mdiClose} size={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-120px)]">
          {/* Left Sidebar - Sections */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Content Sections
              </h3>
              <button
                onClick={() => setShowSectionForm(!showSectionForm)}
                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Icon path={mdiPlus} size={1} />
              </button>
            </div>

            {/* Add Section Form */}
            {showSectionForm && (
              <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                <select
                  value={newSectionType}
                  onChange={(e) =>
                    setNewSectionType(e.target.value as ContentSection['type'])
                  }
                  className="w-full mb-2 p-2 border border-gray-300 rounded-md"
                >
                  <option value="text">Text Content</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="file">File/Download</option>
                  <option value="link">External Link</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={addSection}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowSectionForm(false)}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Sections List */}
            <div className="space-y-2">
              {sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 border border-blue-300'
                      : 'bg-white border border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveSection(section.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveSection(section.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon
                      path={getSectionIcon(section.type)}
                      size={0.8}
                      className="text-gray-500"
                    />
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {section.title ||
                        `${section.type.charAt(0).toUpperCase() + section.type.slice(1)} ${index + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 capitalize">
                      {section.type}
                    </span>
                    <div className="flex gap-1">
                      {index > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSection(section.id, 'up');
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          ↑
                        </button>
                      )}
                      {index < sections.length - 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveSection(section.id, 'down');
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          ↓
                        </button>
                      )}
                      {sections.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSection(section.id);
                          }}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Icon path={mdiTrashCan} size={0.6} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeSection ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Icon
                    path={getSectionIcon(
                      sections.find((s) => s.id === activeSection)?.type ||
                        'text'
                    )}
                    size={1.2}
                    className="text-gray-500"
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {(sections
                      .find((s) => s.id === activeSection)
                      ?.type?.charAt(0) || '') +
                      (sections
                        .find((s) => s.id === activeSection)
                        ?.type?.slice(1) || '')}{' '}
                    Section
                  </h3>
                </div>
                {renderSectionContent(
                  sections.find((s) => s.id === activeSection)!
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Icon
                  path={mdiFileDocument}
                  size={3}
                  className="mx-auto text-gray-300 mb-4"
                />
                <p>Select a section from the sidebar to edit content</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            {sections.length} content section{sections.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Icon path={mdiContentSave} size={0.8} />
              Save Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonEditModal;
