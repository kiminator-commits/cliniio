import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiDownload, mdiUpload, mdiFileDocument } from '@mdi/js';

interface UploadBarcodeModalProps {
  show: boolean;
  onClose: () => void;
}

const UploadBarcodeModal: React.FC<UploadBarcodeModalProps> = ({ show, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const downloadTemplate = () => {
    const csvContent = `barcode,name,category,location,quantity,status,purchaseDate,vendor,cost,warranty,maintenanceSchedule,lastServiced,nextDue,serviceProvider,assignedTo,notes
123456789,Tool Name,Category,Location,1,Available,2024-01-01,Vendor Name,100.00,1 year,Monthly,2024-01-01,2024-02-01,Service Provider,Assigned To,Notes`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tools_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadError(null);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const text = await selectedFile.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      // Expected CSV format based on template
      const barcodeIndex = headers.findIndex(h => h.toLowerCase().includes('barcode'));
      const nameIndex = headers.findIndex(h => h.toLowerCase().includes('name'));
      const categoryIndex = headers.findIndex(h => h.toLowerCase().includes('category'));
      const locationIndex = headers.findIndex(h => h.toLowerCase().includes('location'));
      const quantityIndex = headers.findIndex(h => h.toLowerCase().includes('quantity'));
      const statusIndex = headers.findIndex(h => h.toLowerCase().includes('status'));
      const purchaseDateIndex = headers.findIndex(h => h.toLowerCase().includes('purchasedate'));
      const vendorIndex = headers.findIndex(h => h.toLowerCase().includes('vendor'));
      const costIndex = headers.findIndex(h => h.toLowerCase().includes('cost'));
      const warrantyIndex = headers.findIndex(h => h.toLowerCase().includes('warranty'));
      const maintenanceScheduleIndex = headers.findIndex(h =>
        h.toLowerCase().includes('maintenanceschedule')
      );
      const lastServicedIndex = headers.findIndex(h => h.toLowerCase().includes('lastserviced'));
      const nextDueIndex = headers.findIndex(h => h.toLowerCase().includes('nextdue'));
      const serviceProviderIndex = headers.findIndex(h =>
        h.toLowerCase().includes('serviceprovider')
      );
      const assignedToIndex = headers.findIndex(h => h.toLowerCase().includes('assignedto'));
      const notesIndex = headers.findIndex(h => h.toLowerCase().includes('notes'));

      if (barcodeIndex === -1 || nameIndex === -1) {
        throw new Error('CSV must contain barcode and name columns');
      }

      const items = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(',').map(v => v.trim());
        if (values.length < headers.length) continue;

        const item = {
          barcode: values[barcodeIndex],
          name: values[nameIndex],
          category: categoryIndex !== -1 ? values[categoryIndex] : 'Uncategorized',
          location: locationIndex !== -1 ? values[locationIndex] : 'Unknown',
          quantity: quantityIndex !== -1 ? parseInt(values[quantityIndex]) || 1 : 1,
          status: statusIndex !== -1 ? values[statusIndex] : 'Available',
          purchaseDate:
            purchaseDateIndex !== -1
              ? values[purchaseDateIndex]
              : new Date().toISOString().split('T')[0],
          vendor: vendorIndex !== -1 ? values[vendorIndex] : '',
          cost: costIndex !== -1 ? values[costIndex] : '',
          warranty: warrantyIndex !== -1 ? values[warrantyIndex] : '',
          maintenanceSchedule:
            maintenanceScheduleIndex !== -1 ? values[maintenanceScheduleIndex] : '',
          lastServiced: lastServicedIndex !== -1 ? values[lastServicedIndex] : '',
          nextDue: nextDueIndex !== -1 ? values[nextDueIndex] : '',
          serviceProvider: serviceProviderIndex !== -1 ? values[serviceProviderIndex] : '',
          assignedTo: assignedToIndex !== -1 ? values[assignedToIndex] : '',
          notes: notesIndex !== -1 ? values[notesIndex] : 'Imported via CSV upload',
        };

        items.push(item);
      }

      // For now, just log the items and show success
      console.log('CSV Upload - Parsed tools:', items);
      setUploadSuccess(true);

      // Reset file selection after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setUploadSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload CSV');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static" size="lg">
      <Modal.Header closeButton className="pb-2">
        <Modal.Title className="text-lg">Upload Tools CSV</Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3 pb-6">
        {/* Step 1: Download Template */}
        <div className="mb-4 border border-gray-200 rounded-lg">
          <div className="p-3 bg-gray-50 rounded-t-lg">
            <h3 className="text-base font-semibold text-gray-800 flex items-center">
              <Icon path={mdiDownload} size={1} className="mr-2 text-[#4ECDC4]" />
              Step 1: Download Template
            </h3>
          </div>
          <div className="p-3 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Get the CSV template with all required columns for tool data.
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
              Upload your filled CSV file to import tools into the database.
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
              <p className="text-sm text-green-600 mb-2">✓ Selected: {selectedFile.name}</p>
            )}
            {uploadError && <p className="text-sm text-red-600 mb-2">✗ {uploadError}</p>}
            {uploadSuccess && (
              <p className="text-sm text-green-600 mb-2">
                ✓ Tools uploaded successfully! Check console for parsed data.
              </p>
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
          {isUploading ? 'Uploading...' : 'Upload Tools'}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default UploadBarcodeModal;
