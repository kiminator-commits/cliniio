import React from 'react';
import { BIFailureResolution } from '../Sterilization/BIFailureResolution';

interface BIFailureResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Legacy wrapper component for BI Failure Resolution.
 * This component maintains backward compatibility while delegating to the new
 * decomposed BIFailureResolution component.
 *
 * @param {BIFailureResolutionModalProps} props - Component props
 * @returns {JSX.Element | null} BI failure resolution modal
 */
export const BIFailureResolutionModal: React.FC<
  BIFailureResolutionModalProps
> = ({ isOpen, onClose }) => {
  return <BIFailureResolution isOpen={isOpen} onClose={onClose} />;
};
