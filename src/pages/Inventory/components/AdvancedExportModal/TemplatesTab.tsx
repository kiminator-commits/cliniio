import React from 'react';
import { ExportTemplate } from '../../services/inventoryExportTemplateService';

interface TemplatesTabProps {
  templates: ExportTemplate[];
  onTemplateSelect: (template: ExportTemplate) => void;
  onTabChange: (tab: 'export' | 'schedule' | 'templates') => void;
}

export const TemplatesTab: React.FC<TemplatesTabProps> = ({
  templates,
  onTemplateSelect,
  onTabChange,
}) => {
  const handleUseTemplate = (template: ExportTemplate) => {
    onTemplateSelect(template);
    onTabChange('export');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Export Templates</h3>
      </div>

      <div className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="p-4 border border-gray-200 rounded-lg"
          >
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                {template.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {template.description}
                  </p>
                )}
                <div className="text-sm text-gray-600 mt-2">
                  <p>
                    <strong>Format:</strong> {template.format.toUpperCase()}
                  </p>
                  <p>
                    <strong>Fields:</strong> {template.fields.length}
                  </p>
                  {template.filters && template.filters.length > 0 && (
                    <p>
                      <strong>Filters:</strong> {template.filters.length}
                    </p>
                  )}
                  {template.isDefault && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                      Default
                    </span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleUseTemplate(template)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded"
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
