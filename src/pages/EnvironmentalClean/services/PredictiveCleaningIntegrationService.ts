import { supabase } from '../../../lib/supabase';

// Type definitions for the environmental cleaning tables
type EnvironmentalCleaningPatterns = {
  id: string;
  room_id: string;
  cleaning_date: string;
  cleaning_duration_minutes: number;
  contamination_level: 'low' | 'medium' | 'high';
  supplies_used: string[];
  quality_score: number;
};

type EnvironmentalRoomUsagePatterns = {
  id: string;
  room_id: string;
  usage_date: string;
  usage_duration_hours: number;
  patient_count: number;
  procedure_type: string;
};

type EnvironmentalCleaningPredictions = {
  id: string;
  room_id: string;
  predicted_cleaning_date: string;
  confidence_score: number;
  reasoning: string;
  created_at: string;
  expires_at: string;
};

type EnvironmentalPredictionAccuracy = {
  prediction_id: string;
  actual_cleaning_date: string;
  accuracy_score: number;
  notes?: string;
};

type EnvironmentalAIModelPerformance = {
  model_name: string;
  model_version: string;
  prediction_date: string;
  actual_cleaning_date: string;
  prediction_accuracy: number;
  model_confidence: number;
};

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

interface CleaningPrediction {
  id: string;
  room_id: string;
  predicted_cleaning_date: string;
  confidence_score: number;
  reasoning: string;
  created_at: string;
  expires_at: string;
}

interface PredictionAccuracy {
  prediction_id: string;
  actual_cleaning_date: string;
  accuracy_score: number;
  notes?: string;
}

export class PredictiveCleaningIntegrationService {
  private readonly tableName = 'environmental_cleaning_predictions';

  /**
   * Generate cleaning predictions based on historical patterns
   */
  async generateCleaningPredictions(
    roomIds: string[]
  ): Promise<CleaningPrediction[]> {
    try {
      const predictions: CleaningPrediction[] = [];

      for (const roomId of roomIds) {
        const prediction = await this.generateRoomPrediction(roomId);
        if (prediction) {
          predictions.push(prediction);
        }
      }

      // Store predictions in database
      if (predictions.length > 0) {
        await this.storePredictions(predictions);
      }

      return predictions;
    } catch (error) {
      console.error('Error generating cleaning predictions:', error);
      throw error;
    }
  }

  /**
   * Generate prediction for a specific room
   */
  private async generateRoomPrediction(
    roomId: string
  ): Promise<CleaningPrediction | null> {
    try {
      // Get historical cleaning patterns for this room
      const { data: cleaningPatterns, error: cleaningError } = (await supabase
        .from('environmental_cleaning_patterns')
        .select('*')
        .eq('room_id', roomId)
        .order('cleaning_date', { ascending: false })
        .limit(20)) as {
        data: EnvironmentalCleaningPatterns[] | null;
        error: Error | null;
      };

      if (cleaningError) throw cleaningError;

      // Get room usage patterns
      const { data: usagePatterns, error: usageError } = (await supabase
        .from('environmental_room_usage_patterns')
        .select('*')
        .eq('room_id', roomId)
        .order('usage_date', { ascending: false })
        .limit(20)) as {
        data: EnvironmentalRoomUsagePatterns[] | null;
        error: Error | null;
      };

      if (usageError) throw usageError;

      if (!cleaningPatterns || cleaningPatterns.length === 0) {
        return null;
      }

      // Analyze patterns and generate prediction
      const prediction = this.analyzePatternsAndPredict(
        cleaningPatterns as CleaningPattern[],
        usagePatterns as RoomUsagePattern[]
      );

      return {
        id: `pred_${roomId}_${Date.now()}`,
        room_id: roomId,
        predicted_cleaning_date: prediction.date,
        confidence_score: prediction.confidence,
        reasoning: prediction.reasoning,
        created_at: new Date().toISOString(),
        expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // 7 days
      };
    } catch (error) {
      console.error(`Error generating prediction for room ${roomId}:`, error);
      return null;
    }
  }

  /**
   * Analyze cleaning and usage patterns to predict next cleaning date
   */
  private analyzePatternsAndPredict(
    cleaningPatterns: CleaningPattern[],
    usagePatterns: RoomUsagePattern[]
  ): { date: string; confidence: number; reasoning: string } {
    // Calculate average time between cleanings
    const cleaningIntervals: number[] = [];
    for (let i = 1; i < cleaningPatterns.length; i++) {
      const current = new Date(cleaningPatterns[i - 1].cleaning_date);
      const previous = new Date(cleaningPatterns[i].cleaning_date);
      const interval = Math.floor(
        (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)
      );
      cleaningIntervals.push(interval);
    }

    const avgInterval =
      cleaningIntervals.length > 0
        ? cleaningIntervals.reduce((sum, interval) => sum + interval, 0) /
          cleaningIntervals.length
        : 7;

    // Analyze contamination levels
    const recentPatterns = cleaningPatterns.slice(0, 5);
    const highContaminationCount = recentPatterns.filter(
      (p) => p.contamination_level === 'high'
    ).length;
    const mediumContaminationCount = recentPatterns.filter(
      (p) => p.contamination_level === 'medium'
    ).length;

    // Adjust interval based on contamination history
    let adjustedInterval = avgInterval;
    if (highContaminationCount > 2) {
      adjustedInterval = Math.max(1, adjustedInterval - 2);
    } else if (mediumContaminationCount > 2) {
      adjustedInterval = Math.max(2, adjustedInterval - 1);
    }

    // Consider usage patterns
    if (usagePatterns.length > 0) {
      const avgUsageHours =
        usagePatterns.reduce((sum, p) => sum + p.usage_duration_hours, 0) /
        usagePatterns.length;
      if (avgUsageHours > 12) {
        adjustedInterval = Math.max(1, adjustedInterval - 1);
      }
    }

    // Calculate next cleaning date
    const lastCleaning = new Date(cleaningPatterns[0].cleaning_date);
    const nextCleaning = new Date(lastCleaning);
    nextCleaning.setDate(nextCleaning.getDate() + Math.round(adjustedInterval));

    // Calculate confidence score
    let confidence = 0.7; // Base confidence

    if (cleaningIntervals.length >= 5) {
      confidence += 0.1; // More data = higher confidence
    }

    if (Math.abs(cleaningIntervals[0] - avgInterval) < 2) {
      confidence += 0.1; // Recent pattern matches average
    }

    confidence = Math.min(0.95, confidence);

    // Generate reasoning
    const reasoning =
      `Based on ${cleaningIntervals.length} historical intervals (avg: ${Math.round(avgInterval)} days). ` +
      `Recent contamination: ${highContaminationCount} high, ${mediumContaminationCount} medium. ` +
      `Adjusted interval: ${Math.round(adjustedInterval)} days.`;

    return {
      date: nextCleaning.toISOString().split('T')[0],
      confidence,
      reasoning,
    };
  }

  /**
   * Store predictions in database
   */
  private async storePredictions(
    predictions: CleaningPrediction[]
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .insert(predictions as EnvironmentalCleaningPredictions[]);

      if (error) throw error;
    } catch (error) {
      console.error('Error storing predictions:', error);
      throw error;
    }
  }

  /**
   * Get active predictions for a room
   */
  async getActivePredictions(roomId: string): Promise<CleaningPrediction[]> {
    try {
      const { data, error } = (await supabase
        .from(this.tableName)
        .select('*')
        .eq('room_id', roomId)
        .gte('expires_at', new Date().toISOString())
        .order('predicted_cleaning_date', { ascending: true })) as {
        data: EnvironmentalCleaningPredictions[] | null;
        error: Error | null;
      };

      if (error) throw error;
      return (
        (data as EnvironmentalCleaningPredictions[]).map((item) => ({
          id: item.id,
          room_id: item.room_id,
          predicted_cleaning_date: item.predicted_cleaning_date,
          confidence_score: item.confidence_score,
          reasoning: item.reasoning,
          created_at: item.created_at,
          expires_at: item.expires_at,
        })) || []
      );
    } catch (error) {
      console.error('Error fetching active predictions:', error);
      return [];
    }
  }

  /**
   * Update prediction accuracy when actual cleaning occurs
   */
  async updatePredictionAccuracy(
    predictionId: string,
    actualCleaningDate: string,
    accuracy: number
  ): Promise<void> {
    try {
      // Store accuracy data
      const accuracyData: PredictionAccuracy = {
        prediction_id: predictionId,
        actual_cleaning_date: actualCleaningDate,
        accuracy_score: accuracy,
        notes: 'Accuracy updated after actual cleaning',
      };

      const { error: accuracyError } = await supabase
        .from('environmental_prediction_accuracy')
        .insert(accuracyData as EnvironmentalPredictionAccuracy);

      if (accuracyError) throw accuracyError;

      // Update model performance metrics
      await this.updateModelPerformance(accuracy);

      console.log(
        `Updated prediction accuracy for ${predictionId}: ${accuracy}%`
      );
    } catch (error) {
      console.error('Error updating prediction accuracy:', error);
      throw error;
    }
  }

  /**
   * Update AI model performance metrics
   */
  private async updateModelPerformance(accuracy: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('environmental_ai_model_performance')
        .insert({
          model_name: 'predictive_cleaning',
          model_version: '1.0.0',
          prediction_date: new Date().toISOString().split('T')[0],
          actual_cleaning_date: new Date().toISOString().split('T')[0],
          prediction_accuracy: accuracy,
          model_confidence: 0.8, // Default confidence
        } as EnvironmentalAIModelPerformance);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating model performance:', error);
    }
  }

  /**
   * Get prediction insights and trends
   */
  async getPredictionInsights(): Promise<{
    totalPredictions: number;
    averageAccuracy: number;
    trendAnalysis: string;
  }> {
    try {
      // Get total predictions
      const { count: totalPredictions } = (await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })) as {
        count: number | null;
      };

      // Get average accuracy
      const { data: accuracyData } = (await supabase
        .from('environmental_prediction_accuracy')
        .select('accuracy_score')) as {
        data: { accuracy_score: number }[] | null;
      };

      const averageAccuracy =
        accuracyData && accuracyData.length > 0
          ? accuracyData.reduce((sum, item) => sum + item.accuracy_score, 0) /
            accuracyData.length
          : 0;

      // Generate trend analysis
      const trendAnalysis = this.generateTrendAnalysis(averageAccuracy);

      return {
        totalPredictions: totalPredictions || 0,
        averageAccuracy: Math.round(averageAccuracy * 100) / 100,
        trendAnalysis,
      };
    } catch (error) {
      console.error('Error getting prediction insights:', error);
      return {
        totalPredictions: 0,
        averageAccuracy: 0,
        trendAnalysis: 'Unable to analyze trends',
      };
    }
  }

  /**
   * Generate trend analysis based on accuracy data
   */
  private generateTrendAnalysis(averageAccuracy: number): string {
    if (averageAccuracy >= 0.8) {
      return 'Excellent prediction accuracy. Model is performing well.';
    } else if (averageAccuracy >= 0.6) {
      return 'Good prediction accuracy. Consider fine-tuning parameters.';
    } else if (averageAccuracy >= 0.4) {
      return 'Moderate prediction accuracy. Model needs improvement.';
    } else {
      return 'Low prediction accuracy. Consider retraining the model.';
    }
  }
}
