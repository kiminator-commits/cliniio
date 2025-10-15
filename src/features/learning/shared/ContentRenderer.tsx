import React from 'react';

// TODO: Implement shared version from CourseViewer
// This component will provide consistent content display across both CourseViewer and ContentBuilder
// Features to include:
// - HTML content rendering with sanitization
// - Media integration (images, videos, files)
// - Responsive design
// - Accessibility support
// - Print-friendly styling

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
