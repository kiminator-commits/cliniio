// Modal for editing existing inventory items
import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

interface Item {
  id: string;
  name: string;
  category: string;
  toolId: string;
  location: string;
  p2Status: string;
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
    p2Status: '',
  });

  // Update form data when item changes
  useEffect(() => {
    if (item) {
      const { name, category, location } = item;
      setFormData({
        name,
        category,
        toolId: (item as { data?: { toolId?: string } }).data?.toolId || '',
        location,
        p2Status:
          (item as { data?: { p2Status?: string } }).data?.p2Status || '',
      });
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
        p2Status: formData.p2Status,
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
            <Form.Label>P2 Status</Form.Label>
            <Form.Select
              name="p2Status"
              value={formData.p2Status}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Status</option>
              <option value="Available">Available</option>
              <option value="In Use">In Use</option>
              <option value="Maintenance">Maintenance</option>
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
