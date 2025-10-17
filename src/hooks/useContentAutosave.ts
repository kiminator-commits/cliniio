import { useEffect, useRef, useState, useCallback } from 'react';

interface UseContentAutosaveOptions {
  delay?: number;
  enabled?: boolean;
  onSave?: (content: string) => Promise<void>;
  onSaveSuccess?: () => void;
  onSaveError?: (error: Error) => void;
}

interface UseContentAutosaveReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  error: Error | null;
  triggerSave: () => Promise<void>;
  resetSaveStatus: () => void;
}

export function useContentAutosave(
  content: string,
  options: UseContentAutosaveOptions = {}
): UseContentAutosaveReturn {
  const {
    delay = 2000, // 2 second delay
    enabled = true,
    onSave,
    onSaveSuccess,
    onSaveError,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [error, setError] = useState<Error | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastContentRef = useRef<string>(content);

  const triggerSave = useCallback(async () => {
    if (!enabled || !onSave || content === lastContentRef.current) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveStatus('saving');
      setError(null);

      await onSave(content);

      lastContentRef.current = content;
      setLastSaved(new Date());
      setSaveStatus('saved');
      setIsSaving(false);

      onSaveSuccess?.();

      // Reset save status after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Save failed');
      setError(error);
      setSaveStatus('error');
      setIsSaving(false);

      onSaveError?.(error);

      // Reset error status after 5 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setError(null);
      }, 5000);
    }
  }, [content, enabled, onSave, onSaveSuccess, onSaveError]);

  const resetSaveStatus = useCallback(() => {
    setSaveStatus('idle');
    setError(null);
  }, []);

  // Autosave effect
  useEffect(() => {
    if (!enabled || !onSave) return undefined;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      triggerSave();
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [content, delay, enabled, onSave, triggerSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    saveStatus,
    error,
    triggerSave,
    resetSaveStatus,
  };
}
