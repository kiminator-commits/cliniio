import { useState, useCallback } from 'react';

interface ContentFormState {
  title: string;
  description: string;
  content: string;
}

interface ContentFormActions {
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setContent: (content: string) => void;
  updateForm: (updates: Partial<ContentFormState>) => void;
  resetForm: () => void;
  getFormData: () => ContentFormState;
}

export function useContentForm(
  initialState?: Partial<ContentFormState>
): ContentFormState & ContentFormActions {
  const [title, setTitle] = useState(initialState?.title || '');
  const [description, setDescription] = useState(
    initialState?.description || ''
  );
  const [content, setContent] = useState(initialState?.content || '');

  const updateForm = useCallback((updates: Partial<ContentFormState>) => {
    if (updates.title !== undefined) setTitle(updates.title);
    if (updates.description !== undefined) setDescription(updates.description);
    if (updates.content !== undefined) setContent(updates.content);
  }, []);

  const resetForm = useCallback(() => {
    setTitle(initialState?.title || '');
    setDescription(initialState?.description || '');
    setContent(initialState?.content || '');
  }, [initialState]);

  const getFormData = useCallback(
    (): ContentFormState => ({
      title,
      description,
      content,
    }),
    [title, description, content]
  );

  return {
    title,
    description,
    content,
    setTitle,
    setDescription,
    setContent,
    updateForm,
    resetForm,
    getFormData,
  };
}
