import React from 'react';
import { ExportTemplate } from '../../services/inventoryExportTemplateService';

interface ExportNowTabProps {
  templates: ExportTemplate[];
  selectedTemplate: ExportTemplate | null;
  onTemplateSelect: (template: ExportTemplate | null) => void;
  onExport: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const ExportNowTab: React.FC<ExportNowTabProps> = ({
  templates,
  selectedTemplate,
  onTemplateSelect,
  onExport,
  onCancel,
  isLoading,
}) => {
  return (
    <div>
      <div className="mb-6">
        <label
          htmlFor="export-template"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Export Template
        </label>
        <select
          id="export-template"
          value={selectedTemplate?.id || ''}
          onChange={(e) => {
            const template = templates.find(
              (t) => t.id === e.target.value
            );
            onTemplateSelect(template || null);
          }}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      {selectedTemplate && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">
            {selectedTemplate.name}
          </h3>
          {selectedTemplate.description && (
            <p className="text-sm text-gray-600 mb-3">
              {selectedTemplate.description}
            </p>
          )}
          <div className="text-sm text-gray-600">
            <p>
              <strong>Format:</strong>{' '}
              {selectedTemplate.format.toUpperCase()}
            </p>
            <p>
              <strong>Fields:</strong> {selectedTemplate.fields.length}
            </p>
            {selectedTemplate.filters &&
              selectedTemplate.filters.length > 0 && (
                <p>
                  <strong>Filters:</strong>{' '}
                  {selectedTemplate.filters.length}
                </p>
              )}
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={onExport}
          disabled={!selectedTemplate || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Exporting...' : 'Export Now'}
        </button>
      </div>
    </div>
  );
};
