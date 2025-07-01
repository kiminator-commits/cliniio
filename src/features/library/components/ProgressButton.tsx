import React from 'react';

interface ProgressButtonProps {
  onClick: () => void;
  status: string;
}

export default function ProgressButton({ onClick, status }: ProgressButtonProps) {
  if (status === 'Not Started') {
    return (
      <button
        onClick={onClick}
        className="rounded-full px-3 py-1 text-sm font-medium bg-teal-500 text-white hover:bg-teal-600 transition"
      >
        Add to My List
      </button>
    );
  }

  if (status === 'In Progress') {
    return (
      <button
        disabled
        className="rounded-full px-3 py-1 text-sm font-medium border border-teal-500 text-teal-500 bg-white cursor-not-allowed"
      >
        In Progress
      </button>
    );
  }

  return null;
}
