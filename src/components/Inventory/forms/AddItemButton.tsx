// Button component for adding new items
import React, { useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';

interface AddItemButtonProps {
  onAdd: (item: {
    name: string;
    category: string;
    location: string;
    quantity: number;
    p2Status: string;
  }) => void;
}

const AddItemButton: React.FC<AddItemButtonProps> = ({ onAdd }) => {
  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    quantity: 0,
    p2Status: '',
  });

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(formData);
    handleClose();
  };

  const handleChange = (
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

  return (
    <>
      <Button
        onClick={handleShow}
        className="px-4 py-2 bg-[#4ECDC4] hover:bg-[#3db8b0] text-white"
      >
        Add Item
      </Button>

      <Modal show={show} onHide={handleClose} backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select Category</option>
                <option value="diagnostic">Diagnostic</option>
                <option value="monitoring">Monitoring</option>
                <option value="surgical">Surgical</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Location</Form.Label>
              <Form.Select
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
              >
                <option value="">Select Location</option>
                <option value="cabinet-a">Cabinet A</option>
                <option value="cabinet-b">Cabinet B</option>
                <option value="storage">Storage</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>P2 Status</Form.Label>
              <Form.Select
                name="p2Status"
                value={formData.p2Status}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option value="available">Available</option>
                <option value="in-use">In Use</option>
                <option value="maintenance">Maintenance</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              className="bg-[#4ECDC4] hover:bg-[#3db8b0] text-white"
              type="submit"
            >
              Save Item
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default AddItemButton;
