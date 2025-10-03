export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface PerformanceThreshold {
  metric: string;
  warning: number;
  critical: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
}

export interface PerformanceAlert {
  id: string;
  metric: string;
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  score: number; // 0-100
  checks: Array<{
    name: string;
    status: 'pass' | 'fail' | 'warn';
    message: string;
    duration: number;
  }>;
  metrics: {
    cpu: number;
    memory: number;
    responseTime: number;
    errorRate: number;
    throughput: number;
  };
  lastUpdated: Date;
}

export interface PerformanceSnapshot {
  timestamp: Date;
  metrics: Map<string, number>;
  health: SystemHealth;
  alerts: PerformanceAlert[];
}

export interface PerformanceTrend {
  metric: string;
  trend: 'improving' | 'stable' | 'degrading';
  changePercent: number;
  period: string;
}

export interface PerformanceInsight {
  type: 'optimization' | 'warning' | 'critical';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  recommendations: string[];
}
