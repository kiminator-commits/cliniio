import React from 'react';

interface CleanWorkflowProps {
  scannedData: string;
  onClose: () => void;
}

export default function CleanWorkflow({ scannedData, onClose }: CleanWorkflowProps) {
  // Internal logic for clean tool sterilization process
  function handleSterilization(toolStatus: string) {
    if (toolStatus === 'clean') {
      console.log('Clean tool skipped cleaning workflow');
      return;
    }
    // Fake sequence for bath 1 and bath 2
    console.log('Started Bath 1');
    console.log('Started Bath 2');
  }

  // Example usage (replace 'dirty' with actual status as needed)
  handleSterilization('dirty');

  return (
    <div>
      <p>Tool is clean and ready for use.</p>
      <p>Scanned: {scannedData}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
