import React from 'react';
import { Modal } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronRight } from '@mdi/js';
import LocationPicker from '../forms/LocationPicker';
import {
  ModalConfig,
  SectionConfig,
  FormFieldConfig,
} from '@/config/modalConfig';
import { ExpandedSections } from '@/types/inventoryTypes';
import { InventoryFormData } from '@/types/inventory';

/**
 * Props for ModalContent component
 */
interface ModalContentProps {
  modalConfig: ModalConfig;
  show: boolean;
  onHide: () => void;
  formData: InventoryFormData;
  isEditMode: boolean;
  expandedSections: ExpandedSections;
  toggleSection: (section: string) => void;
  handleFormChange: (field: string, value: string) => void;
  onSave?: () => void;
  progressInfo?: {
    current: number;
    total: number;
    currentItemName: string;
  };
  sections?: SectionConfig[];
  children?: React.ReactNode;
}

/**
 * Renders a form field based on its configuration
 */
const FormField: React.FC<{
  field: FormFieldConfig;
  value: string;
  onChange: (value: string) => void;
}> = ({ field, value, onChange }) => {
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    onChange(e.target.value);
  };

  switch (field.type) {
    case 'text':
      return (
        <input
          type="text"
          className="form-control py-1 px-2 text-sm"
          placeholder={field.placeholder}
          value={value || ''}
          onChange={handleChange}
          required={field.required}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          className="form-control py-1 px-2 text-sm"
          placeholder={field.placeholder}
          value={value || ''}
          onChange={handleChange}
          required={field.required}
          min={field.validation?.min}
          max={field.validation?.max}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          className="form-control py-1 px-2 text-sm"
          value={value || ''}
          onChange={handleChange}
          required={field.required}
        />
      );

    case 'select':
      return (
        <select
          className="form-select py-1 px-2 text-sm"
          value={value || ''}
          onChange={handleChange}
          required={field.required}
        >
          <option value="">Select {field.label.toLowerCase()}</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      );

    case 'textarea':
      return (
        <textarea
          className="form-control py-1 px-2 text-sm"
          placeholder={field.placeholder}
          rows={2}
          value={value || ''}
          onChange={handleChange}
          required={field.required}
        />
      );

    case 'location':
      return <LocationPicker value={value || ''} onChange={onChange} />;

    default:
      return null;
  }
};

/**
 * Renders a collapsible section with form fields
 */
const FormSection: React.FC<{
  section: SectionConfig;
  expanded: boolean;
  onToggle: () => void;
  formData: InventoryFormData;
  handleFormChange: (field: string, value: string) => void;
}> = ({ section, expanded, onToggle, formData, handleFormChange }) => {
  return (
    <div className="mb-3 border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
      >
        <h3 className="text-base font-semibold text-gray-800">
          {section.title}
        </h3>
        <Icon
          path={expanded ? mdiChevronDown : mdiChevronRight}
          size={1}
          className="text-gray-600"
        />
      </button>
      {expanded && (
        <div className="p-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-3">
            {section.fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={`modal-${field.name}`}
                  className="block text-xs font-medium text-gray-700 mb-1"
                >
                  {field.label}
                </label>
                <FormField
                  field={field}
                  value={
                    (formData[
                      field.name as keyof InventoryFormData
                    ] as string) || ''
                  }
                  onChange={(value) => handleFormChange(field.name, value)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ModalContent component that renders modal content based on configuration
 */
const ModalContent: React.FC<ModalContentProps> = ({
  modalConfig,
  show,
  onHide,
  formData,
  isEditMode,
  expandedSections,
  toggleSection,
  handleFormChange,
  onSave,
  progressInfo,
  sections,
  children,
}) => {
  // Determine modal title based on edit mode
  const modalTitle = isEditMode ? 'Edit Item' : modalConfig.title;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size={modalConfig.size}
      centered={modalConfig.centered}
      backdrop={modalConfig.backdrop}
      keyboard={modalConfig.keyboard}
      scrollable={modalConfig.scrollable}
      className={modalConfig.className}
    >
      <Modal.Header closeButton>
        <Modal.Title className="flex items-center gap-3">
          {modalTitle}
          {progressInfo && (
            <div className="text-sm text-gray-500 font-normal">
              ({progressInfo.current} of {progressInfo.total}){' '}
              {progressInfo.currentItemName}
            </div>
          )}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="max-h-[70vh] overflow-y-auto">
        {progressInfo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                Processing scanned items: {progressInfo.current} of{' '}
                {progressInfo.total}
              </span>
              <span className="text-xs text-blue-600">
                {Math.round((progressInfo.current / progressInfo.total) * 100)}%
                complete
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(progressInfo.current / progressInfo.total) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}

        <div
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <form>
            {/* Render sections if provided */}
            {sections?.map((section) => (
              <FormSection
                key={section.id}
                section={section}
                expanded={
                  expandedSections[
                    section.id as keyof typeof expandedSections
                  ] || false
                }
                onToggle={() => toggleSection(section.id)}
                formData={formData}
                handleFormChange={handleFormChange}
              />
            ))}

            {/* Render custom children if provided */}
            {children}
          </form>
        </div>
      </Modal.Body>

      <Modal.Footer className="pt-2">
        <button
          onClick={onHide}
          className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          Cancel
        </button>
        {onSave && (
          <button
            onClick={onSave}
            className="bg-[#4ECDC4] hover:bg-[#3db8b0] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {isEditMode ? 'Update Item' : 'Save Item'}
          </button>
        )}
        {/* Show close button after successful save */}
        <button
          onClick={onHide}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200 ml-2"
        >
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalContent;
