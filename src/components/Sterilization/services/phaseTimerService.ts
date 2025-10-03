import { SterilizationPhase } from '../../../store/sterilizationStore';

/**
 * Information about a phase's current status for UI display.
 * @interface PhaseStatusInfo
 * @property {string} color - CSS class for status color (e.g., 'bg-green-500')
 * @property {string} text - Human-readable status text (e.g., 'Active', 'Completed')
 */
export interface PhaseStatusInfo {
  color: string;
  text: string;
}

/**
 * Information about a phase's progress for UI display.
 * @interface PhaseProgressInfo
 * @property {number} percentage - Progress percentage (0-100)
 * @property {boolean} shouldShowProgress - Whether to display progress bar
 */
export interface PhaseProgressInfo {
  percentage: number;
  shouldShowProgress: boolean;
}

/**
 * Service class providing utility functions for sterilization phase timer management.
 * Handles status information, progress calculations, UI styling, and time formatting.
 */
export class PhaseTimerService {
  /**
   * Gets the status information for a phase based on its current status.
   * @param {string} status - The current phase status
   * @returns {PhaseStatusInfo} Object containing color and text for UI display
   */
  static getStatusInfo(status: string): PhaseStatusInfo {
    switch (status) {
      case 'active':
        return { color: 'bg-green-500', text: 'Active' };
      case 'completed':
        return { color: 'bg-blue-500', text: 'Completed' };
      case 'failed':
        return { color: 'bg-red-500', text: 'Failed' };
      case 'paused':
        return { color: 'bg-yellow-500', text: 'Paused' };
      default:
        return { color: 'bg-gray-400', text: 'Pending' };
    }
  }

  /**
   * Calculates progress information for a sterilization phase.
   * Handles special cases like air dry phases that don't have fixed durations.
   * @param {SterilizationPhase} phase - The sterilization phase
   * @param {number} elapsed - Elapsed time in seconds
   * @param {number} duration - Total phase duration in seconds
   * @returns {PhaseProgressInfo} Object containing progress percentage and display flag
   */
  /**
   * Calculates progress information for a sterilization phase.
   * Handles special cases like air dry phases that don't have fixed durations.
   * @param {SterilizationPhase} phase - The sterilization phase
   * @param {number} elapsed - Elapsed time in seconds
   * @param {number} duration - Total phase duration in seconds
   * @returns {PhaseProgressInfo} Object containing progress percentage and display flag
   */
  static getProgressInfo(
    phase: SterilizationPhase,
    elapsed: number,
    duration: number
  ): PhaseProgressInfo {
    // BUSINESS LOGIC: Special handling for air dry phase
    // Air dry phase doesn't have a fixed duration as it depends on environmental conditions
    // Therefore, we don't show a progress bar for this phase
    if (phase.id === 'airDry') {
      return { percentage: 0, shouldShowProgress: false };
    }

    // BUSINESS LOGIC: Progress calculation for timed phases
    // Calculate percentage completion based on elapsed time vs total duration
    // Cap at 100% to prevent overflow in case of timing discrepancies
    const totalTime = duration;
    const percentage = Math.min(100, (elapsed / totalTime) * 100);
    return { percentage, shouldShowProgress: true };
  }

  static getBorderClasses(phase: SterilizationPhase): string {
    if (phase.isActive) {
      return 'border-green-500 bg-green-50';
    }
    if (phase.status === 'completed') {
      return 'border-blue-500 bg-blue-50';
    }
    if (phase.status === 'failed') {
      return 'border-red-500 bg-red-50';
    }
    if (phase.tools.length > 0) {
      return 'border-blue-300 bg-blue-50 shadow-sm';
    }
    return 'border-gray-300 bg-white';
  }

  static getProgressBarColor(phase: SterilizationPhase): string {
    if (phase.isActive) {
      return 'bg-green-500';
    }
    if (phase.status === 'completed') {
      return 'bg-blue-500';
    }
    if (phase.status === 'failed') {
      return 'bg-red-500';
    }
    return 'bg-gray-400';
  }

  static isBathPhase(phaseName: string): boolean {
    return phaseName.toLowerCase().includes('bath');
  }

  static validatePhaseDuration(duration: number): boolean {
    return duration > 0 && duration <= 7200;
  }

  /**
   * Generates formatted time display text for phase timers.
   * Handles different display formats for air dry vs. timed phases.
   * @param {string} phaseId - The phase identifier
   * @param {number} elapsed - Elapsed time in seconds
   * @param {number} remaining - Remaining time in seconds
   * @param {number} duration - Total phase duration in seconds
   * @returns {string} Formatted time string for display
   */
  /**
   * Generates formatted time display text for phase timers.
   * Handles different display formats for air dry vs. timed phases.
   * @param {string} phaseId - The phase identifier
   * @param {number} elapsed - Elapsed time in seconds
   * @param {number} remaining - Remaining time in seconds
   * @param {number} duration - Total phase duration in seconds
   * @returns {string} Formatted time string for display
   */
  static getTimeDisplayText(
    phaseId: string,
    elapsed: number,
    remaining: number,
    duration: number
  ): string {
    // BUSINESS LOGIC: Air dry phase time display
    // Air dry phases show elapsed time only since they don't have fixed durations
    // This helps operators track how long tools have been drying
    if (phaseId === 'airDry') {
      return `${this.formatTime(elapsed)} elapsed`;
    }

    // BUSINESS LOGIC: Timed phase display format
    // Show remaining time vs total duration for phases with fixed time requirements
    // Format: "MM:SS / MM:SS" or "HH:MM:SS / HH:MM:SS"
    return `${this.formatTime(remaining)} / ${this.formatTime(duration)}`;
  }

  /**
   * Formats seconds into a human-readable time string (HH:MM:SS or MM:SS).
   * @param {number} seconds - Time in seconds to format
   * @returns {string} Formatted time string
   * @private
   */
  /**
   * Formats seconds into a human-readable time string (HH:MM:SS or MM:SS).
   * @param {number} seconds - Time in seconds to format
   * @returns {string} Formatted time string
   * @private
   */
  private static formatTime(seconds: number): string {
    // BUSINESS LOGIC: Time unit extraction
    // Convert total seconds into hours, minutes, and seconds for display
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    // BUSINESS LOGIC: Conditional time format selection
    // Use HH:MM:SS format for durations over 1 hour, MM:SS for shorter durations
    // This provides appropriate precision for sterilization phase timing
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
