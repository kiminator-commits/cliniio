import { RealtimeManager } from '@/services/_core/realtimeManager';

export class RealtimeAuditor {
  /**
   * Audit current realtime usage and identify issues
   */
  static audit(): {
    issues: string[];
    recommendations: string[];
    stats: Record<string, unknown>;
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    const stats = RealtimeManager.getStats();

    // Check for excessive channels
    if (stats.activeChannels > 20) {
      issues.push(
        `Too many active channels: ${stats.activeChannels} (should be < 20)`
      );
      recommendations.push(
        'Review component lifecycle and ensure proper cleanup'
      );
    }

    // Check for excessive subscribers
    if (stats.totalSubscribers > 100) {
      issues.push(
        `Too many total subscribers: ${stats.totalSubscribers} (should be < 100)`
      );
      recommendations.push(
        'Consolidate subscriptions and check for memory leaks'
      );
    }

    // Check individual tables
    Object.entries(stats.tableSubscribers).forEach(([table, count]) => {
      if (typeof count === 'number' && count > 10) {
        issues.push(`Table ${table} has ${count} subscribers (should be < 10)`);
        recommendations.push(
          `Consolidate ${table} subscriptions or implement batching`
        );
      }
    });

    // Check for potential memory leaks
    if (stats.activeChannels > 0 && stats.totalSubscribers === 0) {
      issues.push(
        'Active channels with no subscribers - potential memory leak'
      );
      recommendations.push('Force cleanup with RealtimeManager.cleanup()');
    }

    return { issues, recommendations, stats };
  }

  /**
   * Generate detailed report
   */
  static generateReport(): void {
    const { issues, recommendations, stats } = this.audit();

    console.group('🔍 REALTIME AUDIT REPORT');

    console.log('📊 Current Stats:');
    console.log(`  Active Channels: ${stats.activeChannels}`);
    console.log(`  Total Subscribers: ${stats.totalSubscribers}`);
    console.log('  Table Breakdown:', stats.tableSubscribers);

    if (issues.length > 0) {
      console.group('🚨 Issues Found:');
      issues.forEach((issue) => console.warn(`  - ${issue}`));
      console.groupEnd();
    } else {
      console.log('✅ No issues found');
    }

    if (recommendations.length > 0) {
      console.group('💡 Recommendations:');
      recommendations.forEach((rec) => console.log(`  - ${rec}`));
      console.groupEnd();
    }

    console.groupEnd();
  }

  /**
   * Check if cleanup is needed
   */
  static needsCleanup(): boolean {
    const stats = RealtimeManager.getStats();
    return stats.activeChannels > 25 || stats.totalSubscribers > 120;
  }

  /**
   * Perform emergency cleanup
   */
  static emergencyCleanup(): void {
    console.warn('🚨 EMERGENCY CLEANUP INITIATED');

    try {
      RealtimeManager.cleanup();
      console.log('✅ Emergency cleanup completed');

      // Verify cleanup
      const stats = RealtimeManager.getStats();
      console.log('📊 Post-cleanup stats:', stats);
    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error);
    }
  }

  /**
   * Monitor for rapid subscription growth
   */
  static startGrowthMonitoring(): () => void {
    let lastStats = RealtimeManager.getStats();
    let growthCount = 0;

    const interval = setInterval(() => {
      const currentStats = RealtimeManager.getStats();

      // Check for rapid growth
      if (currentStats.activeChannels > lastStats.activeChannels + 5) {
        growthCount++;
        console.warn(
          `🚨 RAPID CHANNEL GROWTH DETECTED: ${lastStats.activeChannels} → ${currentStats.activeChannels}`
        );

        if (growthCount >= 3) {
          console.error(
            '🚨 CRITICAL: Sustained rapid growth - forcing cleanup'
          );
          this.emergencyCleanup();
          growthCount = 0;
        }
      } else {
        growthCount = Math.max(0, growthCount - 1);
      }

      lastStats = currentStats;
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }
}

// Auto-start growth monitoring in development
if (import.meta.env.DEV) {
  console.log('🔍 Starting realtime growth monitoring...');
  RealtimeAuditor.startGrowthMonitoring();
}
