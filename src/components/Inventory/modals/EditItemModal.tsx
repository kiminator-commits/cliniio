// Modal for editing existing inventory items
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

interface Item {
  id: string;
  name: string;
  category: string;
  toolId: string;
  location: string;
  status: string;
  isP2Status: boolean;
}

interface EditItemModalProps {
  show: boolean;
  onHide: () => void;
  item: Item | null;
  onSave: (updatedItem: Item) => void;
}

const EditItemModal: React.FC<EditItemModalProps> = ({
  show,
  onHide,
  item,
  onSave,
}) => {
  const [formData, setFormData] = useState<Omit<Item, 'id'>>({
    name: '',
    category: '',
    toolId: '',
    location: '',
    status: '',
    isP2Status: false,
  });

  // Update form data when item changes
  useEffect(() => {
    if (item) {
      const { name, category, location, status, isP2Status } = item;
      // Use setTimeout to avoid calling setState synchronously in effect
      setTimeout(() => {
        setFormData({
          name,
          category,
          toolId: (item as { data?: { toolId?: string } }).data?.toolId || '',
          location,
          status: status || '',
          isP2Status: isP2Status || false,
        });
      }, 0);
    }
  }, [item]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (item) {
      onSave({
        ...item,
        name: formData.name,
        category: formData.category,
        location: formData.location,
        toolId: formData.toolId,
        status: formData.status,
        isP2Status: formData.isP2Status,
      });
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Item</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Category</option>
              <option value="Diagnostic Tools">Diagnostic Tools</option>
              <option value="Monitoring Equipment">Monitoring Equipment</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tool ID</Form.Label>
            <Form.Control
              type="text"
              name="toolId"
              value={formData.toolId}
              onChange={handleInputChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Select
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Location</option>
              <option value="Cabinet A">Cabinet A</option>
              <option value="Cabinet B">Cabinet B</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="p2">P2</option>
              <option value="n/a">N/A</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>P2 Tool</Form.Label>
            <Form.Select
              name="isP2Status"
              value={formData.isP2Status.toString()}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isP2Status: e.target.value === 'true',
                }))
              }
              required
            >
              <option value="false">No</option>
              <option value="true">Yes</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditItemModal;
