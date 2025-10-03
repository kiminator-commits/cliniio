# Sterilization Workflows

## Overview

The sterilization module implements a comprehensive workflow management system for medical tool sterilization processes. Each workflow is designed to handle specific tool states and requirements in the sterilization lifecycle.

## Workflow Types

### 1. Clean Workflow ✅

**Purpose**: Tools that are ready to use on patients

- **File**: `CleanWorkflow.tsx` / `CleanWorkflow/index.tsx`
- **Process**:
  1. Tool is scanned via barcode
  2. System verifies tool is clean and ready
  3. Tool is marked as "dirty" after use
  4. Generates traceability code for audit trail
- **Features**:
  - Traceability code generation
  - Automatic status update to "dirty"
  - Audit logging
  - Visual confirmation with animations

### 2. Dirty Workflow ✅

**Purpose**: Tools that need to go through the complete sterilization process

- **File**: `DirtyWorkflow.tsx` / `hooks/useDirtyWorkflow.ts`
- **Process**:
  1. Tool is scanned
  2. Begins sterilization cycle: Bath 1 → Bath 2 → Drying → Autoclave
  3. Each phase has timed countdown with temperature/pressure requirements
  4. Chemical and Biological indicators required for autoclave phase
- **Features**:
  - Phase-by-phase timer tracking
  - Temperature and pressure monitoring
  - CI/BI indicator requirements
  - Batch mode support
  - Tool replacement alerts

### 3. Tool Problem Workflow ✅

**Purpose**: Tools that need attention, repair, or have issues

- **File**: `ToolProblemWorkflow/index.tsx`
- **Process**:
  1. Tool is scanned
  2. Problem type is selected (damage, malfunction, etc.)
  3. Voice input for detailed notes
  4. Tool is flagged in system for attention
- **Features**:
  - Problem categorization
  - Voice input for notes
  - Visual problem indicators
  - Quarantine functionality

### 4. Packaging Workflow ✅

**Purpose**: Tools ready for packaging and batch creation

- **File**: `PackagingWorkflow.tsx` / `PackagingWorkflow/index.tsx`
- **Process**:
  1. Tools are scanned (single or batch mode)
  2. Batch ID is created
  3. Package information is entered
  4. Autoclave receipt is uploaded
  5. Batch is finalized
- **Features**:
  - Single and batch mode
  - Batch ID generation
  - Receipt upload integration
  - Package information forms
  - Session management

### 5. Import Workflow ✅

**Purpose**: Import physical autoclave cycle documentation

- **File**: `ImportWorkflow.tsx`
- **Process**:
  1. Receipt is scanned or uploaded
  2. Data is extracted and validated
  3. Information is integrated into system
- **Features**:
  - Receipt scanning
  - Data extraction
  - System integration

### 6. Two-Phase Workflow (2P) ⚠️

**Purpose**: Tools that only need Bath 1 & Bath 2 (no autoclave)

- **File**: `TwoPWorkflow.tsx`
- **Process**:
  1. Bath 1 phase
  2. Bath 2 phase
  3. Store in airtight container
- **Status**: Basic implementation (placeholder)

### 7. Damaged Workflow ⚠️

**Purpose**: Handle damaged or problematic tools

- **File**: `DamagedWorkflow.tsx`
- **Process**:
  1. Tool scanning
  2. Damage assessment
  3. Quarantine
- **Status**: Basic implementation

## Configuration

### Workflow Configuration

Located in `src/config/workflowConfig.ts`:

```typescript
export type WorkflowType =
  | 'clean'
  | 'dirty'
  | 'problem'
  | 'import'
  | 'packaging'
  | null;
```

### Phase Configuration

Each sterilization phase has defined parameters:

- **Bath 1**: 1 min, 60°C
- **Bath 2**: 1 min, 65°C
- **Drying**: 30 min, air dry
- **Autoclave**: 1 min, 121°C, 15 PSI

## Activity Tracking

### Recent Activity Types

The system tracks these activities in the analytics dashboard:

- `bi-test`: Biological indicator tests
- `bi-failure`: BI test failures
- `cycle-complete`: Completed sterilization cycles
- `tool-quarantine`: Tool quarantine events
- `regulatory-notification`: Regulatory notifications
- `tool-200-scans`: Tools hitting 200 scan milestone
- `bath-1-change`: Bath 1 solution changes
- `bath-2-change`: Bath 2 solution changes
- `autoclave-cycle-started`: New autoclave cycles
- `tool-problem-flagged`: Tool problems flagged
- `batch-id-created`: Batch ID creation

### Activity Display

Activities are displayed with:

- Distinctive icons for each type
- Timestamps with relative time
- Tool counts where applicable
- Color-coded status indicators

## State Management

### Sterilization Store

Centralized state management through Zustand store with slices:

- `biologicalIndicatorSlice.ts`: BI test tracking
- `toolManagementSlice.ts`: Tool lifecycle
- `complianceSettingsSlice.ts`: Settings and rules
- `sterilizationCycleSlice.ts`: Cycle management
- `uiStateSlice.ts`: UI state and modals

### Key Hooks

- `useSterilizationStore`: Main store access
- `useDirtyWorkflow`: Dirty workflow logic
- `usePackagingWorkflow`: Packaging workflow logic
- `useCleanWorkflow`: Clean workflow logic
- `useAnalyticsData`: Analytics data processing

## Analytics Integration

### Efficiency Tracking

- Overall efficiency trend displayed at top of analytics
- Real-time performance metrics
- Historical trend analysis
- KPI cards for key metrics

### Metrics Tracked

- Total cycles
- Completed cycles
- Average cycle time
- BI pass rate
- Tool status
- Recent activities

## File Structure

```
src/components/Sterilization/workflows/
├── CleanWorkflow.tsx                   # Clean workflow component
├── CleanWorkflow/                      # Clean workflow directory
├── DirtyWorkflow.tsx                   # Dirty workflow component
├── hooks/useDirtyWorkflow.ts           # Dirty workflow logic
├── PackagingWorkflow.tsx               # Packaging workflow component
├── PackagingWorkflow/                  # Packaging workflow directory
├── ToolProblemWorkflow/                # Problem workflow directory
├── TwoPWorkflow.tsx                    # Two-phase workflow
├── DamagedWorkflow.tsx                 # Damaged workflow
├── ImportWorkflow.tsx                  # Import workflow
├── ProblemWorkflow.tsx                 # Problem workflow
└── WorkflowComponent.tsx               # Generic workflow component
```

## Development Status

### ✅ Fully Implemented

- Clean Workflow
- Dirty Workflow
- Tool Problem Workflow
- Packaging Workflow
- Import Workflow

### ⚠️ Basic Implementation

- Two-Phase Workflow (2P)
- Damaged Workflow

### 🔄 In Progress

- Enhanced analytics integration
- Activity logging improvements
- UI/UX refinements

## Usage Examples

### Starting a Clean Workflow

```typescript
import CleanWorkflow from './CleanWorkflow';

<CleanWorkflow
  scannedData="TOOL123"
  onClose={() => setModalOpen(false)}
  toolId="tool-uuid"
/>
```

### Starting a Dirty Workflow

```typescript
import { useDirtyWorkflow } from './hooks/useDirtyWorkflow';

const { handleScan, scannedTools, isScanning } = useDirtyWorkflow({
  scannedData: 'TOOL123',
  batchMode: true,
});
```

## Contributing

When adding new workflows:

1. Update the `WorkflowType` in `workflowConfig.ts`
2. Add workflow configuration
3. Create workflow component
4. Add activity tracking types
5. Update this documentation
6. Add tests for new workflow

## Testing

Each workflow should have corresponding tests in the `__tests__` directory. Run tests with:

```bash
npm run test src/components/Sterilization/workflows/
```
