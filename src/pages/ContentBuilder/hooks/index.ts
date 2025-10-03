// ContentBuilder module hooks
export { useContentBuilderActions } from './useContentBuilderActions';

// New refactored hooks for state management
export { useContentForm } from './useContentForm';
export { useTextFormatting } from './useTextFormatting';
export { useTableBuilder } from './useTableBuilder';
export { useMediaUpload } from './useMediaUpload';
export {
  useContentTypeSpecific,
  usePolicyEditor,
  useProcedureEditor,
  useSMSEditor,
  usePathwayEditor,
} from './useContentTypeSpecific';

// Validation hooks
export {
  useValidation,
  usePolicyValidation,
  useProcedureValidation,
  useSMSValidation,
  usePathwayValidation,
} from './useValidation';

// Performance optimization hooks
export {
  useDebounce,
  useThrottle,
  useExpensiveCalculation,
  useVirtualScrolling,
  useIntersectionObserver,
  usePerformanceMonitor,
  useBatchUpdates,
  useMemoryOptimizedState,
} from './usePerformanceOptimization';

export {
  useOptimizedValidation,
  useOptimizedPolicyValidation,
  useOptimizedProcedureValidation,
  useOptimizedSMSValidation,
  useOptimizedPathwayValidation,
} from './useOptimizedValidation';
