import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface TrackItemModalProps {
  show: boolean;
  onHide: () => void;
}

const TrackItemModal: React.FC<TrackItemModalProps> = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Track Item</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Track Item functionality coming soon.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" disabled>
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TrackItemModal;
