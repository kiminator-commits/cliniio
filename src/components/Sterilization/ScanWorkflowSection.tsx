import { logSterilizationEvent } from '@/utils/auditLogger';
import { PHASE_CONFIG } from '@/config/workflowConfig';

interface ScanWorkflowSectionProps {
  operator: string;
  barcode: string;
  phase: string;
  onScan: (toolId: string) => void;
}

export const ScanWorkflowSection = ({
  operator,
  barcode,
  phase,
  onScan,
}: ScanWorkflowSectionProps) => {
  const handleValidatedScan = async () => {
    const isValid = operator && barcode;
    if (!isValid) return;

    const phaseInfo = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG];

    logSterilizationEvent({
      action: 'TOOL_SCANNED',
      operator,
      toolId: barcode,
      phase,
      metadata: {
        requiresCI: phaseInfo?.requiresCI ?? false,
        requiresBI: phaseInfo?.requiresBI ?? false,
      },
    });

    onScan(barcode);
  };

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="text-sm font-medium text-blue-800 mb-2">Scan Workflow Section</h4>
      <p className="text-xs text-blue-600 mb-3">
        Operator: {operator} | Barcode: {barcode} | Phase: {phase}
      </p>
      <button
        onClick={handleValidatedScan}
        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
      >
        Validate & Scan
      </button>
    </div>
  );
};
