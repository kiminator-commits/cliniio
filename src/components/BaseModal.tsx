import { Modal } from 'react-bootstrap';
import { ReactNode } from 'react';

interface BaseModalProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'lg' | 'xl';
}

export const BaseModal = ({
  show,
  onClose,
  title,
  children,
  footer,
  size = 'lg',
}: BaseModalProps) => {
  return (
    <Modal show={show} onHide={onClose} centered size={size} aria-modal="true" role="dialog">
      {title && (
        <Modal.Header closeButton className="bg-gray-50 border-b border-gray-200">
          <Modal.Title className="text-xl font-semibold text-gray-800">{title}</Modal.Title>
        </Modal.Header>
      )}
      <Modal.Body className="p-4">{children}</Modal.Body>
      {footer && (
        <Modal.Footer className="bg-gray-50 border-t border-gray-200 px-4 py-3">
          {footer}
        </Modal.Footer>
      )}
    </Modal>
  );
};
