import { useState, useRef, useEffect } from 'react';

// Add type declarations for speech recognition
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface UseSpeechRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startSpeechRecognition: () => void;
  stopSpeechRecognition: () => void;
  applyTranscriptToNotes: (
    setNotes: (value: string | ((prev: string) => string)) => void
  ) => void;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startSpeechRecognition = () => {
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
      setIsListening(true);
      setTranscript('');
    });

    (recognition as SpeechRecognition).onresult = (
      event: SpeechRecognitionEvent
    ) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript + interimTranscript);
    };

    (recognition as SpeechRecognition).onerror = (
      event: SpeechRecognitionErrorEvent
    ) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'no-speech') {
        alert('No speech detected. Please try again.');
      }
    };

    (recognition as SpeechRecognition).onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const applyTranscriptToNotes = (
    setNotes: (value: string | ((prev: string) => string)) => void
  ) => {
    if (transcript.trim()) {
      setNotes((prev) => prev + (prev ? ' ' : '') + transcript);
      setTranscript('');
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    startSpeechRecognition,
    stopSpeechRecognition,
    applyTranscriptToNotes,
  };
};
