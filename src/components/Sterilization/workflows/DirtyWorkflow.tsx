import React from 'react';

interface DirtyWorkflowProps {
  scannedData: string;
  onBeginCycle: () => void;
}

export default function DirtyWorkflow({ scannedData, onBeginCycle }: DirtyWorkflowProps) {
  // Placeholder internal logic for dirty tool sterilization
  function handleDirtyToolWorkflow() {
    console.log('Scanned dirty tool');
    console.log('Started Bath 1');
    console.log('Started Bath 2');
    console.log('Completed cleaning cycle');
  }

  // Example usage
  handleDirtyToolWorkflow();

  return (
    <div>
      <p>Tool is dirty and must begin sterilization.</p>
      <p>Scanned: {scannedData}</p>
      <button onClick={onBeginCycle}>Begin Cycle</button>
    </div>
  );
}
