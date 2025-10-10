import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import Input from '../../../../components/ui/input';
import Label from '../../../../components/ui/label';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Switch } from '../../../../components/ui/switch';
import { useUser } from '../../../../contexts/UserContext';

// ✅ Packaging Settings Component
export const PackagingSettings: React.FC = () => {
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [packageTypes, setPackageTypes] = useState<string[]>([
    'pouch',
    'wrap',
    'container',
    'tray',
  ]);
  const [packageSizes, setPackageSizes] = useState<string[]>([
    'small',
    'medium',
    'large',
    'extra-large',
  ]);
  const [requireReceiptUpload, setRequireReceiptUpload] = useState(false);
  const [batchPrefix, setBatchPrefix] = useState('PKG-');
  const [maxToolsPerBatch, setMaxToolsPerBatch] = useState(25);

  // Load saved settings from Supabase
  useEffect(() => {
    const loadSettings = async () => {
      try {
        if (!currentUser) return;
        const { data, error } = await supabase
          .from('facility_settings')
          .select('packaging_settings')
          .eq('facility_id', currentUser.facility_id)
          .single();

        if (error) console.warn('No existing packaging settings found');
        if (data?.packaging_settings) {
          const settings = data.packaging_settings;
          setPackageTypes((prev) => settings.packageTypes || prev);
          setPackageSizes((prev) => settings.packageSizes || prev);
          setRequireReceiptUpload(!!settings.requireReceiptUpload);
          setBatchPrefix((prev) => settings.batchPrefix || prev);
          setMaxToolsPerBatch((prev) => settings.maxToolsPerBatch || prev);
        }
        setFacilityId(currentUser.facility_id);
      } catch (err) {
        console.error('Error loading packaging settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [currentUser]);

  // Save updated settings to Supabase
  const saveSettings = async () => {
    if (!facilityId) return;
    setLoading(true);
    const payload = {
      packageTypes,
      packageSizes,
      requireReceiptUpload,
      batchPrefix,
      maxToolsPerBatch,
    };
    const { error } = await supabase
      .from('facility_settings')
      .update({ packaging_settings: payload })
      .eq('facility_id', facilityId);

    if (error) console.error('Error saving packaging settings:', error);
    setLoading(false);
  };

  const togglePackageType = (type: string) => {
    setPackageTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const togglePackageSize = (size: string) => {
    setPackageSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  if (loading)
    return (
      <p className="text-sm text-gray-500">Loading packaging settings...</p>
    );

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">📦 Packaging Settings</h3>

      <div className="space-y-4">
        <div>
          <Label className="font-medium">Available Package Types</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['pouch', 'wrap', 'container', 'tray'].map((type) => (
              <label key={type} className="flex items-center space-x-2">
                <Checkbox
                  checked={packageTypes.includes(type)}
                  onCheckedChange={() => togglePackageType(type)}
                />
                <span className="capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label className="font-medium">Available Package Sizes</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {['small', 'medium', 'large', 'extra-large'].map((size) => (
              <label key={size} className="flex items-center space-x-2">
                <Checkbox
                  checked={packageSizes.includes(size)}
                  onCheckedChange={() => togglePackageSize(size)}
                />
                <span className="capitalize">{size}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="font-medium">Require Receipt Upload</Label>
          <Switch
            checked={requireReceiptUpload}
            onCheckedChange={setRequireReceiptUpload}
          />
        </div>

        <div>
          <Label className="font-medium">Batch Code Prefix</Label>
          <Input
            value={batchPrefix}
            onChange={(e) => setBatchPrefix(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="font-medium">Max Tools per Batch</Label>
          <Input
            type="number"
            value={maxToolsPerBatch}
            onChange={(e) => setMaxToolsPerBatch(parseInt(e.target.value, 10))}
            className="mt-1"
          />
        </div>

        <button
          onClick={saveSettings}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};
