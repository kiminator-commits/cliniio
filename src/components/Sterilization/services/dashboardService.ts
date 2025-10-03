import {
  SterilizationCycle,
  SterilizationPhase,
} from '../../../store/slices/types/sterilizationCycleTypes';
import { mdiPlay, mdiChartLine, mdiFileDocument } from '@mdi/js';

export interface TabInfo {
  id: 'timers' | 'analytics' | 'logs';
  label: string;
  icon: string;
}

export interface CycleProgressInfo {
  hasActivePhase: boolean;
  phaseStatuses: Array<{
    id: string;
    name: string;
    status: string;
    toolCount: number;
    statusColor: string;
  }>;
}

export class DashboardService {
  static getTabs(): TabInfo[] {
    return [
      { id: 'timers', label: 'Phase Timers', icon: mdiPlay },
      { id: 'analytics', label: 'Analytics', icon: mdiChartLine },
      { id: 'logs', label: 'Cleaning Logs', icon: mdiFileDocument },
    ];
  }

  static getCycleProgressInfo(cycle: SterilizationCycle): CycleProgressInfo {
    const hasActivePhase = cycle.phases.some(
      (phase: SterilizationPhase) => phase.status === 'active'
    );

    const phaseStatuses = cycle.phases.map((phase: SterilizationPhase) => ({
      id: phase.id,
      name: phase.name,
      status: phase.status,
      toolCount: phase.tools.length,
      statusColor: this.getPhaseStatusColor(phase.status),
    }));

    return { hasActivePhase, phaseStatuses };
  }

  static getPhaseStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'active':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  }

  static validateOperatorName(operatorName: string): boolean {
    return operatorName.trim().length > 0;
  }

  static getTabButtonClasses(isActive: boolean): string {
    return isActive
      ? 'bg-[#4ECDC4] text-white shadow-md'
      : 'text-gray-600 hover:text-[#4ECDC4] hover:bg-gray-50';
  }

  static getStartCycleButtonState(operatorName: string): {
    disabled: boolean;
    className: string;
  } {
    const disabled = !this.validateOperatorName(operatorName);
    const className = this.validateOperatorName(operatorName)
      ? 'bg-[#4ECDC4] text-white hover:bg-[#3db8b0]'
      : 'bg-gray-300 text-gray-500 cursor-not-allowed';

    return { disabled, className };
  }

  static shouldShowNoCycleMessage(
    currentCycle: SterilizationCycle | null
  ): boolean {
    return !currentCycle;
  }

  static shouldShowActiveCycleInfo(cycle: SterilizationCycle): boolean {
    return cycle.phases.some(
      (phase: SterilizationPhase) => phase.status === 'active'
    );
  }
}
