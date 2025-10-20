import React, { useState, useCallback, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiPlus,
  mdiEye,
  mdiContentSave,
  mdiPublish,
  mdiRobot,
  mdiTable,
  mdiCheck,
  mdiAlertCircle,
  mdiLoading,
} from '@mdi/js';
import { supabase } from '../../../lib/supabase';
import { useUser } from '../../../contexts/UserContext';
import { useContentBuilder } from '../context/ContentBuilderContext';
import { useContentBuilderActions } from '../hooks';
import { useContentBuilderSettings } from '../../../hooks/useContentBuilderSettings';
import { useAutoSave } from '../../../hooks/useAutoSave';
import { fetchDraftById } from '../../../services/contentDraftsService';
import { logContentActivity } from '../../../services/contentActivityService';
import SDSAIAssistant from './SDSAIAssistant';
import { ContentFormFields } from './ContentFormFields';
import { PDFUploadHandler } from './PDFUploadHandler';
import { VoiceRecorder } from './VoiceRecorder';
import { TableBuilder } from './TableBuilder';
import { SmartTagManager } from './SmartTagManager';
import { LearningPathwayBuilder } from './LearningPathwayBuilder';

// Type definitions
interface PathwaySection {
  id: number;
  name: string;
  description: string;
  items: number[];
  order: number;
}

interface ContentType {
  id: string;
  label: string;
  description: string;
  icon: string;
}

interface SimpleContentEditorProps {
  contentType: ContentType;
  draftId?: string; // Optional draft ID to load
}

const SimpleContentEditor: React.FC<SimpleContentEditorProps> = ({
  contentType,
  draftId
}) => {
  const { state } = useContentBuilder();
  const { setActiveTab } = useContentBuilderActions();
  const { activeTab } = state;
  const { currentUser } = useUser();
  const { settings } = useContentBuilderSettings();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [chemicalName, setChemicalName] = useState('');
  const [casNumber, setCasNumber] = useState('');
  const [isRequired, setIsRequired] = useState(false);
  const [reviewAnnually, setReviewAnnually] = useState(false);

  // PDF upload state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);

  // Voice recognition state
  const [isRecording, setIsRecording] = useState(false);

  // Table builder state
  const [showTableBuilder, setShowTableBuilder] = useState(false);

  // Smart Tag State
  const [tags, setTags] = useState<string[]>([]);

  // Learning Pathway Builder State
  type PathwayItem = {
    id: string;
    type: string;
    displayTitle: string;
    title?: string;
    description?: string;
    chemical_name?: string;
    difficulty?: string;
    estimated_duration?: number;
    policy_type?: string;
    hazard_level?: string;
    pathwayId: number;
    order: number;
    sectionId?: number;
    [key: string]: string | number | boolean | undefined;
  };

  const [selectedPathwayItems, setSelectedPathwayItems] = useState<
    PathwayItem[]
  >([]);
  const [pathwaySections, setPathwaySections] = useState<PathwaySection[]>([]);

  // Create annual review challenge when procedure is marked for annual review
  const createAnnualReviewChallenge = useCallback(async () => {
    if (!currentUser?.facility_id || !title.trim()) {
      return;
    }

    try {
      // Create annual review challenge in the AI challenges system
      const challengeData = {
        title: `Annual Review Required: ${title}`,
        description: `This ${contentType.id === 'procedure' ? 'procedure' : 'policy'} "${title}" is marked for annual review and updates. Please review the content, verify accuracy, and update as needed to maintain compliance and best practices.`,
        category: 'compliance' as const,
        difficulty: 'medium' as const,
        estimatedDuration: 45, // 45 minutes for thorough review
        impact: 'high' as const,
        effort: 'medium' as const,
        points: 150, // Higher points for compliance tasks
        aiReasoning: `${contentType.id === 'procedure' ? 'Procedure' : 'Policy'} "${title}" requires annual review to ensure content accuracy, regulatory compliance, and alignment with current best practices.`,
        prerequisites: [
          'Access to content',
          'Understanding of current regulations',
        ],
        expectedOutcomes: [
          'Content reviewed and updated',
          'Regulatory compliance verified',
          'Best practices alignment confirmed',
          'Documentation updated with review date',
        ],
        complianceDeadline: new Date(
          Date.now() + 365 * 24 * 60 * 60 * 1000
        ).toISOString(), // 1 year from now
        facilityId: currentUser.facility_id,
        assignedTo: currentUser.id,
        status: 'pending',
        priority: 'high',
        tags: ['compliance', 'annual-review', 'regulatory'],
      };

      const { data: challenge, error } = await supabase
        .from('ai_challenge_completions')
        .insert(challengeData)
        .select()
        .single();

      if (error) {
        console.error('Error creating annual review challenge:', error);
        return;
      }

      console.log('Annual review challenge created:', challenge);
    } catch (error) {
      console.error('Error creating annual review challenge:', error);
    }
  }, [currentUser?.facility_id, currentUser?.id, title, contentType.id]);

  // Create annual review challenge when title is added and review annually is enabled
  useEffect(() => {
    if (reviewAnnually && title.trim()) {
      createAnnualReviewChallenge();
    }
  }, [reviewAnnually, title, createAnnualReviewChallenge]);

  // File handling functions
  const handleFileUpload = async (file: File) => {
    setPdfUploading(true);
    try {
      const facilityId = currentUser?.facility_id;
      if (!facilityId) {
        throw new Error(
          'No facility ID available. Please ensure you are assigned to a facility.'
        );
      }

      // Upload PDF to Supabase storage
      const fileName = `sds-sheets/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get the public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('documents').getPublicUrl(fileName);

      // Prepare insert data
      const insertData = {
        facility_id: facilityId,
        title: title || `SDS Sheet - ${chemicalName || 'Unknown Chemical'}`,
        description,
        content,
        chemical_name: chemicalName,
        cas_number: casNumber,
        pdf_file_path: publicUrl,
        pdf_file_size: file.size,
        pdf_uploaded_at: new Date().toISOString(),
        status: 'draft',
        priority: 'medium',
        risk_level: 'medium',
      };

      // Save to sds_sheets table
      const { error: dbError } = await supabase
        .from('sds_sheets')
        .insert(insertData)
        .select()
        .single();

      if (dbError) {
        throw new Error(`Database save failed: ${dbError.message}`);
      }

      alert('PDF uploaded and saved successfully!');
    } catch (error) {
      console.error('Upload failed:', error);
      alert(
        `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setPdfUploading(false);
    }
  };

  // Table builder functions
  const insertTableIntoContent = (tableText: string) => {
    const textarea = document.getElementById(
      'content-main-tab'
    ) as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const newContent =
        content.substring(0, start) + tableText + content.substring(start);
      setContent(newContent);
      setShowTableBuilder(false);

      // Focus back on textarea
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + tableText.length,
          start + tableText.length
        );
      }, 0);
    }
  };

  // Voice transcript update
  const handleTranscriptUpdate = (transcript: string) => {
    setContent((prev) => prev + (prev ? ' ' : '') + transcript);
  };

  // Pathway change handler
  const handlePathwayChange = (
    sections: PathwaySection[],
    items: PathwayItem[]
  ) => {
    setPathwaySections(sections);
    setSelectedPathwayItems(items);
  };

  // Save functions
  const handleSavePolicy = useCallback(async (_isAutoSave: boolean = false) => {
    if (!currentUser?.id || !currentUser?.facility_id) {
      throw new Error('User not authenticated');
    }

    const policyData = {
      title: title || 'Untitled Policy',
      description: description || '',
      content: content || '',
      tags: tags || [],
      author_id: currentUser.id,
      facility_id: currentUser.facility_id,
      content_type: 'policy',
      status: 'draft',
      published_at: null, // Keep as draft
      archived_at: null,
      department: 'General',
      domain: 'General',
      policy_number: `POL-${Date.now()}`,
      version: '1.0',
      estimated_read_time_minutes: Math.ceil((content?.length || 0) / 200), // Rough estimate
      points: 5
    };

    const { data, error } = await supabase
      .from('policies')
      .upsert(policyData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save policy: ${error.message}`);
    }

    // Log activity
    await logContentActivity({
      user_id: currentUser.id,
      user_name: currentUser.name || 'Unknown User',
      user_email: currentUser.email || '',
      facility_id: currentUser.facility_id,
      activity_type: 'draft_saved',
      content_type: 'policy',
      content_id: data.id,
      content_title: policyData.title,
      content_description: policyData.description,
      metadata: {
        auto_saved: false,
        version: policyData.version,
        department: policyData.department,
        tags: policyData.tags
      }
    });
  }, [currentUser, title, description, content, tags]);

  const handleSaveProcedure = useCallback(async () => {
    if (!currentUser?.id || !currentUser?.facility_id) {
      throw new Error('User not authenticated');
    }

    const procedureData = {
      title: title || 'Untitled Procedure',
      description: description || '',
      content: content || '',
      tags: tags || [],
      author_id: currentUser.id,
      facility_id: currentUser.facility_id,
      content_type: 'procedure',
      published_at: null, // Keep as draft
      archived_at: null,
      department: 'General',
      domain: 'General',
      difficulty_level: 'medium',
      safety_level: 'medium',
      estimated_duration_minutes: Math.ceil((content?.length || 0) / 100), // Rough estimate
      points: 5
    };

    const { data, error } = await supabase
      .from('procedures')
      .upsert(procedureData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save procedure: ${error.message}`);
    }

    // Log activity
    await logContentActivity({
      user_id: currentUser.id,
      user_name: currentUser.name || 'Unknown User',
      user_email: currentUser.email || '',
      facility_id: currentUser.facility_id,
      activity_type: 'draft_saved',
      content_type: 'procedure',
      content_id: data.id,
      content_title: procedureData.title,
      content_description: procedureData.description,
      metadata: {
        auto_saved: false,
        department: procedureData.department,
        tags: procedureData.tags
      }
    });
  }, [currentUser, title, description, content, tags]);

  const saveLearningPathway = useCallback(async () => {
    if (!currentUser?.id || !currentUser?.facility_id) {
      throw new Error('User not authenticated');
    }

    const pathwayData = {
      title: title || 'Untitled Learning Pathway',
      description: description || '',
      content: JSON.stringify({
        sections: pathwaySections,
        items: selectedPathwayItems
      }),
      author_id: currentUser.id,
      facility_id: currentUser.facility_id,
      content_type: 'learning_pathway',
      published_at: null, // Keep as draft
      archived_at: null,
      department: 'General',
      estimated_duration_minutes: selectedPathwayItems.reduce((total, item) => total + (item.estimated_duration || 0), 0),
      points: selectedPathwayItems.length * 2,
      is_active: true,
      is_repeat: false
    };

    const { data, error } = await supabase
      .from('courses')
      .upsert(pathwayData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save learning pathway: ${error.message}`);
    }

    // Log activity
    await logContentActivity({
      user_id: currentUser.id,
      user_name: currentUser.name || 'Unknown User',
      user_email: currentUser.email || '',
      facility_id: currentUser.facility_id,
      activity_type: 'draft_saved',
      content_type: 'learning_pathway',
      content_id: data.id,
      content_title: pathwayData.title,
      content_description: pathwayData.description,
      metadata: {
        auto_saved: false,
        department: pathwayData.department,
        sections_count: pathwaySections.length,
        items_count: selectedPathwayItems.length
      }
    });
  }, [currentUser, title, description, pathwaySections, selectedPathwayItems]);

  // Auto-save functionality with activity logging
  const handleAutoSave = useCallback(async () => {
    try {
      switch (contentType.id) {
        case 'policy':
          await handleSavePolicy();
          break;
        case 'procedure':
          await handleSaveProcedure();
          break;
        case 'pathway':
          await saveLearningPathway();
          break;
        default:
          await handleSaveProcedure();
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      throw error;
    }
  }, [contentType.id, handleSavePolicy, handleSaveProcedure, saveLearningPathway]);

  const getSaveFunction = useCallback(() => {
    return handleAutoSave;
  }, [handleAutoSave]);

  const autoSave = useAutoSave({
    enabled: settings.autoSave,
    debounceDelay: 2000, // 2 seconds
    saveInterval: 30000, // 30 seconds
    onSave: getSaveFunction(),
    onError: (error) => {
      console.error('Auto-save failed:', error);
    },
    onSuccess: () => {
      console.log('Auto-save successful');
    },
  });

  // Load draft data when draftId is provided
  useEffect(() => {
    if (draftId) {
      const loadDraft = async () => {
        try {
          const contentTypeKey = contentType.id === 'course' ? 'courses' : 
                                 contentType.id === 'policy' ? 'policies' :
                                 contentType.id === 'procedure' ? 'procedures' :
                                 contentType.id === 'pathway' ? 'learning_pathways' : 'courses';
          
          const draft = await fetchDraftById(draftId, contentTypeKey as 'courses' | 'policies' | 'procedures' | 'learning_pathways');
          if (draft) {
            setTitle(draft.title || '');
            setDescription(draft.description || '');
            setContent(draft.content || '');
            setTags(draft.tags || []);
            
            // Load pathway-specific data if it's a learning pathway
            if (contentType.id === 'pathway' && draft.content) {
              try {
                const pathwayData = JSON.parse(draft.content);
                if (pathwayData.sections) {
                  setPathwaySections(pathwayData.sections);
                }
                if (pathwayData.items) {
                  setSelectedPathwayItems(pathwayData.items);
                }
              } catch (e) {
                console.error('Failed to parse pathway data:', e);
              }
            }
          }
        } catch (error) {
          console.error('Failed to load draft:', error);
        }
      };
      
      loadDraft();
    }
  }, [draftId, contentType.id]);

  // Trigger auto-save when content changes
  useEffect(() => {
    if (title || description || content) {
      autoSave.triggerSave();
    }
  }, [title, description, content, autoSave]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['content', 'pathway', 'ai'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-[#4ECDC4] text-[#4ECDC4]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Content Form Fields */}
          <ContentFormFields
            contentType={contentType}
            title={title}
            description={description}
            content={content}
            chemicalName={chemicalName}
            casNumber={casNumber}
            isRequired={isRequired}
            reviewAnnually={reviewAnnually}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onContentChange={setContent}
            onChemicalNameChange={setChemicalName}
            onCasNumberChange={setCasNumber}
            onRequiredChange={setIsRequired}
            onReviewAnnuallyChange={setReviewAnnually}
          />

          {/* PDF Upload Handler */}
          {contentType.id === 'sds' && (
            <PDFUploadHandler
              pdfFile={pdfFile}
              onFileSelect={setPdfFile}
              onUpload={handleFileUpload}
              isUploading={pdfUploading}
              facilityId={currentUser?.facility_id}
            />
          )}

          {/* Voice Recorder */}
          <VoiceRecorder
            onTranscriptUpdate={handleTranscriptUpdate}
            isRecording={isRecording}
            onRecordingChange={setIsRecording}
          />

          {/* Table Builder */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Icon path={mdiTable} size={1.2} className="text-blue-600" />
              <h3 className="text-sm font-medium text-gray-900">
                Table Builder
              </h3>
            </div>
            <button
              onClick={() => setShowTableBuilder(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Icon path={mdiPlus} size={0.8} />
              Create Table
            </button>
          </div>

          {/* Smart Tag Manager */}
          <SmartTagManager
            tags={tags}
            onTagsChange={setTags}
            content={content}
            title={title}
          />
        </div>
      )}

      {/* Pathway Tab */}
      {activeTab === 'pathway' && (
        <LearningPathwayBuilder
          contentType={contentType}
          onPathwayChange={handlePathwayChange as (pathway: unknown) => void}
          pathwaySections={pathwaySections}
          selectedPathwayItems={selectedPathwayItems}
        />
      )}

      {/* AI Tab */}
      {activeTab === 'ai' && (
        <div className="space-y-4">
          {contentType.id === 'sms' ? (
            <SDSAIAssistant />
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Icon path={mdiRobot} size={1.2} className="text-blue-600" />
                <h3 className="text-sm font-medium text-blue-900">
                  AI Assistant
                </h3>
              </div>
              <p className="text-sm text-blue-700 mb-4">
                Get AI-powered suggestions to improve your content, identify
                gaps, and enhance learning outcomes.
              </p>
              <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <Icon path={mdiRobot} size={1} className="mr-2" />
                Get AI Suggestions
              </button>
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4]">
            <Icon path={mdiEye} size={1} className="mr-2" />
            Preview
          </button>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#4ECDC4] hover:bg-[#3db8b0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ECDC4]"
            onClick={async () => {
              if (settings.autoSave) {
                await autoSave.forceSave();
              } else {
                // Manual save when auto-save is disabled
                const saveFunction = getSaveFunction();
                await saveFunction();
              }
            }}
          >
            <Icon path={mdiContentSave} size={1} className="mr-2" />
            {contentType.id === 'pathway' ? 'Save Pathway' : 'Save Draft'}
          </button>
        </div>
        <button className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
          <Icon path={mdiPublish} size={1} className="mr-2" />
          {contentType.id === 'pathway'
            ? 'Publish Pathway'
            : 'Publish to Library'}
        </button>
      </div>

      {/* Auto-save Status Indicator */}
      {settings.autoSave && (
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
          <div className="flex items-center space-x-2">
            {autoSave.status === 'saving' && (
              <>
                <Icon path={mdiLoading} size={0.8} className="animate-spin text-blue-500" />
                <span className="text-sm text-blue-600">Saving...</span>
              </>
            )}
            {autoSave.status === 'saved' && (
              <>
                <Icon path={mdiCheck} size={0.8} className="text-green-500" />
                <span className="text-sm text-green-600">
                  Saved {autoSave.lastSaved ? `at ${autoSave.lastSaved.toLocaleTimeString()}` : ''}
                </span>
              </>
            )}
            {autoSave.status === 'error' && (
              <>
                <Icon path={mdiAlertCircle} size={0.8} className="text-red-500" />
                <span className="text-sm text-red-600">
                  Save failed: {autoSave.error}
                </span>
                <button
                  onClick={autoSave.clearError}
                  className="text-xs text-red-500 hover:text-red-700 underline"
                >
                  Dismiss
                </button>
              </>
            )}
            {autoSave.status === 'idle' && autoSave.isDirty && (
              <>
                <Icon path={mdiContentSave} size={0.8} className="text-gray-400" />
                <span className="text-sm text-gray-500">Unsaved changes</span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-400">
            Auto-save {settings.autoSave ? 'enabled' : 'disabled'}
          </div>
        </div>
      )}

      {/* Table Builder Modal */}
      {showTableBuilder && (
        <TableBuilder
          onInsertTable={insertTableIntoContent}
          onClose={() => setShowTableBuilder(false)}
        />
      )}
    </div>
  );
};

export default SimpleContentEditor;
