import React from 'react';
import { LibraryProvider } from '@/features/library';
import { LibraryRoot } from '@/features/library';

const LibraryPage = () => {
  return (
    <LibraryProvider>
      <LibraryRoot />
    </LibraryProvider>
  );
};

export default LibraryPage;
