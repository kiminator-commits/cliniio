/**
 * Re-export of the refactored PhaseTimer component.
 * This maintains backward compatibility while using the new decomposed architecture.
 *
 * The original 355-line component has been broken down into:
 * - PhaseTimerHeader: Header section with expand/collapse, status, and controls
 * - PhaseTimerProgress: Progress bar and error display
 * - PhaseToolList: Tool list display
 * - PhaseTimerControls: Action buttons for timer control
 * - PhaseTimerAlerts: Over-exposure warnings
 * - PhaseTimerExpanded: Orchestrates expanded content
 * - usePhaseTimerState: Custom hook for state management
 */
export { default } from './PhaseTimer/index';
