import React, { useRef, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiMicrophone, mdiMicrophoneOff } from '@mdi/js';

interface VoiceRecorderProps {
  onTranscriptUpdate: (transcript: string) => void;
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptUpdate,
  isRecording,
  onRecordingChange,
}) => {
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startVoiceRecording = () => {
    if (
      !('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)
    ) {
      alert(
        'Speech recognition is not supported in this browser. Please use Chrome or Edge.'
      );
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.addEventListener('start', () => {
      onRecordingChange(true);
    });

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      // Update content with the transcript
      if (finalTranscript) {
        onTranscriptUpdate(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      onRecordingChange(false);
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      }
    };

    recognition.onend = () => {
      onRecordingChange(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    onRecordingChange(false);
  };

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  // Cleanup voice recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon path={mdiMicrophone} size={1.2} className="text-blue-600" />
        <h3 className="text-sm font-medium text-gray-900">Voice Recording</h3>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleVoiceToggle}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
            isRecording
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Icon
            path={isRecording ? mdiMicrophoneOff : mdiMicrophone}
            size={0.8}
          />
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>

        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-red-600 font-medium">
              Recording...
            </span>
          </div>
        )}
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-xs text-gray-600">
          <strong>How it works:</strong> Click "Start Recording" and speak
          clearly. Your speech will be automatically transcribed and added to
          the content field. Click "Stop Recording" when finished.
        </p>
        <p className="text-xs text-gray-500 mt-1">
          <strong>Note:</strong> Speech recognition works best in quiet
          environments with clear pronunciation.
        </p>
      </div>
    </div>
  );
};
