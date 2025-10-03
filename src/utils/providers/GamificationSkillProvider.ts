import { supabase } from '../../lib/supabaseClient';
import { SkillLevels, SterilizationCycleRow, BITestRow, InventoryCheckRow, OrderRow, CleaningTaskRow, LearningProgressRow, CertificationRow } from './GamificationTypes';

// Re-export SkillLevels for backward compatibility
export type { SkillLevels };

export class GamificationSkillProvider {
  /**
   * Calculate skill-based levels for different modules
   */
  async calculateSkillLevels(
    userId: string,
    facilityId: string
  ): Promise<SkillLevels> {
    try {
      // Sterilization skills
      const sterilizationLevel = await this.calculateSterilizationLevel(facilityId);

      // Inventory skills
      const inventoryLevel = await this.calculateInventoryLevel(facilityId);

      // Environmental cleaning skills
      const environmentalLevel = await this.calculateEnvironmentalLevel(facilityId);

      // Knowledge skills
      const knowledgeLevel = await this.calculateKnowledgeLevel(userId);

      // Overall skill level (weighted average)
      const overall = Math.round(
        sterilizationLevel * 0.3 +
          inventoryLevel * 0.25 +
          environmentalLevel * 0.25 +
          knowledgeLevel * 0.2
      );

      return {
        sterilization: sterilizationLevel,
        inventory: inventoryLevel,
        environmental: environmentalLevel,
        knowledge: knowledgeLevel,
        overall,
      };
    } catch (error) {
      console.error('Error calculating skill levels:', error);
      return {
        sterilization: 1,
        inventory: 1,
        environmental: 1,
        knowledge: 1,
        overall: 1,
      };
    }
  }

  /**
   * Calculate sterilization skill level
   */
  async calculateSterilizationLevel(facilityId: string): Promise<number> {
    try {
      // Get sterilization-related stats
      const { data: cycles } = await supabase
        .from('sterilization_cycles')
        .select('id, status, tools')
        .eq('facility_id', facilityId);

      const { data: biTests } = await supabase
        .from('bi_test_results')
        .select('id, result')
        .eq('facility_id', facilityId);

      // Calculate level based on:
      // - Completed cycles (40%)
      // - BI test pass rate (30%)
      // - Tools managed (20%)
      // - Efficiency (10%)

      if (!cycles) return 1;
      if (!biTests) return 1;

      const cyclesData = cycles as SterilizationCycleRow[];
      const biTestsData = biTests as BITestRow[];

      const completedCycles =
        cyclesData?.filter((c: SterilizationCycleRow) => c.status === 'active')
          .length || 0;
      const totalCycles = cyclesData?.length || 0;
      const biPassRate =
        biTestsData && biTestsData.length > 0
          ? biTestsData.filter((t: BITestRow) => t.result === 'pass').length /
            biTestsData.length
          : 0;
      const totalTools =
        cyclesData?.reduce(
          (sum: number, c: SterilizationCycleRow) => sum + (c.tools?.length || 0),
          0
        ) || 0;

      const cycleScore = Math.min(
        (completedCycles / Math.max(totalCycles, 1)) * 40,
        40
      );
      const biScore = biPassRate * 30;
      const toolScore = Math.min((totalTools / 100) * 20, 20);
      const efficiencyScore =
        totalCycles > 0 ? Math.min((completedCycles / totalCycles) * 10, 10) : 0;

      const totalScore = cycleScore + biScore + toolScore + efficiencyScore;
      return Math.max(1, Math.min(100, Math.round(totalScore)));
    } catch (error) {
      console.error('Error calculating sterilization level:', error);
      return 1;
    }
  }

  /**
   * Calculate inventory skill level
   */
  async calculateInventoryLevel(facilityId: string): Promise<number> {
    try {
      // Get inventory-related stats
      const { data: inventoryChecks } = await supabase
        .from('inventory_checks')
        .select('id, accuracy, items_checked')
        .eq('facility_id', facilityId);

      const { data: orders } = await supabase
        .from('inventory_orders')
        .select('id, status, total_items')
        .eq('facility_id', facilityId);

      // Calculate level based on:
      // - Check accuracy (40%)
      // - Items managed (30%)
      // - Order efficiency (20%)
      // - Consistency (10%)

      if (!inventoryChecks) return 1;
      if (!orders) return 1;

      const inventoryChecksData = inventoryChecks as InventoryCheckRow[];
      const ordersData = orders as OrderRow[];

      const avgAccuracy =
        inventoryChecksData && inventoryChecksData.length > 0
          ? inventoryChecksData.reduce(
              (sum: number, c: InventoryCheckRow) => sum + c.accuracy,
              0
            ) / inventoryChecksData.length
          : 0;
      const totalItems =
        inventoryChecksData?.reduce(
          (sum: number, c: InventoryCheckRow) => sum + c.items_checked,
          0
        ) || 0;
      const completedOrders =
        ordersData?.filter((o: OrderRow) => o.status === 'active').length || 0;
      const totalOrders = ordersData?.length || 0;

      const accuracyScore = avgAccuracy * 0.4;
      const itemScore = Math.min((totalItems / 500) * 30, 30);
      const orderScore =
        totalOrders > 0 ? (completedOrders / totalOrders) * 20 : 0;
      const consistencyScore =
        inventoryChecks && inventoryChecks.length > 0
          ? Math.min(inventoryChecks.length / 10, 10)
          : 0;

      const totalScore =
        accuracyScore + itemScore + orderScore + consistencyScore;
      return Math.max(1, Math.min(100, Math.round(totalScore)));
    } catch (error) {
      console.error('Error calculating inventory level:', error);
      return 1;
    }
  }

  /**
   * Calculate environmental cleaning skill level
   */
  async calculateEnvironmentalLevel(facilityId: string): Promise<number> {
    try {
      // Get environmental cleaning stats
      const { data: cleaningTasks } = await supabase
        .from('cleaning_tasks')
        .select('id, status, room_id, compliance_score')
        .eq('facility_id', facilityId);

      // Calculate level based on:
      // - Task completion (40%)
      // - Compliance score (30%)
      // - Rooms managed (20%)
      // - Efficiency (10%)

      if (!cleaningTasks) return 1;

      const cleaningTasksData = cleaningTasks as CleaningTaskRow[];

      const completedTasks =
        cleaningTasksData?.filter((t: CleaningTaskRow) => t.status === 'active')
          .length || 0;
      const totalTasks = cleaningTasksData?.length || 0;
      const avgCompliance =
        cleaningTasksData && cleaningTasksData.length > 0
          ? cleaningTasksData.reduce(
              (sum: number, t: CleaningTaskRow) => sum + t.compliance_score,
              0
            ) / cleaningTasksData.length
          : 0;
      const uniqueRooms = new Set(
        cleaningTasksData?.map((t: CleaningTaskRow) => t.room_id)
      ).size;

      const completionScore =
        totalTasks > 0 ? (completedTasks / totalTasks) * 40 : 0;
      const complianceScore = avgCompliance * 0.3;
      const roomScore = Math.min((uniqueRooms / 20) * 20, 20);
      const efficiencyScore =
        totalTasks > 0 ? Math.min((completedTasks / totalTasks) * 10, 10) : 0;

      const totalScore =
        completionScore + complianceScore + roomScore + efficiencyScore;
      return Math.max(1, Math.min(100, Math.round(totalScore)));
    } catch (error) {
      console.error('Error calculating environmental level:', error);
      return 1;
    }
  }

  /**
   * Calculate knowledge skill level
   */
  async calculateKnowledgeLevel(userId: string): Promise<number> {
    try {
      // Get user learning progress data from the correct table
      const { data: userLearningProgress } = await supabase
        .from('user_learning_progress')
        .select('score, time_spent_minutes')
        .eq('user_id', userId);

      // Get user certifications data from the correct table
      const { data: userCertifications } = await supabase
        .from('user_certifications')
        .select('expiry_date')
        .eq('user_id', userId);

      // Calculate level based on:
      // - Module completion (40%)
      // - Certification scores (30%)
      // - Time invested (20%)
      // - Recency (10%)

      if (!userLearningProgress) return 1;
      if (!userCertifications) return 1;

      const learningProgressData = userLearningProgress as LearningProgressRow[];
      const certificationsData = userCertifications as CertificationRow[];

      const completedModules = learningProgressData?.length || 0;
      const totalTime =
        learningProgressData?.reduce(
          (sum: number, m: LearningProgressRow) => sum + m.time_spent_minutes,
          0
        ) || 0;
      const validCertifications =
        certificationsData?.filter(
          (c: CertificationRow) => new Date(c.expiry_date) > new Date()
        ).length || 0;

      const moduleScore = Math.min((completedModules / 20) * 40, 40);
      const certificationScore = Math.min((validCertifications / 5) * 30, 30);
      const timeScore = Math.min((totalTime / 1000) * 20, 20); // 1000 minutes = 20 points
      const recencyScore = validCertifications > 0 ? 10 : 0;

      const totalScore =
        moduleScore + certificationScore + timeScore + recencyScore;
      return Math.max(1, Math.min(100, Math.round(totalScore)));
    } catch (error) {
      console.error('Error calculating knowledge level:', error);
      return 1;
    }
  }

  /**
   * Get skill level name
   */
  getSkillLevelName(level: number): string {
    if (level >= 90) return 'Master';
    if (level >= 80) return 'Expert';
    if (level >= 70) return 'Advanced';
    if (level >= 60) return 'Proficient';
    if (level >= 50) return 'Competent';
    if (level >= 40) return 'Skilled';
    if (level >= 30) return 'Experienced';
    if (level >= 20) return 'Developing';
    if (level >= 10) return 'Novice';
    return 'Beginner';
  }

  /**
   * Get skill level color
   */
  getSkillLevelColor(level: number): string {
    if (level >= 90) return '#8B5CF6'; // Purple
    if (level >= 80) return '#DC2626'; // Red
    if (level >= 70) return '#EA580C'; // Orange
    if (level >= 60) return '#D97706'; // Amber
    if (level >= 50) return '#059669'; // Emerald
    if (level >= 40) return '#0891B2'; // Cyan
    if (level >= 30) return '#2563EB'; // Blue
    if (level >= 20) return '#7C3AED'; // Violet
    if (level >= 10) return '#16A34A'; // Green
    return '#6B7280'; // Gray
  }

  /**
   * Get skill level icon
   */
  getSkillLevelIcon(skill: keyof Omit<SkillLevels, 'overall'>, level: number): string {
    const icons = {
      sterilization: ['🧪', '🔬', '⚗️', '🧬', '💊'],
      inventory: ['📦', '📋', '📊', '🗂️', '📈'],
      environmental: ['🧽', '🧴', '🌿', '✨', '🏆'],
      knowledge: ['📚', '🎓', '💡', '🧠', '🌟'],
    };

    const skillIcons = icons[skill];
    const iconIndex = Math.min(Math.floor(level / 20), skillIcons.length - 1);
    return skillIcons[iconIndex];
  }

  /**
   * Calculate skill improvement rate
   */
  calculateSkillImprovementRate(
    currentLevels: SkillLevels,
    previousLevels: SkillLevels
  ): {
    sterilization: number;
    inventory: number;
    environmental: number;
    knowledge: number;
    overall: number;
  } {
    return {
      sterilization: currentLevels.sterilization - previousLevels.sterilization,
      inventory: currentLevels.inventory - previousLevels.inventory,
      environmental: currentLevels.environmental - previousLevels.environmental,
      knowledge: currentLevels.knowledge - previousLevels.knowledge,
      overall: currentLevels.overall - previousLevels.overall,
    };
  }

  /**
   * Get skill recommendations
   */
  getSkillRecommendations(skillLevels: SkillLevels): Array<{
    skill: keyof Omit<SkillLevels, 'overall'>;
    currentLevel: number;
    recommendation: string;
    priority: 'low' | 'medium' | 'high';
  }> {
    const recommendations: Array<{
      skill: keyof Omit<SkillLevels, 'overall'>;
      currentLevel: number;
      recommendation: string;
      priority: 'low' | 'medium' | 'high';
    }> = [];

    const skills: Array<keyof Omit<SkillLevels, 'overall'>> = [
      'sterilization',
      'inventory',
      'environmental',
      'knowledge',
    ];

    skills.forEach((skill) => {
      const level = skillLevels[skill];
      let recommendation = '';
      let priority: 'low' | 'medium' | 'high' = 'low';

      if (level < 20) {
        recommendation = `Focus on ${skill} basics to improve your foundation`;
        priority = 'high';
      } else if (level < 40) {
        recommendation = `Practice more ${skill} tasks to reach intermediate level`;
        priority = 'medium';
      } else if (level < 60) {
        recommendation = `Continue ${skill} practice to achieve proficiency`;
        priority = 'medium';
      } else if (level < 80) {
        recommendation = `Master advanced ${skill} techniques`;
        priority = 'low';
      } else {
        recommendation = `Maintain your expert ${skill} level`;
        priority = 'low';
      }

      recommendations.push({
        skill,
        currentLevel: level,
        recommendation,
        priority,
      });
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Validate skill levels
   */
  validateSkillLevels(skillLevels: Partial<SkillLevels>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    const skills: Array<keyof SkillLevels> = [
      'sterilization',
      'inventory',
      'environmental',
      'knowledge',
      'overall',
    ];

    skills.forEach((skill) => {
      const level = skillLevels[skill];
      if (level !== undefined) {
        if (level < 1 || level > 100) {
          errors.push(`${skill} level must be between 1 and 100`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get skill level statistics
   */
  getSkillLevelStatistics(skillLevels: SkillLevels[]): {
    averageLevels: SkillLevels;
    highestLevels: SkillLevels;
    lowestLevels: SkillLevels;
    distribution: Record<keyof SkillLevels, Array<{ range: string; count: number }>>;
  } {
    if (skillLevels.length === 0) {
      return {
        averageLevels: { sterilization: 0, inventory: 0, environmental: 0, knowledge: 0, overall: 0 },
        highestLevels: { sterilization: 0, inventory: 0, environmental: 0, knowledge: 0, overall: 0 },
        lowestLevels: { sterilization: 0, inventory: 0, environmental: 0, knowledge: 0, overall: 0 },
        distribution: {
          sterilization: [],
          inventory: [],
          environmental: [],
          knowledge: [],
          overall: [],
        },
      };
    }

    const skills: Array<keyof SkillLevels> = [
      'sterilization',
      'inventory',
      'environmental',
      'knowledge',
      'overall',
    ];

    const averageLevels: SkillLevels = { sterilization: 0, inventory: 0, environmental: 0, knowledge: 0, overall: 0 };
    const highestLevels: SkillLevels = { sterilization: 0, inventory: 0, environmental: 0, knowledge: 0, overall: 0 };
    const lowestLevels: SkillLevels = { sterilization: 100, inventory: 100, environmental: 100, knowledge: 100, overall: 100 };
    const distribution: Record<keyof SkillLevels, Array<{ range: string; count: number }>> = {
      sterilization: [],
      inventory: [],
      environmental: [],
      knowledge: [],
      overall: [],
    };

    skills.forEach((skill) => {
      const levels = skillLevels.map(s => s[skill]);
      const sum = levels.reduce((acc, level) => acc + level, 0);
      const max = Math.max(...levels);
      const min = Math.min(...levels);

      averageLevels[skill] = sum / skillLevels.length;
      highestLevels[skill] = max;
      lowestLevels[skill] = min;

      // Create distribution
      const ranges = [
        { min: 1, max: 20, label: '1-20' },
        { min: 21, max: 40, label: '21-40' },
        { min: 41, max: 60, label: '41-60' },
        { min: 61, max: 80, label: '61-80' },
        { min: 81, max: 100, label: '81-100' },
      ];

      distribution[skill] = ranges.map(range => ({
        range: range.label,
        count: levels.filter(level => level >= range.min && level <= range.max).length,
      }));
    });

    return {
      averageLevels,
      highestLevels,
      lowestLevels,
      distribution,
    };
  }
}
