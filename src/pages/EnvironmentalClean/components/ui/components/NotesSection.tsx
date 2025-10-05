import React from 'react';
import Icon from '@mdi/react';
import { mdiMicrophone, mdiMicrophoneOff } from '@mdi/js';

interface NotesSectionProps {
  notes: string;
  isListening: boolean;
  transcript: string;
  onNotesChange: (notes: string) => void;
  onClearNotes: () => void;
  onStartSpeechRecognition: () => void;
  onStopSpeechRecognition: () => void;
  onApplyTranscriptToNotes: (setNotes: (notes: string) => void) => void;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  notes,
  isListening,
  transcript,
  onNotesChange,
  onClearNotes,
  onStartSpeechRecognition,
  onStopSpeechRecognition,
  onApplyTranscriptToNotes,
}) => {
  return (
    <div className="mt-4 border-t border-gray-200 pt-3">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-medium text-gray-800">Notes</h3>
        <div className="flex gap-2">
          <button
            onClick={onClearNotes}
            className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 text-sm"
          >
            Clear Notes
          </button>
          <button
            onClick={
              isListening ? onStopSpeechRecognition : onStartSpeechRecognition
            }
            className={`px-3 py-1 rounded-md text-sm flex items-center gap-1 ${
              isListening
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            }`}
          >
            <Icon
              path={isListening ? mdiMicrophoneOff : mdiMicrophone}
              size={0.8}
            />
            {isListening ? 'Stop Dictation' : 'Start Dictation'}
          </button>
        </div>
      </div>

      {/* Speech Recognition Transcript */}
      {isListening && (
        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-800 flex items-center">
              <Icon
                path={mdiMicrophone}
                size={0.8}
                className="mr-1 animate-pulse"
              />
              Listening... Speak now
            </span>
            <button
              onClick={() => onApplyTranscriptToNotes(onNotesChange)}
              disabled={!transcript.trim()}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Notes
            </button>
          </div>
          <div className="text-sm text-blue-700 min-h-[2rem]">
            {transcript || 'Waiting for speech...'}
          </div>
        </div>
      )}

      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder="Add any additional notes here... Use the dictation button to speak your notes!"
        className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md"
      />
    </div>
  );
};
