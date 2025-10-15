import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiClose, mdiCheck } from '@mdi/js';
import { StatusType } from '../../store/statusTypesStore';

interface StatusCreationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (status: Omit<StatusType, 'id'>) => Promise<void>;
  existingStatuses: StatusType[];
}

// Predefined simple icons
const SIMPLE_ICONS = [
  { name: 'check-circle', label: 'Check Circle', path: 'mdiCheckCircle' },
  {
    name: 'exclamation-triangle',
    label: 'Warning',
    path: 'mdiExclamationTriangle',
  },
  { name: 'pause-circle', label: 'Pause', path: 'mdiPauseCircle' },
  { name: 'clock', label: 'Clock', path: 'mdiClock' },
  { name: 'shield', label: 'Shield', path: 'mdiShield' },
  { name: 'wrench', label: 'Wrench', path: 'mdiWrench' },
  { name: 'heart', label: 'Heart', path: 'mdiHeart' },
  { name: 'star', label: 'Star', path: 'mdiStar' },
  { name: 'flag', label: 'Flag', path: 'mdiFlag' },
  { name: 'home', label: 'Home', path: 'mdiHome' },
];

// Predefined simple colors
const SIMPLE_COLORS = [
  {
    name: 'Green',
    value: '#16a34a',
    bgClass: 'bg-green-100',
    textClass: 'text-green-600',
  },
  {
    name: 'Red',
    value: '#dc2626',
    bgClass: 'bg-red-100',
    textClass: 'text-red-600',
  },
  {
    name: 'Yellow',
    value: '#ca8a04',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-600',
  },
  {
    name: 'Blue',
    value: '#3b82f6',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-600',
  },
  {
    name: 'Purple',
    value: '#9333ea',
    bgClass: 'bg-purple-100',
    textClass: 'text-purple-600',
  },
  {
    name: 'Orange',
    value: '#ea580c',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-600',
  },
  {
    name: 'Gray',
    value: '#6b7280',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
  },
  {
    name: 'Pink',
    value: '#ec4899',
    bgClass: 'bg-pink-100',
    textClass: 'text-pink-600',
  },
];

const StatusCreationForm: React.FC<StatusCreationFormProps> = ({
  isOpen,
  onClose,
  onSave,
  existingStatuses,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'check-circle',
    color: '#16a34a',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors([]);
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];

    // Check for empty name
    if (!formData.name.trim()) {
      newErrors.push('Status name is required');
    }

    // Check for 1-word limit
    const words = formData.name.trim().split(/\s+/);
    if (words.length > 1) {
      newErrors.push('Status name must be 1 word only');
    }

    // Check for minimum length
    if (formData.name.trim().length < 2) {
      newErrors.push('Status name must be at least 2 characters');
    }

    // Check for maximum length
    if (formData.name.trim().length > 20) {
      newErrors.push('Status name must be less than 20 characters');
    }

    // Check for duplicates
    const existingNames = existingStatuses.map((s) => s.name.toLowerCase());
    if (existingNames.includes(formData.name.toLowerCase())) {
      newErrors.push('A status with this name already exists');
    }

    // Check for special characters (only letters and numbers allowed)
    if (!/^[a-zA-Z0-9]+$/.test(formData.name.trim())) {
      newErrors.push('Status name can only contain letters and numbers');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      await onSave({
        name: formData.name.trim(),
        description:
          formData.description.trim() || `${formData.name.trim()} status`,
        icon: formData.icon,
        color: formData.color,
        isDefault: false,
        isCore: false,
        isPublished: true, // New statuses are published by default
        category: 'custom',
        requiresVerification: false,
        autoTransition: false,
        alertLevel: 'low',
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        icon: 'check-circle',
        color: '#16a34a',
      });
      onClose();
    } catch (error) {
      console.error('Error saving status:', error);
      setErrors(['Failed to save status. Please try again.']);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Create Custom Status
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon path={mdiClose} size={1.2} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Status Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Clean, Dirty, Maintenance"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              maxLength={20}
            />
            <p className="text-xs text-gray-500 mt-1">
              One word only, letters and numbers
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Brief description of this status"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              rows={2}
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {SIMPLE_ICONS.map((icon) => (
                <button
                  key={icon.name}
                  onClick={() => handleInputChange('icon', icon.name)}
                  className={`p-2 rounded-md border-2 transition-colors ${
                    formData.icon === icon.name
                      ? 'border-[#4ECDC4] bg-[#4ECDC4]/10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={icon.label}
                >
                  <Icon
                    path={icon.path as string}
                    size={1}
                    className={
                      formData.icon === icon.name
                        ? 'text-[#4ECDC4]'
                        : 'text-gray-600'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SIMPLE_COLORS.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleInputChange('color', color.value)}
                  className={`p-3 rounded-md border-2 transition-colors ${
                    formData.color === color.value
                      ? 'border-gray-400'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={color.name}
                >
                  <div
                    className={`w-full h-6 rounded ${color.bgClass} flex items-center justify-center`}
                  >
                    <Icon
                      path={mdiCheck}
                      size={0.8}
                      className={color.textClass}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview
            </label>
            <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${formData.color}20` }}
                >
                  <Icon
                    path={
                      (SIMPLE_ICONS.find((i) => i.name === formData.icon)
                        ?.path as string) || 'mdiCheckCircle'
                    }
                    size={0.8}
                    color={formData.color}
                  />
                </div>
                <span className="font-medium text-gray-800">
                  {formData.name || 'Status Name'}
                </span>
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <ul className="text-sm text-red-600 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
              className={`px-4 py-2 rounded-md transition-colors ${
                isSaving || !formData.name.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-[#4ECDC4] text-white hover:bg-[#3db8b0]'
              }`}
            >
              {isSaving ? 'Creating...' : 'Create Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusCreationForm;
