import { useState, useCallback } from 'react';

interface MediaUploadState {
  pdfFile: File | null;
  pdfUploading: boolean;
  isRecording: boolean;
}

interface MediaUploadActions {
  setPdfFile: (file: File | null) => void;
  setPdfUploading: (uploading: boolean) => void;
  setIsRecording: (recording: boolean) => void;
  handlePdfUpload: () => Promise<void>;
  handleVoiceToggle: () => void;
  removePdfFile: () => void;
  resetMedia: () => void;
}

export function useMediaUpload(
  initialState?: Partial<MediaUploadState>
): MediaUploadState & MediaUploadActions {
  const [pdfFile, setPdfFile] = useState<File | null>(
    initialState?.pdfFile || null
  );
  const [pdfUploading, setPdfUploading] = useState(
    initialState?.pdfUploading || false
  );
  const [isRecording, setIsRecording] = useState(
    initialState?.isRecording || false
  );

  const handlePdfUpload = useCallback(async (): Promise<void> => {
    if (!pdfFile) return;

    setPdfUploading(true);
    try {
      // Simulate PDF upload - in production, this would call an actual upload service
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Handle successful upload
      console.log('PDF uploaded successfully:', pdfFile.name);

      // You could store the uploaded file URL here
      // const uploadedUrl = await uploadService.uploadFile(pdfFile);
    } catch (error) {
      console.error('PDF upload failed:', error);
      // Handle upload error
    } finally {
      setPdfUploading(false);
    }
  }, [pdfFile]);

  const handleVoiceToggle = useCallback(() => {
    if (
      !('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)
    ) {
      alert(
        'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      // Stop voice recording logic would go here
    } else {
      setIsRecording(true);
      // Start voice recording logic would go here

      // Example voice recognition setup:
      // const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      // const recognition = new SpeechRecognition();
      // recognition.continuous = true;
      // recognition.interimResults = true;
      // recognition.lang = 'en-US';
      // recognition.start();
    }
  }, [isRecording]);

  const removePdfFile = useCallback(() => {
    setPdfFile(null);
  }, []);

  const resetMedia = useCallback(() => {
    setPdfFile(null);
    setPdfUploading(false);
    setIsRecording(false);
  }, []);

  return {
    pdfFile,
    pdfUploading,
    isRecording,
    setPdfFile,
    setPdfUploading,
    setIsRecording,
    handlePdfUpload,
    handleVoiceToggle,
    removePdfFile,
    resetMedia,
  };
}
