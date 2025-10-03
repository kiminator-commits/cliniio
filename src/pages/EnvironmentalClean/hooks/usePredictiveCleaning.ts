import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CleaningPattern {
  id: string;
  room_id: string;
  cleaning_date: string;
  cleaning_duration_minutes: number;
  contamination_level: 'low' | 'medium' | 'high';
  supplies_used: string[];
  quality_score: number;
}

interface RoomUsagePattern {
  id: string;
  room_id: string;
  usage_date: string;
  usage_duration_hours: number;
  patient_count: number;
  procedure_type: string;
}

export function usePredictiveCleaning() {
  const [predictions, setPredictions] = useState<
    Array<{
      roomId: string;
      nextCleaningDate: string;
      confidence: number;
      reason: string;
    }>
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  // Fetch cleaning patterns
  const { data: cleaningPatterns } = useQuery({
    queryKey: ['cleaning-patterns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('environmental_cleaning_patterns')
        .select('*')
        .order('cleaning_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as unknown as CleaningPattern[];
    },
  });

  // Fetch room usage patterns
  const { data: usagePatterns } = useQuery({
    queryKey: ['usage-patterns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('environmental_room_usage_patterns')
        .select('*')
        .order('usage_date', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as unknown as RoomUsagePattern[];
    },
  });

  const generatePredictions = useCallback(async () => {
    if (!cleaningPatterns || !usagePatterns) return;

    setIsLoading(true);
    try {
      const newPredictions = cleaningPatterns.map((pattern) => {
        const roomUsage = usagePatterns.filter(
          (u) => u.room_id === pattern.room_id
        );
        const avgUsageDuration =
          roomUsage.length > 0
            ? roomUsage.reduce((sum, u) => sum + u.usage_duration_hours, 0) /
              roomUsage.length
            : 8;

        // Simple prediction logic
        const lastCleaning = new Date(pattern.cleaning_date);
        const daysSinceCleaning = Math.floor(
          (Date.now() - lastCleaning.getTime()) / (1000 * 60 * 60 * 24)
        );

        let nextCleaningDays = 7; // Default 7 days

        if (pattern.contamination_level === 'high') {
          nextCleaningDays = 3;
        } else if (pattern.contamination_level === 'medium') {
          nextCleaningDays = 5;
        }

        // Adjust based on usage
        if (avgUsageDuration > 12) {
          nextCleaningDays = Math.max(1, nextCleaningDays - 2);
        }

        const nextCleaningDate = new Date();
        nextCleaningDate.setDate(nextCleaningDate.getDate() + nextCleaningDays);

        return {
          roomId: pattern.room_id,
          nextCleaningDate: nextCleaningDate.toISOString().split('T')[0],
          confidence: Math.min(0.95, 0.7 + daysSinceCleaning * 0.02),
          reason: `Based on ${pattern.contamination_level} contamination level and ${Math.round(avgUsageDuration)}h average usage`,
        };
      });

      setPredictions(newPredictions);
    } catch (error) {
      console.error('Error generating predictions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cleaningPatterns, usagePatterns]);

  // Generate predictions when data changes
  useEffect(() => {
    if (cleaningPatterns && usagePatterns) {
      generatePredictions();
    }
  }, [cleaningPatterns, usagePatterns, generatePredictions]);

  return {
    predictions,
    isLoading,
    refreshPredictions: generatePredictions,
  };
}
