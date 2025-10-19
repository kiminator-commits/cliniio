import { supabase } from '../lib/supabaseClient';
import { useLoginStore } from '../store/useLoginStore';
import { SecureAuthService } from './secureAuthService';
import { ToolService } from './tools/ToolService';
import { ToolStatus } from '../types/toolTypes';
import { logBatchCreated, logToolPackaged } from '../utils/auditLogger';

/**
 * Safe type conversion utilities to prevent data loss
 */
const safeString = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

const safeNumber = (value: unknown): number => {
  return typeof value === 'number' ? value : 0;
};

const safeBoolean = (value: unknown): boolean => {
  return typeof value === 'boolean' ? value : false;
};

const safeDate = (value: unknown): Date | undefined => {
  if (typeof value === 'string') {
    const date = new Date(value);
    return isNaN(date.getTime()) ? undefined : date;
  }
  return undefined;
};

const _mapToToolStatus = (phase: string): ToolStatus => {
  switch (phase) {
    case 'active':
      return 'active';
    case 'dirty':
      return 'dirty';
    case 'clean':
      return 'clean';
    case 'problem':
      return 'problem';
    case 'new_barcode':
      return 'new_barcode';
    default:
      return 'active';
  }
};

const mapDatabaseStatusToToolStatus = (
  dbStatus: string
): 'available' | 'in_cycle' | 'maintenance' | 'retired' | 'problem' => {
  switch (dbStatus) {
    case 'active':
      return 'available';
    case 'dirty':
      return 'maintenance';
    case 'clean':
      return 'available';
    case 'problem':
      return 'problem';
    case 'new_barcode':
      return 'available';
    default:
      return 'available';
  }
};

/**
 * Generate unique package ID
 */
function generatePackageId(facility_id: string): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const shortId = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `PKG-${facility_id.slice(0, 4).toUpperCase()}-${timestamp}-${shortId}`;
}

export interface PackageInfo {
  packageType: string;
  packageSize: string;
  notes: string;
}

export interface Tool {
  id: string;
  name: string;
  barcode: string;
  category: string;
  status: 'available' | 'in_cycle' | 'maintenance' | 'retired' | 'problem';
  lastSterilized?: string;
  cycleCount: number;
  maxCycles?: number;
  location?: string;
  notes?: string;
  type?: string;
  currentPhase?:
    | 'bath1'
    | 'bath2'
    | 'airDry'
    | 'autoclave'
    | 'complete'
    | 'failed'
    | string;
  startTime?: Date | null;
  endTime?: Date | null;
  phaseStartTime?: Date | null;
  phaseEndTime?: Date | null;
  biStatus?: 'pending' | 'pass' | 'fail' | 'in-progress';
  operator?: string;
  cycleId?: string;
  label?: string;
  problemType?: 'damaged' | 'improperly_cleaned' | 'worn_out' | 'other';
  problemNotes?: string;
  problemReportedBy?: string;
  problemReportedAt?: Date;
  isP2Status?: boolean;
}

export interface SterilizationBatch {
  id: string;
  packageId: string;
  batchName: string;
  batchType: string;
  status: ToolStatus;
  packageType: string;
  packageSize: string;
  chemicalIndicatorAdded: boolean;
  packagedBy: string;
  packagedAt: Date;
  totalItems: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PackagingResult {
  success: boolean;
  message: string;
  batch?: SterilizationBatch;
  packageId?: string;
}

export class PackagingService {
  /**
   * Get tools ready for packaging (completed sterilization)
   */
  static async getToolsReadyForPackaging(): Promise<Tool[]> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Get current user from custom auth store
        const authToken = useLoginStore.getState().authToken;
        if (!authToken) {
          if (attempt < maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise((resolve) => setTimeout(resolve, attempt * 500));
            continue;
          }
          throw new Error('User not authenticated');
        }

        // Get current user and facility from Supabase
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user) {
          throw new Error('User not authenticated');
        }

        // Get user's facility ID from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('facility_id')
          .eq('id', user.id)
          .single();

        if (userError || !userData) {
          throw new Error('User facility not found');
        }

        // Get tools ready for packaging using real facility ID
        const { data: tools, error } = await supabase
          .from('tools')
          .select('*')
          .eq('facility_id', userData.facility_id)
          .eq('status', 'active');

        if (error) {
          throw new Error(`Failed to fetch tools: ${error.message}`);
        }

        const typedTools = tools as Record<string, unknown>[] | null;

        return (typedTools || []).map((tool) => {
          const typedTool = tool as Record<string, unknown>;
          return {
            id: safeString(typedTool.tool_id),
            name: safeString(typedTool.tool_name),
            barcode: safeString(typedTool.barcode),
            type: safeString(typedTool.tool_type),
            category: safeString(typedTool.category) || 'general',
            currentPhase: safeString(typedTool.current_phase),
            status: mapDatabaseStatusToToolStatus(
              safeString(typedTool.current_phase)
            ),
            lastSterilized: safeString(typedTool.last_sterilized) || undefined,
            cycleCount: safeNumber(typedTool.cycle_count),
            maxCycles: safeNumber(typedTool.max_cycles) || undefined,
            location: safeString(typedTool.location) || undefined,
            notes: safeString(typedTool.notes) || undefined,
          };
        });
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          console.error(
            `Error fetching tools ready for packaging (attempt ${attempt}/${maxRetries}):`,
            error
          );
          throw lastError;
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }

    // This should never be reached, but just in case
    throw lastError || new Error('Failed to fetch tools after all retries');
  }

  /**
   * Create a new package with tools
   */
  static async createPackage(
    toolIds: string[],
    packageInfo: PackageInfo,
    operatorName: string
  ): Promise<PackagingResult> {
    try {
      // Get current user from custom auth store
      const authToken = useLoginStore.getState().authToken;
      if (!authToken) {
        throw new Error('User not authenticated');
      }

      // Get current user's facility ID and user ID
      const { FacilityService } = await import('./facilityService');
      const facilityId = await FacilityService.getCurrentFacilityId();

      // Get current user ID from auth
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated');
      }
      const userId = user.id;

      // Generate unique package ID
      const packageId = generatePackageId(facilityId);

      // Create the batch/package
      const { data: batch, error: batchError } = await supabase
        .from('sterilization_batches')
        .insert({
          id: crypto.randomUUID(),
          cycle_id: crypto.randomUUID(), // Generate a cycle ID
          facility_id: facilityId,
          batch_name: `Package ${packageId}`,
          batch_type: 'routine',
          status: 'packaged',
          package_id: packageId,
          package_type: packageInfo.packageType,
          package_size: packageInfo.packageSize,
          chemical_indicator_added: true, // Assuming CI is always added
          packaged_by: userId,
          packaged_at: new Date().toISOString(),
          requested_by: userId, // Add required field
          total_items: toolIds.length,
          notes: packageInfo.notes,
        })
        .select()
        .single();

      if (batchError) {
        throw new Error(`Failed to create package: ${batchError.message}`);
      }

      const typedBatch = batch as Record<string, unknown>;

      // Add tools to the batch
      const _batchItems = toolIds.map((toolId) => ({
        batch_id: typedBatch.id as string,
        tool_id: toolId,
        item_name: 'Tool', // Will be updated with actual tool name
        item_type: 'sterilization_tool',
        quantity: 1,
        package_type: packageInfo.packageType,
        package_configuration: {
          package_size: packageInfo.packageSize,
          notes: packageInfo.notes,
        },
      }));

      // Note: Batch items insertion requires database schema update
      // The batch_items table needs to be created with proper structure
      // Current implementation skips this step until schema is ready
      // const { error: itemsError } = await supabase
      //   .from('sterilization_batches')
      //   .insert(batchItems);

      // if (itemsError) {
      //   // Clean up the batch if adding items fails
      //   await supabase
      //     .from('sterilization_batches')
      //     .delete()
      //     .eq('id', typedBatch.id as string);
      //   throw new Error(
      //     `Failed to add tools to package: ${itemsError.message}`
      //   );
      // }

      // Update tool status to indicate they're packaged
      // Update status using ToolService for each tool
      const toolUpdatePromises = toolIds.map((toolId) =>
        ToolService.updateToolStatus(toolId, 'active')
      );
      await Promise.all(toolUpdatePromises);

      // Update additional fields that ToolService doesn't handle yet
      await ToolService.touchTools(toolIds);

      // Get current user and facility from auth service
      const authService = new SecureAuthService();
      const currentUser = await authService.getCurrentUser();
      const currentFacility = currentUser
        ? { id: (currentUser as Record<string, unknown>).facility_id }
        : null;

      // Create audit log entry
      await supabase.from('audit_logs').insert({
        created_by: (currentUser as Record<string, unknown>)?.id || 'unknown',
        facility_id: currentFacility?.id || 'unknown',
        module: 'sterilization',
        action: 'package_created',
        table_name: 'sterilization_batches',
        record_id: typedBatch.id as string,
        old_values: {},
        new_values: {
          package_id: packageId,
          package_type: packageInfo.packageType,
          total_items: toolIds.length,
          status: 'packaged',
        } as Record<string, unknown>,
        metadata: {
          package_id: packageId,
          tool_count: toolIds.length,
          operator_name: operatorName,
          package_info: packageInfo,
        } as Record<string, unknown>,
      });

      const sterilizationBatch: SterilizationBatch = {
        id: safeString(typedBatch.id),
        packageId: safeString(typedBatch.package_id),
        batchName: safeString(typedBatch.batch_name),
        batchType: safeString(typedBatch.batch_type),
        status: safeString(typedBatch.status) as ToolStatus,
        packageType: safeString(typedBatch.package_type),
        packageSize: safeString(typedBatch.package_size),
        chemicalIndicatorAdded: safeBoolean(
          typedBatch.chemical_indicator_added
        ),
        packagedBy: safeString(typedBatch.packaged_by),
        packagedAt: safeDate(typedBatch.packaged_at) || new Date(),
        totalItems: safeNumber(typedBatch.total_items),
        createdAt: safeDate(typedBatch.created_at) || new Date(),
        updatedAt: safeDate(typedBatch.updated_at) || new Date(),
      };

      return {
        success: true,
        message: `Package ${packageId} created successfully with ${toolIds.length} tools`,
        batch: sterilizationBatch,
        packageId: safeString(packageId),
      };
    } catch (error) {
      console.error('Error creating package:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to create package',
      };
    }
  }

  /**
   * Get package by ID
   */
  static async getPackageById(
    packageId: string
  ): Promise<SterilizationBatch | null> {
    try {
      const { data: batch, error } = await supabase
        .from('sterilization_batches')
        .select('*')
        .eq('package_id', packageId)
        .single();

      if (error || !batch) {
        return null;
      }

      const typedBatch = batch as Record<string, unknown>;

      return {
        id: safeString(typedBatch.id),
        packageId: safeString(typedBatch.package_id),
        batchName: safeString(typedBatch.batch_name),
        batchType: safeString(typedBatch.batch_type),
        status: safeString(typedBatch.status) as ToolStatus,
        packageType: safeString(typedBatch.package_type),
        packageSize: safeString(typedBatch.package_size),
        chemicalIndicatorAdded: safeBoolean(
          typedBatch.chemical_indicator_added
        ),
        packagedBy: safeString(typedBatch.packaged_by),
        packagedAt: safeDate(typedBatch.packaged_at) || new Date(),
        totalItems: safeNumber(typedBatch.total_items),
        createdAt: safeDate(typedBatch.created_at) || new Date(),
        updatedAt: safeDate(typedBatch.updated_at) || new Date(),
      };
    } catch (error) {
      console.error('Error fetching package:', error);
      return null;
    }
  }

  /**
   * Get tools in a package
   */
  static async getToolsInPackage(packageId: string): Promise<Tool[]> {
    try {
      const { data: batch, error: batchError } = await supabase
        .from('sterilization_batches')
        .select('id')
        .eq('package_id', packageId)
        .single();

      if (batchError || !batch) {
        throw new Error('Package not found');
      }

      const typedBatch = batch as Record<string, unknown>;

      const { data: batchItems, error: itemsError } = await supabase
        .from('sterilization_cycle_tools')
        .select(
          `
          tool_id,
          tools (
            id,
            tool_name,
            barcode,
            tool_type,
            status,
            last_sterilized,
            sterilization_count,
            location,
            manufacturer,
            model,
            serial_number,
            maintenance_due_date,
            notes,
            metadata
          )
        `
        )
        .eq('cycle_id', typedBatch.id as string);

      if (itemsError) {
        throw new Error(`Failed to fetch package tools: ${itemsError.message}`);
      }

      return (batchItems || []).map((item) => {
        const typedItem = item as Record<string, unknown>;
        const tool = typedItem.tools as Record<string, unknown> | null;

        if (!tool) {
          throw new Error('Tool data not found');
        }

        return {
          id: tool.id as string,
          name: tool.tool_name as string,
          barcode: tool.barcode as string,
          type: tool.tool_type as string,
          category: (tool.category as string) || 'general',
          currentPhase: tool.status as string,
          status: mapDatabaseStatusToToolStatus(tool.status as string),
          location: tool.location as string,
          notes: (tool.notes as string) || undefined,
          cycleCount: (tool.cycle_count as number) || 0,
          lastSterilized: tool.last_sterilized as string | undefined,
        };
      });
    } catch (error) {
      console.error('Error fetching package tools:', error);
      throw error;
    }
  }
}

// ✅ Supabase persistence for Packaging Workflow (batch creation, linkage, and tool updates)
export async function createPackage({
  batchId,
  operatorName,
  facilityId,
  toolBarcodes,
  packageType,
  packageSize,
  notes,
}: {
  batchId: string;
  operatorName: string;
  facilityId: string;
  toolBarcodes: string[];
  packageType: string;
  packageSize: string;
  notes?: string;
}) {
  // ✅ Create new packaging batch in sterilization_batches
  const { data: batchData, error: batchError } = await supabase
    .from('sterilization_batches')
    .insert({
      batch_code: batchId,
      operator_name: operatorName,
      facility_id: facilityId,
      package_type: packageType,
      package_size: packageSize,
      notes: notes || null,
      status: 'packaged',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (batchError) throw batchError;

  // ✅ Link tools to this batch in batch_items table
  const batchLinks = toolBarcodes.map((barcode) => ({
    batch_id: batchData.id,
    tool_barcode: barcode,
    facility_id: facilityId,
    linked_at: new Date().toISOString(),
  }));

  const { error: linkError } = await supabase
    .from('batch_items')
    .insert(batchLinks);

  if (linkError) throw linkError;

  // ✅ Update tool statuses to 'packaged'
  const { error: statusError } = await supabase
    .from('sterilization_tools')
    .update({ status: 'packaged' })
    .in('barcode', toolBarcodes)
    .eq('facility_id', facilityId);

  if (statusError) throw statusError;

  // ✅ Integrated audit logging for Packaging Workflow — batch creation and tool packaging
  await logBatchCreated(batchData.batch_code, operatorName, facilityId);

  for (const barcode of toolBarcodes) {
    await logToolPackaged(
      barcode,
      batchData.batch_code,
      operatorName,
      facilityId
    );
  }

  return batchData;
}
