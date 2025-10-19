import React from 'react';

interface ContentRendererProps {
  content: string;
  className?: string;
}

export default function ContentRenderer({
  content,
  className = '',
}: ContentRendererProps) {
  return (
    <section
      className={`prose max-w-none w-full bg-white rounded-md p-6 shadow-sm ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
