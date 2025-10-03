import { create } from 'zustand';
import { AITaskPerformance, PerformanceUpdate } from '@/types/aiTaskPerformanceTypes';

interface AiTaskPerformanceState {
  // Results data
  results: PerformanceUpdate | null;
  taskPerformance: AITaskPerformance | null;
  
  // Loading states
  isLoading: boolean;
  isRecordingTask: boolean;
  
  // Error state
  error: string | null;
}

interface AiTaskPerformanceActions {
  // Results actions
  setResults: (results: PerformanceUpdate) => void;
  clearResults: () => void;
  setTaskPerformance: (performance: AITaskPerformance) => void;
  clearTaskPerformance: () => void;
  
  // Loading actions
  setLoading: (isLoading: boolean) => void;
  setRecordingTask: (isRecording: boolean) => void;
  
  // Error actions
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Combined actions
  reset: () => void;
}

type AiTaskPerformanceSlice = AiTaskPerformanceState & AiTaskPerformanceActions;

const initialState: AiTaskPerformanceState = {
  results: null,
  taskPerformance: null,
  isLoading: false,
  isRecordingTask: false,
  error: null,
};

export const useAiTaskPerformanceSlice = create<AiTaskPerformanceSlice>((set) => ({
  ...initialState,
  
  // Results actions
  setResults: (results: PerformanceUpdate) => 
    set({ results, error: null }),
    
  clearResults: () => 
    set({ results: null }),
    
  setTaskPerformance: (taskPerformance: AITaskPerformance) => 
    set({ taskPerformance, error: null }),
    
  clearTaskPerformance: () => 
    set({ taskPerformance: null }),
  
  // Loading actions
  setLoading: (isLoading: boolean) => 
    set({ isLoading }),
    
  setRecordingTask: (isRecordingTask: boolean) => 
    set({ isRecordingTask }),
  
  // Error actions
  setError: (error: string | null) => 
    set({ error }),
    
  clearError: () => 
    set({ error: null }),
  
  // Combined actions
  reset: () => 
    set(initialState),
}));
