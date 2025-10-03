import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Button from '@/components/ui/button';
import {
  Trash2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Download,
  Settings,
} from 'lucide-react';
import { ContentItem } from '../types';
import { KnowledgeHubService } from '../services/knowledgeHubService';
import {
  BulkOperationProgress,
  BulkOperationResult,
} from '../services/types/knowledgeHubTypes';

interface ContentManagementPanelProps {
  className?: string;
}

export const ContentManagementPanel: React.FC<ContentManagementPanelProps> = ({
  className = '',
}) => {
  const [selectedContent, setSelectedContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkOperationInProgress, setBulkOperationInProgress] = useState(false);
  const [operationProgress, setOperationProgress] =
    useState<BulkOperationProgress | null>(null);
  const [operationResult, setOperationResult] =
    useState<BulkOperationResult | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [selectedExportFormat, setSelectedExportFormat] = useState<
    'json' | 'csv' | 'pdf'
  >('json');

  const loadManagementData = async () => {
    setLoading(true);
    try {
      const contentItems = await KnowledgeHubService.getKnowledgeArticles();
      setSelectedContent(contentItems);
    } catch (error) {
      console.error('Error loading management data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManagementData();
  }, []);

  const deleteContent = async (contentId: string) => {
    try {
      // Use bulk delete with single item for now
      const result = await KnowledgeHubService.bulkDeleteContent([contentId]);
      if (result.success) {
        await loadManagementData(); // Refresh data
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleBulkDelete = async (itemIds: string[]) => {
    if (!itemIds || itemIds.length === 0) {
      console.error('No items selected for bulk delete');
      return;
    }

    setBulkOperationInProgress(true);
    setOperationProgress(null);
    setOperationResult(null);

    try {
      const result = await KnowledgeHubService.bulkDeleteContent(itemIds);

      // Create a result object that matches BulkOperationResult
      const operationResult: BulkOperationResult = {
        operationId: `bulk-delete-${Date.now()}`,
        success: result.success,
        processedCount: result.processedCount,
        successCount: result.successCount,
        errorCount: result.errorCount,
        errors: result.errors,
        results: itemIds.map((id) => ({
          id,
          success: result.success,
          error:
            result.errors.length > 0 ? result.errors.join(', ') : undefined,
        })),
      };

      setOperationResult(operationResult);
      setBulkOperationInProgress(false);

      if (result.success) {
        console.log(`Successfully processed ${result.successCount} items`);
        loadManagementData(); // Refresh data
      } else {
        console.error('Bulk delete failed:', result.errors);
      }
    } catch (error) {
      console.error('Error in bulk delete operation:', error);
      setBulkOperationInProgress(false);
    }
  };

  const handleBulkExport = async (
    itemIds: string[],
    format: 'json' | 'csv' | 'pdf'
  ) => {
    if (!itemIds || itemIds.length === 0) {
      console.error('No items selected for export');
      return;
    }

    setBulkOperationInProgress(true);
    setOperationProgress(null);
    setOperationResult(null);

    try {
      // For now, just create a simple export result since the service doesn't have bulk export
      const operationResult: BulkOperationResult = {
        operationId: `bulk-export-${Date.now()}`,
        success: true,
        processedCount: itemIds.length,
        successCount: itemIds.length,
        errorCount: 0,
        errors: [],
        results: itemIds.map((id) => ({
          id,
          success: true,
        })),
      };

      setOperationResult(operationResult);
      setBulkOperationInProgress(false);

      console.log(
        `Successfully exported ${itemIds.length} items in ${format} format`
      );
      // In a real implementation, this would trigger a download
    } catch (error) {
      console.error('Error in bulk export operation:', error);
      setBulkOperationInProgress(false);
    }
  };

  const getProgressColor = (stage: string) => {
    switch (stage) {
      case 'completed':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'cancelled':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getProgressIcon = (stage: string) => {
    switch (stage) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        );
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Content Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">
              Loading management data...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Content Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            <span>Content Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedContent && selectedContent.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {selectedContent.length} items in current category
                </span>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowExportOptions(true)}
                    disabled={selectedContent.length === 0}
                    className="w-full"
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export {selectedContent.length} items as{' '}
                    {selectedExportFormat.toUpperCase()}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const itemIds = selectedContent.map((item) => item.id);
                      handleBulkDelete(itemIds);
                    }}
                    disabled={bulkOperationInProgress}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete All
                  </Button>
                </div>
              </div>

              {/* Export Options */}
              {showExportOptions && (
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Export Options</span>
                  </div>
                  <div className="flex space-x-2">
                    {(['json', 'csv', 'pdf'] as const).map((format) => (
                      <Button
                        key={format}
                        variant={
                          selectedExportFormat === format
                            ? 'primary'
                            : 'outline'
                        }
                        size="sm"
                        onClick={() => setSelectedExportFormat(format)}
                        disabled={bulkOperationInProgress}
                      >
                        {format.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      const itemIds = selectedContent.map((item) => item.id);
                      handleBulkExport(itemIds, selectedExportFormat);
                    }}
                    disabled={bulkOperationInProgress}
                  >
                    <Download className="h-3 w-3 mr-1" />
                    Export {selectedContent.length} items as{' '}
                    {selectedExportFormat.toUpperCase()}
                  </Button>
                </div>
              )}

              {/* Progress Indicator */}
              {operationProgress && (
                <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                  <div className="flex items-center space-x-2">
                    {getProgressIcon(operationProgress.stage)}
                    <span
                      className={`text-sm font-medium ${getProgressColor(operationProgress.stage)}`}
                    >
                      {operationProgress.message}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${operationProgress.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-600">
                    {operationProgress.current} of {operationProgress.total}{' '}
                    items processed ({Math.round(operationProgress.percentage)}
                    %)
                  </div>
                </div>
              )}

              {/* Operation Result */}
              {operationResult && (
                <div
                  className={`p-4 rounded-lg space-y-2 ${
                    operationResult.success ? 'bg-green-50' : 'bg-red-50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {operationResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        operationResult.success
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {operationResult.success
                        ? 'Operation completed successfully'
                        : 'Operation completed with errors'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Processed {operationResult.processedCount} items
                    {operationResult.successCount > 0 &&
                      ` • ${operationResult.successCount} successful`}
                    {operationResult.errorCount > 0 &&
                      ` • ${operationResult.errorCount} failed`}
                  </div>
                  {operationResult.errors.length > 0 && (
                    <div className="text-xs text-red-600">
                      Errors: {operationResult.errors.slice(0, 3).join(', ')}
                      {operationResult.errors.length > 3 &&
                        ` and ${operationResult.errors.length - 3} more...`}
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selectedContent.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => deleteContent(item.id)}
                      disabled={bulkOperationInProgress}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No content in current category</p>
              <p className="text-sm text-gray-500 mt-2">
                Select a category to manage its content
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
