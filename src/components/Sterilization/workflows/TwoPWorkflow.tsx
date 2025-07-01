import React from 'react';

interface TwoPWorkflowProps {
  scannedData: string;
  onStore: () => void;
}

export default function TwoPWorkflow({ scannedData, onStore }: TwoPWorkflowProps) {
  return (
    <div>
      <p>This tool follows a 2-Phase workflow (Bath 1 & 2 only).</p>
      <p>Scanned: {scannedData}</p>
      <button onClick={onStore}>Store in Airtight Container</button>
    </div>
  );
}
