import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface BlankModalProps {
  show: boolean;
  onHide: () => void;
}

const BlankModal: React.FC<BlankModalProps> = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} backdrop="static" centered>
      <Modal.Body>
        <div className="p-4">
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onHide}>
              Close
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default BlankModal;
