import React from 'react';

interface KnowledgeHubErrorBoundaryProps {
  children: React.ReactNode;
}

const KnowledgeHubErrorBoundary: React.FC<KnowledgeHubErrorBoundaryProps> = ({ children }) => {
  return <div>{children}</div>;
};

export default KnowledgeHubErrorBoundary;
