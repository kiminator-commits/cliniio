import { supabase } from '../../../lib/supabaseClient';
import { ToolService } from '../../tools/ToolService';
import { ToolStatus } from '../../../types/toolTypes';
import { InventoryActionService } from '../../../pages/Inventory/services/inventoryActionService';
import { OperationalGap, generateGapId } from '../../aiDailyTaskProgress';

// Database row interfaces
interface AutoclaveRow {
  id: string;
  facility_id: string;
  autoclave_name: string;
  status: ToolStatus;
  next_maintenance: string | null;
  calibration_due: string | null;
  created_at: string;
  updated_at: string;
}

interface BITestRow {
  id: string;
  facility_id: string;
  due_date: string;
  status: ToolStatus;
  created_at: string;
  updated_at: string;
}

interface CleaningTaskRow {
  id: string;
  facility_id: string;
  name: string;
  priority: string;
  due_date: string;
  estimated_duration_minutes: number | null;
  location: string;
  status: ToolStatus;
  created_at: string;
  updated_at: string;
}

export class AIGapScannerProvider {
  /**
   * Scan the entire facility for operational gaps
   */
  async scanOperationalGaps(facilityId: string): Promise<OperationalGap[]> {
    const gaps: OperationalGap[] = [];

    // 1. Equipment maintenance gaps
    const equipmentGaps = await this.scanEquipmentMaintenance(facilityId);
    gaps.push(...equipmentGaps);

    // 2. Compliance gaps
    const complianceGaps = await this.scanComplianceGaps(facilityId);
    gaps.push(...complianceGaps);

    // 3. Operational gaps
    const operationalGaps = await this.scanOperationalIssues(facilityId);
    gaps.push(...operationalGaps);

    // 4. Safety gaps
    const safetyGaps = await this.scanSafetyGaps(facilityId);
    gaps.push(...safetyGaps);

    return gaps;
  }

  /**
   * Scan for equipment maintenance needs
   */
  async scanEquipmentMaintenance(
    facilityId: string
  ): Promise<OperationalGap[]> {
    const gaps: OperationalGap[] = [];
    const today = new Date();

    try {
      // Check autoclave maintenance
      const autoclaveGaps = await this.scanAutoclaveMaintenance(
        facilityId,
        today
      );
      gaps.push(...autoclaveGaps);

      // Check sterilization tools that need maintenance
      const toolGaps = await this.scanToolMaintenance(facilityId);
      gaps.push(...toolGaps);
    } catch (error) {
      console.error('Error scanning equipment maintenance:', error);
    }

    return gaps;
  }

  /**
   * Scan autoclave maintenance needs
   */
  private async scanAutoclaveMaintenance(
    facilityId: string,
    today: Date
  ): Promise<OperationalGap[]> {
    const gaps: OperationalGap[] = [];

    const { data: autoclaves, error: autoclaveError } = await supabase
      .from('autoclaves')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('status', 'active');

    if (autoclaveError) throw autoclaveError;

    autoclaves?.forEach((autoclave) => {
      const autoclaveData = autoclave as AutoclaveRow;

      // Check if maintenance is due
      if (
        autoclaveData.next_maintenance &&
        new Date(autoclaveData.next_maintenance) <= today
      ) {
        gaps.push({
          id: generateGapId(),
          type: 'equipment',
          priority: 'high',
          title: `Autoclave Maintenance Due: ${autoclaveData.autoclave_name}`,
          description: `Maintenance is due for autoclave ${autoclaveData.autoclave_name}. Schedule maintenance to ensure proper operation.`,
          category: 'equipment',
          dueDate: autoclaveData.next_maintenance,
          estimatedPoints: 75,
          estimatedDuration: 120,
          assignedRole: 'technician',
          facilityId,
          metadata: {
            autoclaveId: autoclaveData.id,
            equipmentType: 'autoclave',
          },
        });
      }

      // Check if calibration is due
      if (
        autoclaveData.calibration_due &&
        new Date(autoclaveData.calibration_due) <= today
      ) {
        gaps.push({
          id: generateGapId(),
          type: 'compliance',
          priority: 'urgent',
          title: `Autoclave Calibration Due: ${autoclaveData.autoclave_name}`,
          description: `Calibration is due for autoclave ${autoclaveData.autoclave_name}. This is critical for compliance.`,
          category: 'compliance',
          dueDate: autoclaveData.calibration_due,
          estimatedPoints: 100,
          estimatedDuration: 60,
          assignedRole: 'technician',
          facilityId,
          metadata: {
            autoclaveId: autoclaveData.id,
            equipmentType: 'autoclave',
          },
        });
      }
    });

    return gaps;
  }

  /**
   * Scan tool maintenance needs
   */
  private async scanToolMaintenance(
    facilityId: string
  ): Promise<OperationalGap[]> {
    const gaps: OperationalGap[] = [];

    const facilityTools = await ToolService.getToolsByFacilityAndStatus(
      facilityId,
      'problem'
    );

    facilityTools?.forEach((tool) => {
      gaps.push({
        id: generateGapId(),
        type: 'equipment',
        priority: 'medium',
        title: `Tool Maintenance Required: ${tool.name || tool.id}`,
        description: `Tool ${tool.name || tool.id} requires maintenance. Check condition and repair if possible.`,
        category: 'equipment',
        dueDate: new Date().toISOString().split('T')[0],
        estimatedPoints: 50,
        estimatedDuration: 45,
        assignedRole: 'technician',
        facilityId,
        metadata: { toolId: tool.id, toolName: tool.name || tool.id },
      });
    });

    return gaps;
  }

  /**
   * Scan for compliance gaps
   */
  async scanComplianceGaps(facilityId: string): Promise<OperationalGap[]> {
    const gaps: OperationalGap[] = [];
    const today = new Date();

    try {
      // Check for overdue BI tests
      const biGaps = await this.scanBITests(facilityId, today);
      gaps.push(...biGaps);

      // Check for overdue cleaning schedules
      const cleaningGaps = await this.scanCleaningTasks(facilityId, today);
      gaps.push(...cleaningGaps);
    } catch (error) {
      console.error('Error scanning compliance gaps:', error);
    }

    return gaps;
  }

  /**
   * Scan biological indicator tests
   */
  private async scanBITests(
    facilityId: string,
    today: Date
  ): Promise<OperationalGap[]> {
    const gaps: OperationalGap[] = [];

    const { data: biTests, error: biError } = await supabase
      .from('biological_indicator_tests')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('status', 'pending')
      .lte('due_date', today.toISOString().split('T')[0]);

    if (biError) throw biError;

    biTests?.forEach((biTest) => {
      const biTestData = biTest as BITestRow;
      gaps.push({
        id: generateGapId(),
        type: 'compliance',
        priority: 'urgent',
        title: 'Daily BI Test Required',
        description:
          'Daily Biological Indicator test is required for sterilization compliance.',
        category: 'compliance',
        dueDate: biTestData.due_date,
        estimatedPoints: 80,
        estimatedDuration: 30,
        assignedRole: 'operator',
        facilityId,
        metadata: { biTestId: biTestData.id, testType: 'daily_bi' },
      });
    });

    return gaps;
  }

  /**
   * Scan cleaning tasks
   */
  private async scanCleaningTasks(
    facilityId: string,
    today: Date
  ): Promise<OperationalGap[]> {
    const gaps: OperationalGap[] = [];

    const { data: cleaningTasks, error: cleaningError } = await supabase
      .from('cleaning_tasks')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('status', 'pending')
      .lte('due_date', today.toISOString());

    if (cleaningError) throw cleaningError;

    cleaningTasks?.forEach((task) => {
      const taskData = task as CleaningTaskRow;
      gaps.push({
        id: generateGapId(),
        type: 'compliance',
        priority: taskData.priority === 'critical' ? 'urgent' : 'high',
        title: `Cleaning Task Overdue: ${taskData.name}`,
        description: `Cleaning task "${taskData.name}" is overdue. Complete to maintain compliance.`,
        category: 'compliance',
        dueDate: taskData.due_date,
        estimatedPoints: 60,
        estimatedDuration: taskData.estimated_duration_minutes || 60,
        assignedRole: 'cleaning_staff',
        facilityId,
        metadata: {
          taskId: taskData.id,
          taskName: taskData.name,
          location: taskData.location,
        },
      });
    });

    return gaps;
  }

  /**
   * Scan for operational issues
   */
  async scanOperationalIssues(facilityId: string): Promise<OperationalGap[]> {
    const gaps: OperationalGap[] = [];

    try {
      // Check for tools stuck in sterilization phases
      const stuckToolGaps = await this.scanStuckTools(facilityId);
      gaps.push(...stuckToolGaps);

      // Check for low inventory items
      const inventoryGaps = await this.scanLowInventory(facilityId);
      gaps.push(...inventoryGaps);
    } catch (error) {
      console.error('Error scanning operational issues:', error);
    }

    return gaps;
  }

  /**
   * Scan for tools stuck in sterilization phases
   */
  private async scanStuckTools(facilityId: string): Promise<OperationalGap[]> {
    const gaps: OperationalGap[] = [];

    const statuses = ['bath1', 'bath2', 'airDry', 'autoclave'];
    const allStuckTools = await Promise.all(
      statuses.map((status) =>
        ToolService.getToolsByFacilityAndStatus(
          facilityId,
          status as 'active' | 'dirty' | 'clean' | 'problem' | 'new_barcode'
        )
      )
    );
    const stuckTools = allStuckTools.flat();

    stuckTools?.forEach((tool) => {
      gaps.push({
        id: generateGapId(),
        type: 'operational',
        priority: 'medium',
        title: `Tool Stuck in Phase: ${tool.name || tool.id}`,
        description: `Tool ${tool.name || tool.id} appears to be stuck in ${tool.status} phase. Check workflow status.`,
        category: 'operational',
        dueDate: new Date().toISOString().split('T')[0],
        estimatedPoints: 40,
        estimatedDuration: 30,
        assignedRole: 'operator',
        facilityId,
        metadata: {
          toolId: tool.id,
          toolName: tool.name || tool.id,
          currentPhase: tool.status,
        },
      });
    });

    return gaps;
  }

  /**
   * Scan for low inventory items
   */
  private async scanLowInventory(
    facilityId: string
  ): Promise<OperationalGap[]> {
    const gaps: OperationalGap[] = [];

    const allItems = await InventoryActionService.getItems();
    const lowInventory = allItems.filter(
      (item) =>
        item.facility_id === facilityId &&
        (item.quantity || 0) <
          ((item.data as { min_quantity?: number })?.min_quantity || 0) &&
        (item.data as { isActive?: boolean })?.isActive === true
    );

    lowInventory?.forEach((item) => {
      gaps.push({
        id: generateGapId(),
        type: 'operational',
        priority: 'high',
        title: `Low Stock Alert: ${item.name}`,
        description: `Inventory item ${item.name} is running low. Current quantity: ${item.quantity}.`,
        category: 'operational',
        dueDate: new Date().toISOString().split('T')[0],
        estimatedPoints: 35,
        estimatedDuration: 20,
        assignedRole: 'inventory_manager',
        facilityId,
        metadata: {
          itemId: item.id,
          itemName: item.name,
          currentQuantity: item.quantity,
          minQuantity: (item.data as any)?.min_quantity,
        },
      });
    });

    return gaps;
  }

  /**
   * Scan for safety gaps
   */
  async scanSafetyGaps(facilityId: string): Promise<OperationalGap[]> {
    const gaps: OperationalGap[] = [];

    try {
      // Check for failed sterilization cycles that need investigation
      const failedCycleGaps = await this.scanFailedCycles(facilityId);
      gaps.push(...failedCycleGaps);
    } catch (error) {
      console.error('Error scanning safety gaps:', error);
    }

    return gaps;
  }

  /**
   * Scan for failed sterilization cycles
   */
  private async scanFailedCycles(
    facilityId: string
  ): Promise<OperationalGap[]> {
    const gaps: OperationalGap[] = [];

    const { data: failedCycles, error: cyclesError } = await supabase
      .from('sterilization_cycles')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('status', 'failed')
      .gte(
        'created_at',
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      ); // Last 7 days

    if (cyclesError) throw cyclesError;

    failedCycles?.forEach((cycle) => {
      const cycleData = cycle as {
        id: string;
        failure_reason: string | null;
        created_at: string;
      };
      gaps.push({
        id: generateGapId(),
        type: 'safety',
        priority: 'high',
        title: `Investigate Failed Cycle: ${cycleData.id}`,
        description: `Sterilization cycle ${cycleData.id} failed and requires investigation to prevent future failures.`,
        category: 'safety',
        dueDate: new Date().toISOString().split('T')[0],
        estimatedPoints: 70,
        estimatedDuration: 90,
        assignedRole: 'supervisor',
        facilityId,
        metadata: {
          cycleId: cycleData.id,
          failureReason: cycleData.failure_reason,
        },
      });
    });

    return gaps;
  }

  /**
   * Get gap statistics
   */
  getGapStatistics(gaps: OperationalGap[]): {
    total: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
    byRole: Record<string, number>;
    averagePoints: number;
    totalEstimatedDuration: number;
  } {
    const total = gaps.length;
    const byType = gaps.reduce(
      (acc, gap) => {
        acc[gap.type] = (acc[gap.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byPriority = gaps.reduce(
      (acc, gap) => {
        acc[gap.priority] = (acc[gap.priority] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byCategory = gaps.reduce(
      (acc, gap) => {
        acc[gap.category] = (acc[gap.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const byRole = gaps.reduce(
      (acc, gap) => {
        acc[gap.assignedRole] = (acc[gap.assignedRole] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const averagePoints =
      total > 0
        ? gaps.reduce((sum, gap) => sum + gap.estimatedPoints, 0) / total
        : 0;
    const totalEstimatedDuration = gaps.reduce(
      (sum, gap) => sum + gap.estimatedDuration,
      0
    );

    return {
      total,
      byType,
      byPriority,
      byCategory,
      byRole,
      averagePoints,
      totalEstimatedDuration,
    };
  }

  /**
   * Filter gaps by criteria
   */
  filterGaps(
    gaps: OperationalGap[],
    filters: {
      type?: string;
      priority?: string;
      category?: string;
      assignedRole?: string;
      facilityId?: string;
    }
  ): OperationalGap[] {
    return gaps.filter((gap) => {
      if (filters.type && gap.type !== filters.type) return false;
      if (filters.priority && gap.priority !== filters.priority) return false;
      if (filters.category && gap.category !== filters.category) return false;
      if (filters.assignedRole && gap.assignedRole !== filters.assignedRole)
        return false;
      if (filters.facilityId && gap.facilityId !== filters.facilityId)
        return false;
      return true;
    });
  }

  /**
   * Sort gaps by priority and due date
   */
  sortGapsByPriority(gaps: OperationalGap[]): OperationalGap[] {
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };

    return gaps.sort((a, b) => {
      const priorityDiff =
        (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;

      // If same priority, sort by due date
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  }

  /**
   * Get gaps due today
   */
  getGapsDueToday(gaps: OperationalGap[]): OperationalGap[] {
    const today = new Date().toISOString().split('T')[0];
    return gaps.filter((gap) => gap.dueDate <= today);
  }

  /**
   * Get overdue gaps
   */
  getOverdueGaps(gaps: OperationalGap[]): OperationalGap[] {
    const today = new Date().toISOString().split('T')[0];
    return gaps.filter((gap) => gap.dueDate < today);
  }
}
