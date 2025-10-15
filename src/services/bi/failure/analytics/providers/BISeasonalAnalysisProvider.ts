import { supabase } from '@/lib/supabaseClient';
import { logger } from '@/utils/_core/logger';

export interface SeasonalPattern {
  period: string;
  incidentRate: number;
  description: string;
  confidence: number;
}

export interface BIIncident {
  created_at: string;
  severity?: string;
  category?: string;
  [key: string]: unknown;
}

export class BISeasonalAnalysisProvider {
  /**
   * Analyze seasonal patterns for a facility
   */
  static async analyzeSeasonalPatterns(
    facilityId: string
  ): Promise<SeasonalPattern[]> {
    try {
      const { data: incidents, error } = await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        ); // Last year

      if (error) throw error;

      if (!incidents || incidents.length === 0) return [];

      const seasonalData = this.groupIncidentsBySeason(
        incidents as Array<Record<string, unknown> & { created_at: string }>
      );
      const patterns: SeasonalPattern[] = [];

      for (const [season, data] of Object.entries(seasonalData)) {
        const rate = data.count / data.days;
        const confidence = this.calculateSeasonalConfidence(
          data.count,
          data.days
        );

        patterns.push({
          period: season,
          incidentRate: rate,
          description: this.describeSeasonalPattern(season, rate, data.count),
          confidence,
        });
      }

      return patterns.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      logger.error('Error analyzing seasonal patterns:', error);
      return [];
    }
  }

  /**
   * Group incidents by season
   */
  static groupIncidentsBySeason(incidents: BIIncident[]): {
    [key: string]: { count: number; days: number };
  } {
    const seasonalData: { [key: string]: { count: number; days: number } } = {
      Spring: { count: 0, days: 92 },
      Summer: { count: 0, days: 92 },
      Fall: { count: 0, days: 91 },
      Winter: { count: 0, days: 90 },
    };

    incidents.forEach((incident) => {
      const date = new Date(incident.created_at as string);
      const month = date.getMonth();

      if (month >= 2 && month <= 4) seasonalData['Spring'].count++;
      else if (month >= 5 && month <= 7) seasonalData['Summer'].count++;
      else if (month >= 8 && month <= 10) seasonalData['Fall'].count++;
      else seasonalData['Winter'].count++;
    });

    return seasonalData;
  }

  /**
   * Calculate seasonal confidence
   */
  static calculateSeasonalConfidence(count: number, days: number): number {
    // Higher confidence for more data points
    const rate = count / days;
    return Math.min(0.95, Math.max(0.3, rate * 10));
  }

  /**
   * Describe seasonal pattern
   */
  static describeSeasonalPattern(
    season: string,
    rate: number,
    count: number
  ): string {
    if (rate > 0.5)
      return `High incident rate during ${season} (${count} incidents)`;
    if (rate > 0.2)
      return `Moderate incident rate during ${season} (${count} incidents)`;
    return `Low incident rate during ${season} (${count} incidents)`;
  }

  /**
   * Analyze monthly patterns
   */
  static async analyzeMonthlyPatterns(
    facilityId: string
  ): Promise<SeasonalPattern[]> {
    try {
      const { data: incidents, error } = await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
        );

      if (error) throw error;

      if (!incidents || incidents.length === 0) return [];

      const monthlyData = this.groupIncidentsByMonth(
        incidents as Array<Record<string, unknown> & { created_at: string }>
      );
      const patterns: SeasonalPattern[] = [];

      const monthNames = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];

      for (const [monthKey, count] of Object.entries(monthlyData)) {
        const monthIndex = parseInt(monthKey.split('-')[1]) - 1;
        const monthName = monthNames[monthIndex];
        const daysInMonth = this.getDaysInMonth(monthKey);
        const rate = count / daysInMonth;
        const confidence = this.calculateSeasonalConfidence(count, daysInMonth);

        patterns.push({
          period: monthName,
          incidentRate: rate,
          description: this.describeMonthlyPattern(monthName, rate, count),
          confidence,
        });
      }

      return patterns.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      logger.error('Error analyzing monthly patterns:', error);
      return [];
    }
  }

  /**
   * Group incidents by month
   */
  private static groupIncidentsByMonth(
    incidents: Array<Record<string, unknown> & { created_at: string }>
  ): { [key: string]: number } {
    const monthlyData: { [key: string]: number } = {};

    incidents.forEach((incident) => {
      const date = new Date(incident.created_at as string);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });

    return monthlyData;
  }

  /**
   * Get days in a specific month
   */
  private static getDaysInMonth(monthKey: string): number {
    const [year, month] = monthKey.split('-').map(Number);
    return new Date(year, month, 0).getDate();
  }

  /**
   * Describe monthly pattern
   */
  private static describeMonthlyPattern(
    monthName: string,
    rate: number,
    count: number
  ): string {
    if (rate > 0.5)
      return `High incident rate in ${monthName} (${count} incidents)`;
    if (rate > 0.2)
      return `Moderate incident rate in ${monthName} (${count} incidents)`;
    return `Low incident rate in ${monthName} (${count} incidents)`;
  }

  /**
   * Analyze day-of-week patterns
   */
  static async analyzeDayOfWeekPatterns(
    facilityId: string
  ): Promise<SeasonalPattern[]> {
    try {
      const { data: incidents, error } = await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('facility_id', facilityId)
        .gte(
          'created_at',
          new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
        ); // Last 90 days

      if (error) throw error;

      if (!incidents || incidents.length === 0) return [];

      const dayOfWeekData = this.groupIncidentsByDayOfWeek(
        incidents as Array<Record<string, unknown> & { created_at: string }>
      );
      const patterns: SeasonalPattern[] = [];

      const dayNames = [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];

      for (const [dayIndex, count] of Object.entries(dayOfWeekData)) {
        const dayName = dayNames[parseInt(dayIndex)];
        const daysInPeriod = 90 / 7; // Approximate days per day of week in 90 days
        const rate = count / daysInPeriod;
        const confidence = this.calculateSeasonalConfidence(
          count,
          daysInPeriod
        );

        patterns.push({
          period: dayName,
          incidentRate: rate,
          description: this.describeDayOfWeekPattern(dayName, rate, count),
          confidence,
        });
      }

      return patterns.sort((a, b) => b.confidence - a.confidence);
    } catch (error) {
      logger.error('Error analyzing day-of-week patterns:', error);
      return [];
    }
  }

  /**
   * Group incidents by day of week
   */
  private static groupIncidentsByDayOfWeek(
    incidents: Array<Record<string, unknown> & { created_at: string }>
  ): { [key: string]: number } {
    const dayOfWeekData: { [key: string]: number } = {};

    incidents.forEach((incident) => {
      const date = new Date(incident.created_at as string);
      const dayOfWeek = date.getDay();
      dayOfWeekData[dayOfWeek.toString()] =
        (dayOfWeekData[dayOfWeek.toString()] || 0) + 1;
    });

    return dayOfWeekData;
  }

  /**
   * Describe day-of-week pattern
   */
  private static describeDayOfWeekPattern(
    dayName: string,
    rate: number,
    count: number
  ): string {
    if (rate > 0.5)
      return `High incident rate on ${dayName}s (${count} incidents)`;
    if (rate > 0.2)
      return `Moderate incident rate on ${dayName}s (${count} incidents)`;
    return `Low incident rate on ${dayName}s (${count} incidents)`;
  }
}
