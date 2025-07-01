// TODO: Move to modals/ - Modal for adding new inventory items
import React from 'react';
import { Modal } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiChevronDown, mdiChevronRight } from '@mdi/js';
import LocationPicker from '../forms/LocationPicker';

interface AddItemModalProps {
  show: boolean;
  onHide: () => void;
  formData: {
    itemName: string;
    category: string;
    id: string;
    location: string;
    purchaseDate: string;
    vendor: string;
    cost: string;
    warranty: string;
    maintenanceSchedule: string;
    lastServiced: string;
    nextDue: string;
    serviceProvider: string;
    assignedTo: string;
    status: string;
    quantity: string;
    notes: string;
  };
  isEditMode: boolean;
  expandedSections: {
    general: boolean;
    purchase: boolean;
    maintenance: boolean;
    usage: boolean;
  };
  toggleSection: (section: string) => void;
  handleFormChange: (field: string, value: string) => void;
  onSave?: () => void;
  progressInfo?: {
    current: number;
    total: number;
    currentItemName: string;
  };
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  show,
  onHide,
  formData,
  isEditMode,
  expandedSections,
  toggleSection,
  handleFormChange,
  onSave,
  progressInfo,
}) => {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title className="flex items-center gap-3">
          {isEditMode ? 'Edit Item' : 'Add New Item'}
          {progressInfo && (
            <div className="text-sm text-gray-500 font-normal">
              ({progressInfo.current} of {progressInfo.total}) {progressInfo.currentItemName}
            </div>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="max-h-[70vh] overflow-y-auto">
        {progressInfo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">
                Processing scanned items: {progressInfo.current} of {progressInfo.total}
              </span>
              <span className="text-xs text-blue-600">
                {Math.round((progressInfo.current / progressInfo.total) * 100)}% complete
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(progressInfo.current / progressInfo.total) * 100}%` }}
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
            {/* General Information */}
            <div className="mb-3 border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection('general')}
                className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
              >
                <h3 className="text-base font-semibold text-gray-800">General Information</h3>
                <Icon
                  path={expandedSections.general ? mdiChevronDown : mdiChevronRight}
                  size={1}
                  className="text-gray-600"
                />
              </button>
              {expandedSections.general && (
                <div className="p-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="add-item-name"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Item Name
                      </label>
                      <input
                        id="add-item-name"
                        type="text"
                        className="form-control py-1 px-2 text-sm"
                        placeholder="Enter item name"
                        value={formData.itemName}
                        onChange={e => handleFormChange('itemName', e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="add-category"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Category
                      </label>
                      <select
                        id="add-category"
                        className="form-select py-1 px-2 text-sm"
                        value={formData.category}
                        onChange={e => handleFormChange('category', e.target.value)}
                      >
                        <option value="">Select category</option>
                        <option value="tools">Tools</option>
                        <option value="supplies">Supplies</option>
                        <option value="equipment">Equipment</option>
                        <option value="officeHardware">Office Hardware</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="add-id"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        ID / Serial #
                      </label>
                      <input
                        id="add-id"
                        type="text"
                        className="form-control py-1 px-2 text-sm"
                        placeholder="Enter ID or serial number"
                        value={formData.id}
                        onChange={e => handleFormChange('id', e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="add-location"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Location
                      </label>
                      <LocationPicker
                        value={formData.location}
                        onChange={value => handleFormChange('location', value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Purchase Information */}
            <div className="mb-3 border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection('purchase')}
                className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
              >
                <h3 className="text-base font-semibold text-gray-800">Purchase Information</h3>
                <Icon
                  path={expandedSections.purchase ? mdiChevronDown : mdiChevronRight}
                  size={1}
                  className="text-gray-600"
                />
              </button>
              {expandedSections.purchase && (
                <div className="p-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="add-purchase-date"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Purchase Date
                      </label>
                      <input
                        id="add-purchase-date"
                        type="date"
                        className="form-control py-1 px-2 text-sm"
                        value={formData.purchaseDate}
                        onChange={e => handleFormChange('purchaseDate', e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="add-vendor"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Vendor
                      </label>
                      <input
                        id="add-vendor"
                        type="text"
                        className="form-control py-1 px-2 text-sm"
                        placeholder="Enter vendor name"
                        value={formData.vendor}
                        onChange={e => handleFormChange('vendor', e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="add-cost"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Cost
                      </label>
                      <input
                        id="add-cost"
                        type="number"
                        className="form-control py-1 px-2 text-sm"
                        placeholder="Enter cost"
                        value={formData.cost}
                        onChange={e => handleFormChange('cost', e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="add-warranty"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Warranty
                      </label>
                      <input
                        id="add-warranty"
                        type="text"
                        className="form-control py-1 px-2 text-sm"
                        placeholder="Enter warranty period"
                        value={formData.warranty}
                        onChange={e => handleFormChange('warranty', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Maintenance Information */}
            <div className="mb-3 border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection('maintenance')}
                className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
              >
                <h3 className="text-base font-semibold text-gray-800">Maintenance Information</h3>
                <Icon
                  path={expandedSections.maintenance ? mdiChevronDown : mdiChevronRight}
                  size={1}
                  className="text-gray-600"
                />
              </button>
              {expandedSections.maintenance && (
                <div className="p-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="add-maintenance-schedule"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Maintenance Schedule
                      </label>
                      <input
                        id="add-maintenance-schedule"
                        type="text"
                        className="form-control py-1 px-2 text-sm"
                        placeholder="Enter maintenance schedule"
                        value={formData.maintenanceSchedule}
                        onChange={e => handleFormChange('maintenanceSchedule', e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="add-last-serviced"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Last Serviced
                      </label>
                      <input
                        id="add-last-serviced"
                        type="date"
                        className="form-control py-1 px-2 text-sm"
                        value={formData.lastServiced}
                        onChange={e => handleFormChange('lastServiced', e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="add-next-due"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Next Due
                      </label>
                      <input
                        id="add-next-due"
                        type="date"
                        className="form-control py-1 px-2 text-sm"
                        value={formData.nextDue}
                        onChange={e => handleFormChange('nextDue', e.target.value)}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="add-service-provider"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Service Provider
                      </label>
                      <input
                        id="add-service-provider"
                        type="text"
                        className="form-control py-1 px-2 text-sm"
                        placeholder="Enter service provider"
                        value={formData.serviceProvider}
                        onChange={e => handleFormChange('serviceProvider', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Usage Information */}
            <div className="mb-3 border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => toggleSection('usage')}
                className="w-full p-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg"
              >
                <h3 className="text-base font-semibold text-gray-800">Usage Information</h3>
                <Icon
                  path={expandedSections.usage ? mdiChevronDown : mdiChevronRight}
                  size={1}
                  className="text-gray-600"
                />
              </button>
              {expandedSections.usage && (
                <div className="p-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="add-status"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Status
                      </label>
                      <select
                        id="add-status"
                        className="form-select py-1 px-2 text-sm"
                        value={formData.status}
                        onChange={e => handleFormChange('status', e.target.value)}
                      >
                        <option value="">Select status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="add-notes"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Notes
                      </label>
                      <textarea
                        id="add-notes"
                        className="form-control py-1 px-2 text-sm"
                        placeholder="Additional notes"
                        rows={2}
                        value={formData.notes}
                        onChange={e => handleFormChange('notes', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
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
        <button
          onClick={onSave}
          className="bg-[#4ECDC4] hover:bg-[#3db8b0] text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          {isEditMode ? 'Update Item' : 'Save Item'}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddItemModal;
