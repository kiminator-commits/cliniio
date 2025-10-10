import React from 'react';
import { EnforcementSettings } from './sterilization/EnforcementSettings';
// ✅ Added PackagingSettings below CI toggle and above Autoclave Cycle Customization
import { PackagingSettings } from './sterilization/PackagingSettings';
import { CycleManagement } from './sterilization/CycleManagement';
import { ReceiptSettings } from './sterilization/ReceiptSettings';
import { AISettings } from './sterilization/AISettings';

export default function SterilizationSettingsPanel() {
  return (
    <div className="space-y-6 p-4">
      <EnforcementSettings />
      {/* ✅ Packaging Settings Section */}
      <div className="mt-6 border-t border-gray-200 pt-6">
        <PackagingSettings />
      </div>
      <CycleManagement />
      <ReceiptSettings />
      <AISettings />
    </div>
  );
}
