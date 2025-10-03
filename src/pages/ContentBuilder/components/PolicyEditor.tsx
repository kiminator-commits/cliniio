import React, { useCallback } from 'react';
import CommonEditorFields from './CommonEditorFields';
import ContentToolbar from './ContentToolbar';
import TextFormatting from './TextFormatting';
import { TableBuilder } from './TableBuilder';
import MediaUploader from './MediaUploader';
import {
  FieldErrorDisplay,
  FormErrorsSummary,
  ValidationStatus,
} from './ValidationErrorDisplay';
import {
  useTextFormatting,
  useTableBuilder,
  useMediaUpload,
  usePolicyEditor,
  usePolicyValidation,
} from '../hooks';
import { useContentBuilder } from '../context/ContentBuilderContext';

interface PolicyEditorProps {
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

const PolicyEditor: React.FC<PolicyEditorProps> = ({
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
  // Use custom hooks for state management
  const {
    policyVersion,
    requiresSignature,
    signatureDeadline,
    acknowledgmentStatement,
    policyType,
    updateField,
  } = usePolicyEditor();

  const {
    fontFamily,
    fontSize,
    textColor,
    setFontFamily,
    setFontSize,
    setTextColor,
    resetFormatting,
    formatBold,
    formatItalic,
    formatHeading2,
    formatHeading3,
    formatBulletList,
    formatNumberedList,
    addNote,
    addWarning,
    addCheck,
    insertLink,
  } = useTextFormatting();

  const { showTableBuilder, setShowTableBuilder, insertTableIntoContent } =
    useTableBuilder();

  const {
    pdfFile,
    pdfUploading,
    isRecording,
    setPdfFile,
    handlePdfUpload,
    handleVoiceToggle,
  } = useMediaUpload();

  // Validation hook
  const {
    isValid,
    errors,
    touched,
    validateField,
    validatePolicy,
    markFieldAsTouched,
    markAllFieldsAsTouched,
    getFieldError,
  } = usePolicyValidation();

  // Get isDirty from context
  const { state } = useContentBuilder();
  const { isDirty } = state;

  // Wrapper functions to pass content and onContentChange to hooks
  const handleBold = useCallback(
    () => formatBold(content, onContentChange),
    [formatBold, content, onContentChange]
  );
  const handleItalic = useCallback(
    () => formatItalic(content, onContentChange),
    [formatItalic, content, onContentChange]
  );
  const handleHeading2 = useCallback(
    () => formatHeading2(content, onContentChange),
    [formatHeading2, content, onContentChange]
  );
  const handleHeading3 = useCallback(
    () => formatHeading3(content, onContentChange),
    [formatHeading3, content, onContentChange]
  );
  const handleBulletList = useCallback(
    () => formatBulletList(content, onContentChange),
    [formatBulletList, content, onContentChange]
  );
  const handleNumberedList = useCallback(
    () => formatNumberedList(content, onContentChange),
    [formatNumberedList, content, onContentChange]
  );
  const handleAddNote = useCallback(
    () => addNote(content, onContentChange),
    [addNote, content, onContentChange]
  );
  const handleAddWarning = useCallback(
    () => addWarning(content, onContentChange),
    [addWarning, content, onContentChange]
  );
  const handleAddCheck = useCallback(
    () => addCheck(content, onContentChange),
    [addCheck, content, onContentChange]
  );
  const handleInsertLink = useCallback(
    () => insertLink(content, onContentChange),
    [insertLink, content, onContentChange]
  );
  const handleInsertTable = useCallback(
    () => insertTableIntoContent(content, onContentChange),
    [insertTableIntoContent, content, onContentChange]
  );

  return (
    <div className="space-y-6">
      {/* Validation Summary */}
      <FormErrorsSummary errors={errors} />

      {/* Validation Status */}
      <ValidationStatus isValid={isValid} isDirty={isDirty} />

      {/* Policy-specific fields */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-4">
          Policy Configuration
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="policy-version"
              className="block text-sm font-medium text-blue-700 mb-2"
            >
              Policy Version
            </label>
            <input
              id="policy-version"
              type="text"
              value={policyVersion}
              onChange={(e) => {
                updateField('policyVersion', e.target.value);
                const error = validateField('policyVersion', e.target.value);
                if (error) {
                  markFieldAsTouched('policyVersion');
                }
              }}
              onBlur={() => markFieldAsTouched('policyVersion')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                touched.has('policyVersion') && getFieldError('policyVersion')
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-blue-300 focus:ring-blue-500'
              }`}
              placeholder="e.g., 1.0"
            />
            <FieldErrorDisplay
              field="policyVersion"
              errors={errors}
              touched={touched}
            />
          </div>
          <div>
            <label
              htmlFor="policy-type"
              className="block text-sm font-medium text-blue-700 mb-2"
            >
              Policy Type
            </label>
            <select
              id="policy-type"
              value={policyType}
              onChange={(e) => {
                updateField('policyType', e.target.value);
                const error = validateField('policyType', e.target.value);
                if (error) {
                  markFieldAsTouched('policyType');
                }
              }}
              onBlur={() => markFieldAsTouched('policyType')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                touched.has('policyType') && getFieldError('policyType')
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-blue-300 focus:ring-blue-500'
              }`}
            >
              <option value="general">General Policy</option>
              <option value="safety">Safety Policy</option>
              <option value="compliance">Compliance Policy</option>
              <option value="operational">Operational Policy</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="requires-signature"
              className="block text-sm font-medium text-blue-700 mb-2"
            >
              Signature Required
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="requires-signature"
                checked={requiresSignature}
                onChange={(e) =>
                  updateField('requiresSignature', e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="requires-signature"
                className="text-sm text-blue-700"
              >
                Require employee acknowledgment
              </label>
            </div>
          </div>
          {requiresSignature && (
            <div>
              <label
                htmlFor="days-to-sign"
                className="block text-sm font-medium text-blue-700 mb-2"
              >
                Days to Sign
              </label>
              <input
                id="days-to-sign"
                type="number"
                value={signatureDeadline}
                onChange={(e) => {
                  updateField('signatureDeadline', Number(e.target.value));
                  const error = validateField(
                    'signatureDeadline',
                    Number(e.target.value)
                  );
                  if (error) {
                    markFieldAsTouched('signatureDeadline');
                  }
                }}
                onBlur={() => markFieldAsTouched('signatureDeadline')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  touched.has('signatureDeadline') &&
                  getFieldError('signatureDeadline')
                    ? 'border-red-300 focus:ring-red-500'
                    : 'border-blue-300 focus:ring-blue-500'
                }`}
                min="1"
                max="365"
              />
              <FieldErrorDisplay
                field="signatureDeadline"
                errors={errors}
                touched={touched}
              />
            </div>
          )}
        </div>
        {requiresSignature && (
          <div className="mt-4">
            <label
              htmlFor="acknowledgment-statement"
              className="block text-sm font-medium text-blue-700 mb-2"
            >
              Acknowledgment Statement
            </label>
            <textarea
              id="acknowledgment-statement"
              value={acknowledgmentStatement}
              onChange={(e) => {
                updateField('acknowledgmentStatement', e.target.value);
                const error = validateField(
                  'acknowledgmentStatement',
                  e.target.value
                );
                if (error) {
                  markFieldAsTouched('acknowledgmentStatement');
                }
              }}
              onBlur={() => markFieldAsTouched('acknowledgmentStatement')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                touched.has('acknowledgmentStatement') &&
                getFieldError('acknowledgmentStatement')
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-blue-300 focus:ring-blue-500'
              }`}
              rows={2}
              placeholder="Enter the statement employees must acknowledge..."
            />
            <FieldErrorDisplay
              field="acknowledgmentStatement"
              errors={errors}
              touched={touched}
            />
          </div>
        )}
      </div>

      {/* Common editor fields */}
      <CommonEditorFields
        title={title}
        description={description}
        content={content}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onContentChange={onContentChange}
      />

      {/* Text formatting toolbar */}
      <TextFormatting
        fontFamily={fontFamily}
        fontSize={fontSize}
        textColor={textColor}
        onFontFamilyChange={setFontFamily}
        onFontSizeChange={setFontSize}
        onTextColorChange={setTextColor}
        onReset={resetFormatting}
        onBold={handleBold}
        onItalic={handleItalic}
        onHeading2={handleHeading2}
        onHeading3={handleHeading3}
        onBulletList={handleBulletList}
        onNumberedList={handleNumberedList}
        onAddNote={handleAddNote}
        onAddWarning={handleAddWarning}
        onAddCheck={handleAddCheck}
        onInsertLink={handleInsertLink}
        onAISuggestions={() => {}}
        onShowTableBuilder={() => setShowTableBuilder(true)}
      />

      {/* Media uploader */}
      <MediaUploader
        pdfFile={pdfFile}
        isRecording={isRecording}
        onPdfFileChange={setPdfFile}
        onPdfUpload={handlePdfUpload}
        onVoiceToggle={handleVoiceToggle}
        pdfUploading={pdfUploading}
        showVoiceRecording={true}
        showPdfUpload={true}
      />

      {/* Table builder modal */}
      {showTableBuilder && (
        <TableBuilder
          onClose={() => setShowTableBuilder(false)}
          onInsertTable={handleInsertTable}
        />
      )}

      {/* Content toolbar */}
      <ContentToolbar
        onSave={useCallback(() => {
          // Validate entire form before saving
          const formData = {
            title,
            description,
            content,
            policyVersion,
            policyType,
            requiresSignature,
            signatureDeadline: requiresSignature
              ? signatureDeadline
              : undefined,
            acknowledgmentStatement: requiresSignature
              ? acknowledgmentStatement
              : undefined,
          };

          const validationErrors = validatePolicy(formData);
          if (validationErrors.length > 0) {
            markAllFieldsAsTouched();
            return;
          }

          onSave();
        }, [
          title,
          description,
          content,
          policyVersion,
          policyType,
          requiresSignature,
          signatureDeadline,
          acknowledgmentStatement,
          validatePolicy,
          markAllFieldsAsTouched,
          onSave,
        ])}
        onPublish={useCallback(() => {
          // Validate entire form before publishing
          const formData = {
            title,
            description,
            content,
            policyVersion,
            policyType,
            requiresSignature,
            signatureDeadline: requiresSignature
              ? signatureDeadline
              : undefined,
            acknowledgmentStatement: requiresSignature
              ? acknowledgmentStatement
              : undefined,
          };

          const validationErrors = validatePolicy(formData);
          if (validationErrors.length > 0) {
            markAllFieldsAsTouched();
            return;
          }

          onPublish();
        }, [
          title,
          description,
          content,
          policyVersion,
          policyType,
          requiresSignature,
          signatureDeadline,
          acknowledgmentStatement,
          validatePolicy,
          markAllFieldsAsTouched,
          onPublish,
        ])}
        onAIAssistant={onAIAssistant}
        canPublish={isValid && isDirty}
      />
    </div>
  );
};

export default PolicyEditor;
