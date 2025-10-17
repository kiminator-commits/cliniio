export { ErrorBoundary } from '../ErrorBoundary';
export {
  withErrorBoundary,
  withComponentErrorBoundary,
} from './withErrorBoundary';

// Re-export existing error boundaries for backward compatibility
export { default as KnowledgeHubErrorBoundary } from '../../pages/KnowledgeHub/components/ErrorBoundaries/KnowledgeHubErrorBoundary';
export { ComponentErrorBoundary } from '../../pages/KnowledgeHub/components/ErrorBoundaries/ComponentErrorBoundary';
export { LibraryErrorBoundary } from '../../features/library/components/LibraryErrorBoundary';
export { default as LoginErrorBoundary } from '../Login/LoginErrorBoundary';
