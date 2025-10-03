import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  SDSAnalysisService,
  SDSGapAnalysis,
} from '../services/SDSAnalysisService';

export const useSDSAnalysis = () => {
  const [analysis, setAnalysis] = useState<SDSGapAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeCoverage = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await SDSAnalysisService.analyzeSDSCoverage();
      setAnalysis(result);

      // Save results to database
      try {
        // Get current user's facility ID (you may need to adjust this based on your auth setup)
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          // For now, using a placeholder facility ID - you'll need to get this from your user context
          const facilityId = 'your-facility-id'; // Replace with actual facility ID logic
          await SDSAnalysisService.saveAnalysisResults(facilityId, result);
        }
      } catch (dbError) {
        console.warn('Failed to save analysis to database:', dbError);
        // Don't fail the analysis if database save fails
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to analyze SDS coverage'
      );
      console.error('SDS analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSummaryStats = async () => {
    try {
      return await SDSAnalysisService.getSummaryStats();
    } catch (err) {
      console.error('Error getting summary stats:', err);
      return null;
    }
  };

  // Auto-analyze when hook is first used
  useEffect(() => {
    analyzeCoverage();
  }, []);

  return {
    analysis,
    loading,
    error,
    analyzeCoverage,
    getSummaryStats,
  };
};
