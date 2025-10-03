import React from 'react';
import { EnforcementSettings } from './sterilization/EnforcementSettings';
import { CycleManagement } from './sterilization/CycleManagement';
import { ReceiptSettings } from './sterilization/ReceiptSettings';
import { AISettings } from './sterilization/AISettings';

export default function SterilizationSettingsPanel() {
  return (
    <div className="space-y-6 p-4">
      <EnforcementSettings />
      <CycleManagement />
      <ReceiptSettings />
      <AISettings />
    </div>
  );
}
