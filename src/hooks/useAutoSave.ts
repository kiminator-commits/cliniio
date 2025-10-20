import { useCallback, useEffect, useRef, useState } from 'react';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveConfig {
  enabled: boolean;
  debounceDelay?: number; // milliseconds
  saveInterval?: number; // milliseconds for periodic saves
  onSave: () => Promise<void>;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

interface AutoSaveState {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  error: string | null;
  isDirty: boolean;
}

export const useAutoSave = (config: AutoSaveConfig) => {
  const [state, setState] = useState<AutoSaveState>({
    status: 'idle',
    lastSaved: null,
    error: null,
    isDirty: false,
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  const {
    enabled,
    debounceDelay = 2000, // 2 seconds default
    saveInterval = 30000, // 30 seconds default
    onSave,
    onError,
    onSuccess,
  } = config;

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const performSave = useCallback(async () => {
    if (isSavingRef.current || !enabled) return;

    isSavingRef.current = true;
    setState(prev => ({ ...prev, status: 'saving', error: null }));

    try {
      await onSave();
      
      setState(prev => ({
        ...prev,
        status: 'saved',
        lastSaved: new Date(),
        isDirty: false,
        error: null,
      }));

      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      
      setState(prev => ({
        ...prev,
        status: 'error',
        error: errorMessage,
      }));

      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      isSavingRef.current = false;
    }
  }, [enabled, onSave, onError, onSuccess]);

  // Set up periodic saves when enabled
  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return undefined;
    }

    // Set up periodic saves
    intervalRef.current = setInterval(() => {
      if (state.isDirty && !isSavingRef.current) {
        performSave();
      }
    }, saveInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, saveInterval, state.isDirty, performSave]);

  const triggerSave = useCallback(() => {
    if (!enabled) return;

    setState(prev => ({ ...prev, isDirty: true }));

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout
    debounceTimeoutRef.current = setTimeout(() => {
      performSave();
    }, debounceDelay);
  }, [enabled, debounceDelay, performSave]);

  const forceSave = useCallback(async () => {
    // Clear any pending debounced save
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    await performSave();
  }, [performSave]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null, status: 'idle' }));
  }, []);

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      lastSaved: null,
      error: null,
      isDirty: false,
    });

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
  }, []);

  return {
    ...state,
    triggerSave,
    forceSave,
    clearError,
    reset,
  };
};
