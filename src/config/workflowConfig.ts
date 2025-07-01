import { mdiSpray, mdiWashingMachine, mdiAlertCircle, mdiFileDocument, mdiPackage } from '@mdi/js';

/**
 * Configuration for each sterilization phase.
 *
 * Each entry in PHASE_CONFIG defines:
 * - name: Display label for the phase
 * - duration: How long the phase runs (in minutes)
 * - temperature (optional): If applicable, temperature required for compliance
 * - pressure (optional): Used only in autoclave phase
 * - requiresCI / requiresBI: Whether this phase needs chemical or biological indicators
 *
 * This config powers both the timers and audit logging system.
 */

export type WorkflowType = 'clean' | 'dirty' | 'damaged' | 'import' | 'packaging' | null;

export const workflowConfig = {
  clean: {
    title: 'Clean Tool Workflow',
    description: 'Tools that are ready to use on patients',
    icon: mdiSpray,
    color: 'green',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-800',
    isAvailable: true,
  },
  dirty: {
    title: 'Dirty Tool Workflow',
    description: 'Tools that are ready to go through the cleaning process',
    icon: mdiWashingMachine,
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    isAvailable: true,
  },
  damaged: {
    title: 'Damaged Tool Workflow',
    description: 'Tools that need repair or replacement',
    icon: mdiAlertCircle,
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    isAvailable: true,
  },
  import: {
    title: 'Import Autoclave Receipt',
    description: 'Import physical autoclave cycle documentation',
    icon: mdiFileDocument,
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800',
    isAvailable: true,
  },
  packaging: {
    title: 'Packaging Workflow',
    description: 'Tools that are ready for packaging',
    icon: mdiPackage,
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    isAvailable: true,
  },
  default: {
    label: 'Default Workflow',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    icon: '🛠️',
    isAvailable: false,
    permissions: [],
  },
};

const validatePhase = (
  phase: { duration: number; temperature?: number; pressure?: number },
  name: string
) => {
  if (phase.duration <= 0) throw new Error(`${name} has invalid duration`);
  if (phase.temperature !== undefined && (phase.temperature < 30 || phase.temperature > 150)) {
    throw new Error(`${name} has unsafe temperature`);
  }
  if (phase.pressure !== undefined && (phase.pressure < 5 || phase.pressure > 30)) {
    throw new Error(`${name} has unsafe pressure`);
  }
};

export const PHASE_CONFIG = {
  bath1: {
    name: 'Bath 1',
    duration: 30,
    temperature: 60,
    requiresCI: false,
    requiresBI: false,
    requiresCiStrip: false,
    requiresBiTest: false,
  },
  bath2: {
    name: 'Bath 2',
    duration: 30,
    temperature: 65,
    requiresCI: false,
    requiresBI: false,
    requiresCiStrip: false,
    requiresBiTest: false,
  },
  drying: {
    name: 'Drying',
    duration: 60,
    requiresCI: false,
    requiresBI: false,
    requiresCiStrip: false,
    requiresBiTest: false,
  },
  autoclave: {
    name: 'Autoclave',
    duration: 48,
    temperature: 121,
    pressure: 15,
    requiresCI: true,
    requiresBI: true,
    requiresCiStrip: true,
    requiresBiTest: true,
  },
};

Object.entries(PHASE_CONFIG).forEach(([key, phase]) => {
  validatePhase(phase, key);
});

export const sterilizationPhases = {
  bath1: { label: 'Bath 1', duration: 1800 }, // 30 mins
  bath2: { label: 'Bath 2', duration: 1800 },
  drying: { label: 'Drying', duration: 3600 },
  autoclave: { label: 'Autoclave', duration: 2880 }, // 48 mins
};

export type SterilizationPhaseId = keyof typeof sterilizationPhases;
