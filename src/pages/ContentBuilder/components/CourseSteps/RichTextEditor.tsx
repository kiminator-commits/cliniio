import React, { useRef, useCallback } from 'react';
import { useContentAutosave } from '../../../../hooks/useContentAutosave';
import SaveStatusIndicator from './SaveStatusIndicator';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave?: (content: string) => Promise<void>;
  placeholder?: string;
  className?: string;
  showSaveStatus?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onSave,
  placeholder = 'Enter your content here...',
  className = '',
  showSaveStatus = true,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // Autosave functionality
  const { lastSaved, saveStatus } = useContentAutosave(value, {
    delay: 2000, // 2 second delay
    enabled: !!onSave,
    onSave: onSave || (async () => {}),
    onSaveError: (err) => {
      console.error('Autosave failed:', err);
    },
  });

  return (
    <div className={`${className}`}>
      {/* Save Status Indicator */}
      {showSaveStatus && onSave && (
        <div className="mb-3 flex justify-end">
          <SaveStatusIndicator status={saveStatus} lastSaved={lastSaved} />
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={handleInput}
        className="h-full min-h-[300px] p-4 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:border-transparent text-gray-900"
        data-placeholder={placeholder}
        style={{
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: '16px',
          lineHeight: '1.6',
        }}
      />
    </div>
  );
};

export default RichTextEditor;
