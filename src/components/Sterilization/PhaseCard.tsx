import React from 'react';

/**
 * Props for the PhaseCard component.
 * @interface PhaseCardProps
 * @property {string} title - The display title for the phase card. Used as the header text to identify the sterilization phase or section being displayed.
 * @property {React.ReactNode} children - The content to be rendered inside the phase card. Can include any React elements, components, or JSX content that represents the phase-specific UI elements.
 */
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
