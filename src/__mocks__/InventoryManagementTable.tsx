import React, { useCallback } from 'react';
import { Table, Button } from 'react-bootstrap';
import EditItemModal from '@/components/Inventory/modals/EditItemModal';
import TrackItemModal from '@/components/Inventory/modals/TrackItemModal';
import CategoryManagement from '@/components/Inventory/forms/CategoryManagement';
import { InventoryItem } from '../types/inventoryTypes';
import { useInventoryStore } from '@/store/useInventoryStore';
import Pagination from '@/components/common/Pagination';

interface InventoryManagementTableProps {
  items: InventoryItem[];
  onAddItem: (item: InventoryItem) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
  container?: HTMLElement;
}

const InventoryManagementTable: React.FC<InventoryManagementTableProps> = ({
  items,
  onAddItem,
  onEditItem,
  onDeleteItem,
}) => {
  const [editingItem, setEditingItem] = React.useState<InventoryItem | null>(
    null
  );
  const [trackingItem, setTrackingItem] = React.useState<InventoryItem | null>(
    null
  );
  const {
    currentPage,
    itemsPerPage,
    setCurrentPage,
    items: inventoryItems,
  } = useInventoryStore();
  const totalPages = Math.ceil((inventoryItems || []).length / itemsPerPage);

  const handleAddItem = useCallback(() => {
    onAddItem({
      id: '',
      name: '',
      category: '',
      quantity: 0,
      location: '',
    } as InventoryItem);
  }, [onAddItem]);

  const handleEditItem = useCallback((item: InventoryItem) => {
    setEditingItem(item);
  }, []);

  const handleDeleteItem = useCallback(
    (itemId: string) => {
      onDeleteItem(itemId);
    },
    [onDeleteItem]
  );

  const handleCloseEditModal = useCallback(() => {
    setEditingItem(null);
  }, []);

  const handleCloseTrackModal = useCallback(() => {
    setTrackingItem(null);
  }, []);

  return (
    <div>
      <div className="mb-4">
        <Button variant="primary" onClick={handleAddItem}>
          Add Item
        </Button>
      </div>
      <CategoryManagement />
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Quantity</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.category}</td>
              <td>{item.quantity}</td>
              <td>{item.location}</td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleEditItem(item)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <EditItemModal
        show={!!editingItem}
        onHide={handleCloseEditModal}
        item={
          editingItem
            ? {
                id: editingItem.id,
                name: editingItem.name || '',
                category: editingItem.category || '',
                toolId: (editingItem.data as { toolId?: string })?.toolId || '',
                location: editingItem.location || '',
                p2Status:
                  (editingItem.data as { p2Status?: string })?.p2Status ||
                  'Available',
              }
            : null
        }
        onSave={(updatedItem) => {
          onEditItem(updatedItem as unknown as InventoryItem);
          handleCloseEditModal();
        }}
      />

      <TrackItemModal show={!!trackingItem} onHide={handleCloseTrackModal} />
    </div>
  );
};

export default InventoryManagementTable;
