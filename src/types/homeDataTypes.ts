import { HomeTask } from './homeTypes';
import { HomePerformanceMetrics } from '../services/home/homeMetricsService';
import { LeaderboardData } from '../services/leaderboardService';
import { SterilizationHomeMetrics } from '../services/homeSterilizationIntegration';
import { HomeIntegrationMetrics } from '../services/homeIntegrationService';

export interface HomeData {
  tasks: HomeTask[];
  aiMetrics: HomePerformanceMetrics | null;
  sterilizationMetrics:
    | Record<string, unknown>
    | SterilizationHomeMetrics
    | null;
  integrationMetrics: Record<string, unknown> | HomeIntegrationMetrics | null;
  leaderboardData: LeaderboardData;
  loading: boolean;
  error: string | null;
}
