import React from 'react';
import EnvironmentalCleanHeader from './ui/EnvironmentalCleanHeader';

interface EnvironmentalCleanHeaderWrapperProps {
  onScan: () => void;
}

const EnvironmentalCleanHeaderWrapper: React.FC<
  EnvironmentalCleanHeaderWrapperProps
> = ({ onScan }) => <EnvironmentalCleanHeader onScan={onScan} />;

export default EnvironmentalCleanHeaderWrapper;
