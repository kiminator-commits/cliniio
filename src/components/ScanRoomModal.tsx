import { FC } from 'react';

interface ScanRoomModalProps {
  show: boolean;
  onHide: () => void;
}

export const ScanRoomModal: FC<ScanRoomModalProps> = ({ show, onHide }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Scan Room Status</h2>
        {/* TODO: Insert scanning and status logic here */}
        <button className="mt-4 px-4 py-2 bg-brand-primary text-white rounded" onClick={onHide}>
          Close
        </button>
      </div>
    </div>
  );
};
