import { useSterilizationStore } from '@/store/sterilizationStore';

export default function SterilizationSettingsPanel() {
  const { enforceBI, enforceCI, toggleEnforceBI, toggleEnforceCI } = useSterilizationStore();

  return (
    <div className="space-y-6 p-4">
      <h2 className="text-xl font-semibold">Sterilization Enforcement</h2>

      <div className="flex items-center justify-between">
        <label htmlFor="enforceBI" className="text-sm font-medium">
          Require Daily BI Tests
        </label>
        <input
          id="enforceBI"
          type="checkbox"
          checked={enforceBI}
          onChange={toggleEnforceBI}
          className="toggle toggle-primary"
        />
      </div>

      <div className="flex items-center justify-between">
        <label htmlFor="enforceCI" className="text-sm font-medium">
          Require CI Strip Verification
        </label>
        <input
          id="enforceCI"
          type="checkbox"
          checked={enforceCI}
          onChange={toggleEnforceCI}
          className="toggle toggle-primary"
        />
      </div>
    </div>
  );
}
