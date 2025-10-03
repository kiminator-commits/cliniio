// Main page components
export { HomeContent } from './HomeContent';
export { default as HomeLayout } from './HomeLayout';
export { default as HomeContentLayout } from './HomeContentLayout';

// Header and navigation components
export { DashboardHeader } from './DashboardHeader';

// Content sections
export { default as HomeMetricsSection } from './HomeMetricsSection';
export { default as HomeTasksSection } from './HomeTasksSection';
export { default as HomeGamificationSection } from './HomeGamificationSection';

// Task management components
export { default as TaskSection } from './TaskSection';
export { TasksPanel } from './TasksPanel';
export { OperationsTasksContainer } from './OperationsTasksContainer';
export { OperationsTasksList } from './OperationsTasksList';
export { useTaskManagementLogic } from './TaskManagementLogic';
export { default as TaskLoadingStates } from './TaskLoadingStates';
export { default as TaskErrorDisplay } from './TaskErrorDisplay';

// Metrics and analytics components
export { default as MetricsSection } from './MetricsSection';
export { MetricsPanel } from './MetricsPanel';

// Modal and overlay components
export { default as HomeModals } from './HomeModals';

// Gamification components
export { default as GamificationSection } from './GamificationSection';

// Note: Gamification sub-components should be imported directly from their specific files
// to avoid circular dependency issues
