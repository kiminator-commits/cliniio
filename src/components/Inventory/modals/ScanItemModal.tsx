import React from 'react';
import { Modal } from 'react-bootstrap';
import Icon from '@mdi/react';
import { mdiQrcodeScan } from '@mdi/js';

interface ScanItemModalProps {
  show: boolean;
  onHide: () => void;
}

const ScanItemModal: React.FC<ScanItemModalProps> = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <Icon path={mdiQrcodeScan} size={1} className="mr-2" />
          Scan Item
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Replace this with actual scanner integration */}
        <div className="text-center text-gray-500 text-sm">
          Scanner functionality will be restored here.
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ScanItemModal;
