/**
 * Re-export of the refactored SterilizationDashboard component.
 * This maintains backward compatibility while using the new decomposed architecture.
 *
 * The original 346-line component has been broken down into:
 * - DashboardHeader: Main header with title and scanner controls
 * - CycleControlPanel: Cycle control information and progress display
 * - DashboardTabs: Tab navigation and content display
 * - NewCycleModal: Modal for starting new cycles
 * - useDashboardState: Custom hook for state management
 */
export { default } from './Dashboard/index';
