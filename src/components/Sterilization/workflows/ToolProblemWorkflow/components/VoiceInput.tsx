import React from 'react';
import { motion } from 'framer-motion';
import Icon from '@mdi/react';
import { mdiMicrophone, mdiMicrophoneOff } from '@mdi/js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface VoiceInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ value, onChange }) => {
  const { isRecording, startRecording, stopRecording } = useSpeechRecognition();

  const handleVoiceRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording((transcript) => {
        onChange(transcript);
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="space-y-3"
    >
      <label
        htmlFor="problem-description"
        className="block text-sm font-medium text-gray-700"
      >
        Describe the problem
      </label>
      <div className="flex space-x-2">
        <textarea
          id="problem-description"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe the issue..."
          className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          rows={3}
        />
        <button
          onClick={handleVoiceRecording}
          className={`p-3 rounded-md transition-colors ${
            isRecording
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={isRecording ? 'Stop recording' : 'Voice input'}
        >
          <Icon
            path={isRecording ? mdiMicrophoneOff : mdiMicrophone}
            size={1}
          />
        </button>
      </div>
      {isRecording && (
        <p className="text-sm text-red-600">Recording... Speak now</p>
      )}
    </motion.div>
  );
};
