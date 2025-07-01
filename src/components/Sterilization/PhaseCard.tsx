import React from 'react';

interface PhaseCardProps {
  title: string;
  children: React.ReactNode;
}

export default function PhaseCard({ title, children }: PhaseCardProps) {
  return (
    <div className="rounded-xl border p-4 shadow-md bg-white mb-4">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}
