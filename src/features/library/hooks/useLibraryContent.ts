import { useState, useEffect } from 'react';
import { fetchLibraryContent } from '../services/libraryService';
import { ContentItem } from '../libraryTypes';

export const useLibraryContent = () => {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const data = await fetchLibraryContent();
        setContent(data);
      } catch (err) {
        console.error('useLibraryContent: Error loading content:', err);
        setError(
          err instanceof Error ? err : new Error('Failed to load content')
        );
        setContent([]);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  return { content, loading, error };
};
