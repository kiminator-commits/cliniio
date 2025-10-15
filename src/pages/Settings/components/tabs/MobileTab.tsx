import React, { useState, useEffect, useCallback } from 'react';
import Icon from '@mdi/react';
import {
  mdiBarcode,
  mdiTestTube,
  mdiBroom,
  mdiFileDocument,
  mdiPackage,
  mdiPlus,
  mdiMinus,
  mdiAlertCircle,
} from '@mdi/js';
import ToggleSwitch from '../InventoryManagementSettings/ToggleSwitch';
import { supabase } from '../../../../lib/supabase';

interface WorkflowShortcut {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  shortcutSlot: string | null;
}

interface MobileTabProps {
  mobileShortcuts: Array<Record<string, unknown>>;
  setMobileShortcuts: React.Dispatch<
    React.SetStateAction<Array<Record<string, unknown>>>
  >;
  availableShortcuts: Array<Record<string, unknown>>;
}

export const MobileTab: React.FC<MobileTabProps> = () => {
  // Available workflow shortcuts
  const [workflowShortcuts, setWorkflowShortcuts] = useState<
    WorkflowShortcut[]
  >([
    {
      id: 'clean-tool',
      name: 'Clean Tool Scan',
      description: 'Scan clean tools ready for use',
      icon: mdiTestTube,
      enabled: false,
      shortcutSlot: null,
    },
    {
      id: 'dirty-tool',
      name: 'Dirty Tool Scan',
      description: 'Scan tools that need sterilization',
      icon: mdiTestTube,
      enabled: false,
      shortcutSlot: null,
    },
    {
      id: 'problem-tool',
      name: 'Problem Tool Scan',
      description: 'Scan tools with issues/repair needs',
      icon: mdiAlertCircle,
      enabled: false,
      shortcutSlot: null,
    },
    {
      id: 'import-receipt',
      name: 'Import Autoclave Receipt',
      description: 'Import physical autoclave documentation',
      icon: mdiFileDocument,
      enabled: false,
      shortcutSlot: null,
    },
    {
      id: 'package-tools',
      name: 'Package Tools',
      description: 'Package tools for sterilization',
      icon: mdiPackage,
      enabled: false,
      shortcutSlot: null,
    },
    {
      id: 'single-scan',
      name: 'Single Scan Mode',
      description: 'Individual tool scanning',
      icon: mdiBarcode,
      enabled: false,
      shortcutSlot: null,
    },
    {
      id: 'batch-scan',
      name: 'Batch Scan Mode',
      description: 'Multiple tools at once',
      icon: mdiBarcode,
      enabled: false,
      shortcutSlot: null,
    },
    {
      id: 'add-inventory',
      name: 'Add Inventory',
      description: 'Scan new items to add',
      icon: mdiPlus,
      enabled: false,
      shortcutSlot: null,
    },
    {
      id: 'use-inventory',
      name: 'Use Inventory',
      description: 'Scan items to remove/consume',
      icon: mdiMinus,
      enabled: false,
      shortcutSlot: null,
    },
    {
      id: 'scan-room',
      name: 'Scan Room',
      description: 'Scan room barcodes for cleaning',
      icon: mdiBroom,
      enabled: false,
      shortcutSlot: null,
    },
    {
      id: 'complete-cleaning',
      name: 'Complete Cleaning',
      description: 'Mark room as cleaned',
      icon: mdiBroom,
      enabled: false,
      shortcutSlot: null,
    },
    {
      id: 'update-status',
      name: 'Update Status',
      description: 'Change room cleaning status',
      icon: mdiBroom,
      enabled: false,
      shortcutSlot: null,
    },
  ]);

  const handleWorkflowToggle = (workflowId: string, enabled: boolean) => {
    if (enabled) {
      // When enabling, check if there are available shortcuts
      const availableShortcuts = getAvailableShortcuts();
      if (availableShortcuts.length === 0) {
        alert(
          'No mobile shortcuts available. Please disable another workflow first or assign this workflow to an existing shortcut.'
        );
        return;
      }
    }

    setWorkflowShortcuts((prev) =>
      prev.map((workflow) =>
        workflow.id === workflowId
          ? {
              ...workflow,
              enabled,
              shortcutSlot: enabled ? workflow.shortcutSlot : null,
            }
          : workflow
      )
    );
  };

  const getAvailableShortcuts = () => {
    const usedShortcuts = workflowShortcuts
      .filter((w) => w.enabled && w.shortcutSlot !== null)
      .map((w) => w.shortcutSlot);

    const allShortcuts = [
      'volume-up',
      'volume-down',
      'volume-up-double',
      'volume-down-double',
      'power-double',
      'double-tap',
      'shake',
      'flip',
    ];

    return allShortcuts.filter((shortcut) => !usedShortcuts.includes(shortcut));
  };

  const handleShortcutSlotChange = (
    workflowId: string,
    slot: string | null
  ) => {
    if (slot === null) {
      // If no slot is selected, disable the workflow after a delay
      setTimeout(() => {
        setWorkflowShortcuts((prev) =>
          prev.map((workflow) =>
            workflow.id === workflowId && workflow.shortcutSlot === null
              ? { ...workflow, enabled: false }
              : workflow
          )
        );
      }, 5000); // 5 second delay
    }

    // Clear any other workflows using this slot
    setWorkflowShortcuts((prev) =>
      prev.map((workflow) =>
        workflow.shortcutSlot === slot && workflow.id !== workflowId
          ? { ...workflow, shortcutSlot: null }
          : workflow.id === workflowId
            ? { ...workflow, shortcutSlot: slot }
            : workflow
      )
    );
  };

  const getShortcutLabel = (shortcutId: string) => {
    const shortcuts = [
      { id: 'volume-up', label: 'Volume Up' },
      { id: 'volume-down', label: 'Volume Down' },
      { id: 'volume-up-double', label: 'Volume Up (2x)' },
      { id: 'volume-down-double', label: 'Volume Down (2x)' },
      { id: 'power-double', label: 'Power (2x)' },
      { id: 'double-tap', label: 'Double Tap' },
      { id: 'shake', label: 'Shake' },
      { id: 'flip', label: 'Flip' },
    ];
    return shortcuts.find((s) => s.id === shortcutId)?.label || shortcutId;
  };

  // Load mobile shortcuts from Supabase
  const loadMobileShortcuts = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('users')
        .select('mobile_shortcuts')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        return;
      }

      if (data?.mobile_shortcuts && typeof data.mobile_shortcuts === 'object') {
        // Update workflow shortcuts with saved data
        setWorkflowShortcuts((prev) =>
          prev.map((workflow) => {
            const shortcuts = data.mobile_shortcuts as Record<
              string,
              { enabled: boolean; shortcut: string }
            >;
            const saved = shortcuts[workflow.id];
            return saved
              ? {
                  ...workflow,
                  enabled: saved.enabled,
                  shortcutSlot: saved.shortcut,
                }
              : workflow;
          })
        );
      }
    } catch {
      // TODO: handle error
    }
  };

  // Save mobile shortcuts to Supabase
  const saveMobileShortcuts = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Convert workflow shortcuts to saveable format
      const shortcutsToSave = workflowShortcuts.reduce(
        (acc, workflow) => {
          if (workflow.enabled && workflow.shortcutSlot) {
            acc[workflow.id] = {
              enabled: workflow.enabled,
              shortcut: workflow.shortcutSlot,
            };
          }
          return acc;
        },
        {} as Record<string, { enabled: boolean; shortcut: string }>
      );

      const { error } = await supabase
        .from('users')
        .update({
          mobile_shortcuts: shortcutsToSave,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving mobile settings:', error);
      } else {
        console.log('Mobile settings saved successfully');
      }
    } catch {
      // TODO: handle error
    }
  }, [workflowShortcuts]);

  // Load shortcuts on component mount
  useEffect(() => {
    // Use setTimeout to avoid calling setState synchronously in effect
    setTimeout(() => {
      loadMobileShortcuts();
    }, 0);
  }, []);

  // Save shortcuts whenever they change
  useEffect(() => {
    if (workflowShortcuts.some((w) => w.enabled)) {
      saveMobileShortcuts();
    }
  }, [workflowShortcuts, saveMobileShortcuts]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h5 className="text-md font-medium text-gray-700 mb-4">
          Mobile Scanner Shortcuts
        </h5>
        <p className="text-sm text-gray-600 mb-4">
          Configure up to 4 mobile shortcuts for quick access to your most-used
          scanning workflows.
        </p>

        {/* Workflow Shortcuts Configuration */}
        <div className="space-y-4">
          {workflowShortcuts.map((workflow) => (
            <div
              key={workflow.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex items-center space-x-3">
                <Icon
                  path={workflow.icon}
                  size={1.2}
                  className="text-gray-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {workflow.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {workflow.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">Enable</span>
                  <ToggleSwitch
                    id={`toggle-${workflow.id}`}
                    label={`Enable ${workflow.name}`}
                    checked={workflow.enabled}
                    onChange={(checked) =>
                      handleWorkflowToggle(workflow.id, checked)
                    }
                  />
                </div>

                {/* Shortcut Slot Dropdown */}
                {workflow.enabled && (
                  <div className="space-y-2">
                    <select
                      value={workflow.shortcutSlot || ''}
                      onChange={(e) =>
                        handleShortcutSlotChange(
                          workflow.id,
                          e.target.value ? e.target.value : null
                        )
                      }
                      className={`px-3 py-1 border rounded text-sm ${
                        !workflow.shortcutSlot
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select Shortcut</option>
                      {[
                        {
                          id: 'volume-up',
                          label: 'Volume Up (Single Press)',
                          description: 'Press volume up button once',
                        },
                        {
                          id: 'volume-down',
                          label: 'Volume Down (Single Press)',
                          description: 'Press volume down button once',
                        },
                        {
                          id: 'volume-up-double',
                          label: 'Volume Up (Double Press)',
                          description: 'Press volume up button twice quickly',
                        },
                        {
                          id: 'volume-down-double',
                          label: 'Volume Down (Double Press)',
                          description: 'Press volume down button twice quickly',
                        },
                        {
                          id: 'power-double',
                          label: 'Power Button (Double Press)',
                          description: 'Press power button twice quickly',
                        },
                        {
                          id: 'double-tap',
                          label: 'Double Tap Screen',
                          description: 'Tap screen twice quickly',
                        },
                        {
                          id: 'shake',
                          label: 'Shake Device',
                          description: 'Shake your phone',
                        },
                        {
                          id: 'flip',
                          label: 'Flip Device',
                          description: 'Turn phone face down',
                        },
                      ].map((shortcut) => (
                        <option
                          key={shortcut.id}
                          value={shortcut.id}
                          disabled={workflowShortcuts.some(
                            (w) =>
                              w.id !== workflow.id &&
                              w.shortcutSlot === shortcut.id
                          )}
                        >
                          {shortcut.label}
                        </option>
                      ))}
                    </select>
                    {!workflow.shortcutSlot && (
                      <p className="text-xs text-red-500">
                        ⚠️ Please select a mobile shortcut or this workflow will
                        be disabled in 5 seconds
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Current Shortcuts Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h6 className="text-sm font-medium text-blue-700 mb-3">
            Current Shortcuts
          </h6>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {workflowShortcuts
              .filter((w) => w.enabled && w.shortcutSlot)
              .map((workflow) => (
                <div key={workflow.id} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Icon
                      path={workflow.icon}
                      size={1.2}
                      className="text-blue-600"
                    />
                  </div>
                  <p className="text-xs text-blue-700 font-medium">
                    {workflow.name}
                  </p>
                  <p className="text-xs text-blue-500">
                    {getShortcutLabel(workflow.shortcutSlot!)}
                  </p>
                </div>
              ))}
            {workflowShortcuts.filter((w) => w.enabled && w.shortcutSlot)
              .length === 0 && (
              <div className="col-span-2 md:col-span-4 text-center py-4">
                <p className="text-blue-500 text-sm">
                  No shortcuts configured yet
                </p>
                <p className="text-blue-400 text-xs">
                  Enable workflows and assign mobile shortcuts above
                </p>
              </div>
            )}
          </div>
        </div>

        {/* How to Use Section */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h6 className="text-sm font-medium text-gray-700 mb-3">
            How to Use Mobile Shortcuts
          </h6>
          <div className="text-sm text-gray-600 space-y-2">
            <p>
              • <strong>Enable workflows:</strong> Use the toggles for scanning
              workflows you use frequently
            </p>
            <p>
              • <strong>Assign shortcuts:</strong> Choose mobile device actions
              (volume buttons, double tap, shake, etc.)
            </p>
            <p>
              • <strong>Mobile access:</strong> These shortcuts will trigger on
              your mobile device for quick scanning
            </p>
            <p>
              • <strong>Unique assignments:</strong> Each mobile shortcut can
              only be used by one workflow
            </p>
            <p>
              • <strong>Quick launch:</strong> Perform the assigned action to
              directly open that scanner workflow
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
