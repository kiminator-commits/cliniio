import { useEffect, useState } from 'react';
import { IntelligenceSummary } from '../utils/intelligenceTypes';

export function useIntelligenceData() {
  const [data, setData] = useState<IntelligenceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call // TRACK: Migrate to GitHub issue
    const timeout = setTimeout(() => {
      setData(null); // No mock data available
      setLoading(false);
    }, 500); // mimic network delay

    return () => clearTimeout(timeout);
  }, []);

  return { summary: data, loading };
}
