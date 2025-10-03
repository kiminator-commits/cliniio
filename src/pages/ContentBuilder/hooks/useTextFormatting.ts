import { useState, useCallback } from 'react';

interface TextFormattingState {
  fontFamily: string;
  fontSize: string;
  textColor: string;
}

interface TextFormattingActions {
  setFontFamily: (font: string) => void;
  setFontSize: (size: string) => void;
  setTextColor: (color: string) => void;
  resetFormatting: () => void;
  formatBold: (
    content: string,
    onContentChange: (content: string) => void
  ) => void;
  formatItalic: (
    content: string,
    onContentChange: (content: string) => void
  ) => void;
  formatHeading2: (
    content: string,
    onContentChange: (content: string) => void
  ) => void;
  formatHeading3: (
    content: string,
    onContentChange: (content: string) => void
  ) => void;
  formatBulletList: (
    content: string,
    onContentChange: (content: string) => void
  ) => void;
  formatNumberedList: (
    content: string,
    onContentChange: (content: string) => void
  ) => void;
  addNote: (
    content: string,
    onContentChange: (content: string) => void
  ) => void;
  addWarning: (
    content: string,
    onContentChange: (content: string) => void
  ) => void;
  addCheck: (
    content: string,
    onContentChange: (content: string) => void
  ) => void;
  insertLink: (
    content: string,
    onContentChange: (content: string) => void
  ) => void;
}

export function useTextFormatting(
  initialState?: Partial<TextFormattingState>
): TextFormattingState & TextFormattingActions {
  const [fontFamily, setFontFamily] = useState(
    initialState?.fontFamily || 'Inter'
  );
  const [fontSize, setFontSize] = useState(
    initialState?.fontSize || 'text-base'
  );
  const [textColor, setTextColor] = useState(
    initialState?.textColor || 'text-gray-900'
  );

  const resetFormatting = useCallback(() => {
    setFontFamily(initialState?.fontFamily || 'Inter');
    setFontSize(initialState?.fontSize || 'text-base');
    setTextColor(initialState?.textColor || 'text-gray-900');
  }, [initialState]);

  const getTextareaElement = useCallback(() => {
    return document.getElementById('content-main-tab') as HTMLTextAreaElement;
  }, []);

  const formatBold = useCallback(
    (content: string, onContentChange: (content: string) => void) => {
      const textarea = getTextareaElement();
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newText =
          content.substring(0, start) +
          `**${selectedText}**` +
          content.substring(end);
        onContentChange(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 2, end + 2);
        }, 0);
      }
    },
    [getTextareaElement]
  );

  const formatItalic = useCallback(
    (content: string, onContentChange: (content: string) => void) => {
      const textarea = getTextareaElement();
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newText =
          content.substring(0, start) +
          `*${selectedText}*` +
          content.substring(end);
        onContentChange(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 1, end + 1);
        }, 0);
      }
    },
    [getTextareaElement]
  );

  const formatHeading2 = useCallback(
    (content: string, onContentChange: (content: string) => void) => {
      const textarea = getTextareaElement();
      if (textarea) {
        const start = textarea.selectionStart;
        const newText =
          content.substring(0, start) + `\n## ` + content.substring(start);
        onContentChange(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 5, start + 5);
        }, 0);
      }
    },
    [getTextareaElement]
  );

  const formatHeading3 = useCallback(
    (content: string, onContentChange: (content: string) => void) => {
      const textarea = getTextareaElement();
      if (textarea) {
        const start = textarea.selectionStart;
        const newText =
          content.substring(0, start) + `\n### ` + content.substring(start);
        onContentChange(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 5, start + 5);
        }, 0);
      }
    },
    [getTextareaElement]
  );

  const formatBulletList = useCallback(
    (content: string, onContentChange: (content: string) => void) => {
      const textarea = getTextareaElement();
      if (textarea) {
        const start = textarea.selectionStart;
        const newText =
          content.substring(0, start) + `\n- ` + content.substring(start);
        onContentChange(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 3, start + 3);
        }, 0);
      }
    },
    [getTextareaElement]
  );

  const formatNumberedList = useCallback(
    (content: string, onContentChange: (content: string) => void) => {
      const textarea = getTextareaElement();
      if (textarea) {
        const start = textarea.selectionStart;
        const newText =
          content.substring(0, start) + `\n1. ` + content.substring(start);
        onContentChange(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 4, start + 4);
        }, 0);
      }
    },
    [getTextareaElement]
  );

  const addNote = useCallback(
    (content: string, onContentChange: (content: string) => void) => {
      const textarea = getTextareaElement();
      if (textarea) {
        const start = textarea.selectionStart;
        const newText =
          content.substring(0, start) +
          `\n> **Note:** ` +
          content.substring(start);
        onContentChange(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 12, start + 12);
        }, 0);
      }
    },
    [getTextareaElement]
  );

  const addWarning = useCallback(
    (content: string, onContentChange: (content: string) => void) => {
      const textarea = getTextareaElement();
      if (textarea) {
        const start = textarea.selectionStart;
        const newText =
          content.substring(0, start) +
          `\n⚠️ **Warning:** ` +
          content.substring(start);
        onContentChange(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 15, start + 15);
        }, 0);
      }
    },
    [getTextareaElement]
  );

  const addCheck = useCallback(
    (content: string, onContentChange: (content: string) => void) => {
      const textarea = getTextareaElement();
      if (textarea) {
        const start = textarea.selectionStart;
        const newText =
          content.substring(0, start) +
          `\n✅ **Check:** ` +
          content.substring(start);
        onContentChange(newText);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 13, start + 13);
        }, 0);
      }
    },
    [getTextareaElement]
  );

  const insertLink = useCallback(
    (content: string, onContentChange: (content: string) => void) => {
      const textarea = getTextareaElement();
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);

        let linkText = selectedText;
        let url = '';

        if (selectedText) {
          const urlInput = prompt(
            `Enter URL for "${selectedText}":`,
            'https://'
          );
          url = urlInput || '';
        } else {
          const linkTextInput = prompt('Enter link text:', 'Link');
          linkText = linkTextInput || '';
          if (linkText) {
            const urlInput = prompt('Enter URL:', 'https://');
            url = urlInput || '';
          }
        }

        if (url && url.trim() && linkText) {
          const newText =
            content.substring(0, start) +
            `[${linkText}](${url})` +
            content.substring(end);
          onContentChange(newText);
          setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(
              start + linkText.length + 3,
              start + linkText.length + 3
            );
          }, 0);
        }
      }
    },
    [getTextareaElement]
  );

  return {
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
  };
}
