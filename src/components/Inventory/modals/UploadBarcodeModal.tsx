import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import Icon from '@mdi/react';
import {
  mdiDownload,
  mdiUpload,
  mdiFileDocument,
  mdiCheckCircle,
  mdiAlertCircle,
} from '@mdi/js';
import { useInventoryStore } from '@/store/useInventoryStore';
import { inventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';
import { InventoryItem } from '@/types/inventoryTypes';

interface UploadBarcodeModalProps {
  show: boolean;
  onClose: () => void;
  category?: string;
}

interface ImportResult {
  success: boolean;
  message: string;
  importedCount: number;
  failedCount: number;
  errors: string[];
}

const UploadBarcodeModal: React.FC<UploadBarcodeModalProps> = ({
  show,
  onClose,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);

  const { activeTab } = useInventoryStore();

  /**
   * Downloads a CSV template file for the current active tab/category
   * Creates category-specific templates with appropriate fields
   */
  const downloadTemplate = () => {
    // Create category-specific template
    const getCategoryTemplate = () => {
      const baseFields =
        'barcode,name,category,location,quantity,status,purchaseDate,vendor,cost,notes';

      switch (activeTab) {
        case 'tools':
          return `${baseFields},warranty,maintenanceSchedule,lastServiced,nextDue,serviceProvider,assignedTo`;
        case 'supplies':
          return `${baseFields},expirationDate,reorderPoint,minimumStock`;
        case 'equipment':
          return `${baseFields},warranty,maintenanceSchedule,lastServiced,nextDue,serviceProvider,serialNumber`;
        case 'officeHardware':
          return `${baseFields},warranty,serialNumber,assignedTo`;
        default:
          return baseFields;
      }
    };

    const csvContent = `${getCategoryTemplate()}
123456789,${activeTab.slice(0, -1)} Name,${activeTab},Location,1,Available,2024-01-01,Vendor Name,100.00,Notes`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTab}_template.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  /**
   * Handles file selection for CSV upload
   * @param event - File input change event
   */
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  /**
   * Validates a single inventory item from CSV data
   * @param item - The item data to validate
   * @param rowNumber - The row number for error reporting
   * @returns Array of validation error messages
   */
  const validateItem = (
    item: Record<string, unknown>,
    rowNumber: number
  ): string[] => {
    const errors: string[] = [];

    if (
      !(item.data as { barcode?: unknown })?.barcode ||
      String((item.data as { barcode: unknown }).barcode).trim() === ''
    ) {
      errors.push(`Row ${rowNumber}: Barcode is required`);
    }

    if (!item.name || String(item.name).trim() === '') {
      errors.push(`Row ${rowNumber}: Name is required`);
    }

    if (
      item.quantity &&
      (isNaN(Number(item.quantity)) || Number(item.quantity) < 0)
    ) {
      errors.push(`Row ${rowNumber}: Quantity must be a positive number`);
    }

    if (
      item.unit_cost &&
      (isNaN(parseFloat(String(item.unit_cost))) ||
        parseFloat(String(item.unit_cost)) < 0)
    ) {
      errors.push(`Row ${rowNumber}: Cost must be a positive number`);
    }

    return errors;
  };

  /**
   * Handles the CSV file upload and processing
   * Parses CSV data, validates items, and creates inventory entries
   */
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setImportResult(null);
    setProgress(0);

    try {
      // Read and parse the CSV file content
      const text = await selectedFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map((h) => h.trim());

      // Find column indices by searching for keywords in header names
      // This allows for flexible column ordering as long as headers contain expected keywords
      const barcodeIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('barcode')
      );
      const nameIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('name')
      );
      const categoryIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('category')
      );
      const locationIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('location')
      );
      const quantityIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('quantity')
      );
      const statusIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('status')
      );
      const purchaseDateIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('purchasedate')
      );
      const vendorIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('vendor')
      );
      const costIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('cost')
      );
      const warrantyIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('warranty')
      );
      const maintenanceScheduleIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('maintenanceschedule')
      );
      const lastServicedIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('lastserviced')
      );
      const nextDueIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('nextdue')
      );
      const serviceProviderIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('serviceprovider')
      );
      const assignedToIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('assignedto')
      );
      const notesIndex = headers.findIndex((h) =>
        h.toLowerCase().includes('notes')
      );

      // Validate that required columns exist
      if (barcodeIndex === -1 || nameIndex === -1) {
        throw new Error('CSV must contain barcode and name columns');
      }

      const items: Partial<InventoryItem>[] = [];
      const validationErrors: string[] = [];

      // Process each data row (skip header row at index 0)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty lines

        // Split line into values and ensure we have enough columns
        const values = line.split(',').map((v) => v.trim());
        if (values.length < headers.length) continue; // Skip incomplete rows

        // Build inventory item object from CSV data
        // Use fallback values for optional columns that don't exist
        const item = {
          id: `csv-${Date.now()}-${i}`, // Generate unique ID for CSV items
          name: values[nameIndex],
          category: categoryIndex !== -1 ? values[categoryIndex] : activeTab,
          location: locationIndex !== -1 ? values[locationIndex] : 'Unknown',
          quantity:
            quantityIndex !== -1 ? parseInt(values[quantityIndex]) || 1 : 1,
          status: statusIndex !== -1 ? values[statusIndex] : 'Available',
          unit_cost: costIndex !== -1 ? parseFloat(values[costIndex]) || 0 : 0,
          updated_at: new Date().toISOString(),
          data: {
            barcode: values[barcodeIndex],
            purchaseDate:
              purchaseDateIndex !== -1
                ? values[purchaseDateIndex]
                : new Date().toISOString().split('T')[0],
            vendor: vendorIndex !== -1 ? values[vendorIndex] : '',
            warranty: warrantyIndex !== -1 ? values[warrantyIndex] : '',
            maintenanceSchedule:
              maintenanceScheduleIndex !== -1
                ? values[maintenanceScheduleIndex]
                : '',
            lastServiced:
              lastServicedIndex !== -1 ? values[lastServicedIndex] : '',
            nextDue: nextDueIndex !== -1 ? values[nextDueIndex] : '',
            serviceProvider:
              serviceProviderIndex !== -1 ? values[serviceProviderIndex] : '',
            assignedTo: assignedToIndex !== -1 ? values[assignedToIndex] : '',
            notes:
              notesIndex !== -1
                ? values[notesIndex]
                : 'Imported via CSV upload',
          },
        };

        // Validate the constructed item and collect any errors
        const itemErrors = validateItem(item, i + 1);
        validationErrors.push(...itemErrors);

        // Only add valid items to the import list
        if (itemErrors.length === 0) {
          items.push(item);
        }
      }

      // If there are validation errors, show them and stop
      if (validationErrors.length > 0) {
        setImportResult({
          success: false,
          message: `Validation failed for ${validationErrors.length} items`,
          importedCount: 0,
          failedCount: validationErrors.length,
          errors: validationErrors,
        });
        return;
      }

      // Import items to database
      let importedCount = 0;
      let failedCount = 0;
      const importErrors: string[] = [];

      for (let i = 0; i < items.length; i++) {
        try {
          const item = items[i];
          if (item && item.id && item.name) {
            await inventoryServiceFacade.addInventoryItem(
              item as InventoryItem
            );
            importedCount++;
          } else {
            throw new Error('Invalid item data');
          }
        } catch (error) {
          failedCount++;
          importErrors.push(
            `Row ${i + 2}: ${error instanceof Error ? error.message : 'Import failed'}`
          );
        }

        // Update progress
        setProgress(((i + 1) / items.length) * 100);
      }

      // Set import result
      const result: ImportResult = {
        success: failedCount === 0,
        message:
          failedCount === 0
            ? `Successfully imported ${importedCount} items`
            : `Imported ${importedCount} items, ${failedCount} failed`,
        importedCount,
        failedCount,
        errors: importErrors,
      };

      setImportResult(result);
      setUploadSuccess(failedCount === 0);

      // Reset file selection after successful upload
      if (failedCount === 0) {
        setTimeout(() => {
          setSelectedFile(null);
          setUploadSuccess(false);
          setImportResult(null);
          setProgress(0);
          onClose();
        }, 3000);
      }
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Failed to upload CSV'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton className="pb-2">
        <Modal.Title className="text-lg">
          Import {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} CSV
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3 pb-6">
        {/* Step 1: Download Template */}
        <div className="mb-4 border border-gray-200 rounded-lg">
          <div className="p-3 bg-gray-50 rounded-t-lg">
            <h3 className="text-base font-semibold text-gray-800 flex items-center">
              <Icon
                path={mdiDownload}
                size={1}
                className="mr-2 text-[#4ECDC4]"
              />
              Step 1: Download Template
            </h3>
          </div>
          <div className="p-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Get the CSV template with all required columns for {activeTab}{' '}
              data.
            </p>
            <button
              onClick={downloadTemplate}
              className="bg-[#4ECDC4] hover:bg-[#3db8b0] text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center"
            >
              <Icon path={mdiFileDocument} size={0.8} className="mr-2" />
              Download Template
            </button>
          </div>
        </div>

        {/* Step 2: Upload CSV */}
        <div className="mb-4 border border-gray-200 rounded-lg">
          <div className="p-3 bg-gray-50 rounded-t-lg">
            <h3 className="text-base font-semibold text-gray-800 flex items-center">
              <Icon path={mdiUpload} size={1} className="mr-2 text-[#4ECDC4]" />
              Step 2: Upload CSV
            </h3>
          </div>
          <div className="p-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Upload your filled CSV file to import {activeTab} into the
              database.
            </p>
            <div className="mb-3">
              <label
                htmlFor="csv-file-input"
                className="block text-xs font-medium text-gray-700 mb-1"
              >
                Select CSV File
              </label>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="form-control py-1 px-2 text-sm"
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-green-600 mb-2">
                ✓ Selected: {selectedFile.name}
              </p>
            )}
            {uploadError && (
              <p className="text-sm text-red-600 mb-2">✗ {uploadError}</p>
            )}
            {uploadSuccess && (
              <p className="text-sm text-green-600 mb-2">
                ✓ Items uploaded successfully!
              </p>
            )}

            {/* Progress Bar */}
            {isUploading && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Uploading...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#4ECDC4] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Import Results */}
            {importResult && (
              <div
                className={`p-3 rounded-lg border ${
                  importResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-center mb-2">
                  <Icon
                    path={
                      importResult.success ? mdiCheckCircle : mdiAlertCircle
                    }
                    size={1}
                    className={`mr-2 ${importResult.success ? 'text-green-600' : 'text-red-600'}`}
                  />
                  <span
                    className={`font-medium ${
                      importResult.success ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {importResult.message}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Imported: {importResult.importedCount} items</p>
                  <p>Failed: {importResult.failedCount} items</p>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      Errors:
                    </p>
                    <div className="max-h-20 overflow-y-auto text-xs text-red-600">
                      {importResult.errors.slice(0, 5).map((error, index) => (
                        <div key={index}>• {error}</div>
                      ))}
                      {importResult.errors.length > 5 && (
                        <div>
                          ... and {importResult.errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="pt-2">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          className="px-4 py-2 bg-[#4ECDC4] hover:bg-[#3db8b0] text-white rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <Icon path={mdiUpload} size={0.8} className="mr-2" />
          {isUploading
            ? 'Importing...'
            : `Import ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadBarcodeModal;
