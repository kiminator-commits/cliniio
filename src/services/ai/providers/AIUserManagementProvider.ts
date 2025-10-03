import { supabase } from '../../../lib/supabaseClient';

export interface FacilityUser {
  id: string;
  role: string;
  full_name: string;
  department: string;
  is_active: boolean;
  facility_id: string;
}

export interface UserRole {
  role: string;
  description: string;
  capabilities: string[];
  compatibleCategories: string[];
}

export interface UserWorkload {
  userId: string;
  currentTasks: number;
  totalPoints: number;
  totalDuration: number;
  capacity: number;
  utilization: number; // percentage
}

export class AIUserManagementProvider {
  /**
   * Get facility users and their roles
   */
  async getFacilityUsers(facilityId: string): Promise<FacilityUser[]> {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, role, department, is_active, facility_id')
      .eq('facility_id', facilityId)
      .eq('is_active', true);

    if (error) throw error;

    return (users || []).map((user) => {
      const userData = user as {
        id: string;
        role: string;
        full_name: string;
        department: string;
        is_active: boolean;
        facility_id: string;
      };
      return {
        id: userData.id,
        role: userData.role,
        full_name: userData.full_name,
        department: userData.department,
        is_active: userData.is_active,
        facility_id: userData.facility_id,
      };
    });
  }

  /**
   * Get users by role
   */
  async getUsersByRole(facilityId: string, role: string): Promise<FacilityUser[]> {
    const users = await this.getFacilityUsers(facilityId);
    return users.filter((user) => user.role === role);
  }

  /**
   * Get users by department
   */
  async getUsersByDepartment(facilityId: string, department: string): Promise<FacilityUser[]> {
    const users = await this.getFacilityUsers(facilityId);
    return users.filter((user) => user.department === department);
  }

  /**
   * Get available user roles
   */
  getAvailableRoles(): UserRole[] {
    return [
      {
        role: 'technician',
        description: 'Equipment maintenance and repair specialist',
        capabilities: ['equipment_maintenance', 'tool_repair', 'calibration'],
        compatibleCategories: ['equipment', 'compliance'],
      },
      {
        role: 'operator',
        description: 'Daily operations and sterilization specialist',
        capabilities: ['sterilization', 'daily_operations', 'bi_testing'],
        compatibleCategories: ['operational', 'compliance'],
      },
      {
        role: 'cleaning_staff',
        description: 'Environmental cleaning and sanitation specialist',
        capabilities: ['environmental_cleaning', 'sanitization', 'compliance'],
        compatibleCategories: ['compliance', 'operational'],
      },
      {
        role: 'inventory_manager',
        description: 'Inventory management and supply specialist',
        capabilities: ['inventory_management', 'supply_ordering', 'stock_control'],
        compatibleCategories: ['operational'],
      },
      {
        role: 'supervisor',
        description: 'Operations oversight and safety specialist',
        capabilities: ['safety_investigation', 'quality_control', 'oversight'],
        compatibleCategories: ['safety', 'operational'],
      },
      {
        role: 'manager',
        description: 'Facility management and coordination',
        capabilities: ['facility_management', 'coordination', 'planning'],
        compatibleCategories: ['operational', 'safety', 'compliance'],
      },
    ];
  }

  /**
   * Check if role is compatible with task category
   */
  isRoleCompatibleWithCategory(role: string, category: string): boolean {
    const roles = this.getAvailableRoles();
    const userRole = roles.find((r) => r.role === role);
    
    if (!userRole) return false;
    
    return userRole.compatibleCategories.includes(category);
  }

  /**
   * Get role capabilities
   */
  getRoleCapabilities(role: string): string[] {
    const roles = this.getAvailableRoles();
    const userRole = roles.find((r) => r.role === role);
    return userRole?.capabilities || [];
  }

  /**
   * Find best user match for a task
   */
  findBestUserMatch(
    task: {
      category: string;
      assignedRole?: string;
      priority: string;
      estimatedDuration: number;
    },
    availableUsers: FacilityUser[],
    currentWorkloads?: Map<string, UserWorkload>
  ): FacilityUser | null {
    // First, try to match by assigned role
    if (task.assignedRole) {
      const roleMatch = availableUsers.find(
        (user) => user.role === task.assignedRole
      );
      if (roleMatch) return roleMatch;
    }

    // Then try to match by category compatibility
    const categoryMatches = availableUsers.filter((user) =>
      this.isRoleCompatibleWithCategory(user.role, task.category)
    );

    if (categoryMatches.length > 0) {
      // If we have workload information, choose the user with least workload
      if (currentWorkloads) {
        return categoryMatches.reduce((best, current) => {
          const bestWorkload = currentWorkloads.get(best.id);
          const currentWorkload = currentWorkloads.get(current.id);
          
          if (!bestWorkload) return current;
          if (!currentWorkload) return best;
          
          return currentWorkload.utilization < bestWorkload.utilization ? current : best;
        });
      }
      
      return categoryMatches[0];
    }

    // Fallback to any available user with least workload
    if (currentWorkloads && availableUsers.length > 0) {
      return availableUsers.reduce((best, current) => {
        const bestWorkload = currentWorkloads.get(best.id);
        const currentWorkload = currentWorkloads.get(current.id);
        
        if (!bestWorkload) return current;
        if (!currentWorkload) return best;
        
        return currentWorkload.utilization < bestWorkload.utilization ? current : best;
      });
    }

    return availableUsers[0] || null;
  }

  /**
   * Calculate user workload
   */
  calculateUserWorkload(
    userId: string,
    currentTasks: number,
    totalPoints: number,
    totalDuration: number,
    maxTasks: number = 5
  ): UserWorkload {
    const capacity = maxTasks;
    const utilization = capacity > 0 ? (currentTasks / capacity) * 100 : 0;

    return {
      userId,
      currentTasks,
      totalPoints,
      totalDuration,
      capacity,
      utilization,
    };
  }

  /**
   * Get user workload statistics
   */
  getUserWorkloadStatistics(
    users: FacilityUser[],
    workloads: Map<string, UserWorkload>
  ): {
    totalUsers: number;
    averageUtilization: number;
    overloadedUsers: number;
    underutilizedUsers: number;
    workloadByRole: Record<string, number>;
    workloadDistribution: {
      low: number; // < 50%
      medium: number; // 50-80%
      high: number; // > 80%
    };
  } {
    const totalUsers = users.length;
    let totalUtilization = 0;
    let overloadedUsers = 0;
    let underutilizedUsers = 0;
    const workloadByRole: Record<string, number> = {};
    const workloadDistribution = { low: 0, medium: 0, high: 0 };

    users.forEach((user) => {
      const workload = workloads.get(user.id);
      if (workload) {
        totalUtilization += workload.utilization;
        
        if (workload.utilization > 100) {
          overloadedUsers++;
        } else if (workload.utilization < 50) {
          underutilizedUsers++;
        }

        // Categorize workload
        if (workload.utilization < 50) {
          workloadDistribution.low++;
        } else if (workload.utilization <= 80) {
          workloadDistribution.medium++;
        } else {
          workloadDistribution.high++;
        }

        // Track by role
        workloadByRole[user.role] = (workloadByRole[user.role] || 0) + workload.utilization;
      }
    });

    const averageUtilization = totalUsers > 0 ? totalUtilization / totalUsers : 0;

    return {
      totalUsers,
      averageUtilization,
      overloadedUsers,
      underutilizedUsers,
      workloadByRole,
      workloadDistribution,
    };
  }

  /**
   * Get users with capacity for more tasks
   */
  getUsersWithCapacity(
    users: FacilityUser[],
    workloads: Map<string, UserWorkload>,
    maxTasksPerUser: number
  ): FacilityUser[] {
    return users.filter((user) => {
      const workload = workloads.get(user.id);
      return !workload || workload.currentTasks < maxTasksPerUser;
    });
  }

  /**
   * Get overloaded users
   */
  getOverloadedUsers(
    users: FacilityUser[],
    workloads: Map<string, UserWorkload>,
    maxTasksPerUser: number
  ): FacilityUser[] {
    return users.filter((user) => {
      const workload = workloads.get(user.id);
      return workload && workload.currentTasks > maxTasksPerUser;
    });
  }

  /**
   * Balance workload across users
   */
  balanceWorkload(
    users: FacilityUser[],
    workloads: Map<string, UserWorkload>,
    maxTasksPerUser: number
  ): {
    recommendations: Array<{
      type: 'redistribute' | 'add_user' | 'reduce_tasks';
      description: string;
      priority: 'low' | 'medium' | 'high';
    }>;
    canBalance: boolean;
  } {
    const recommendations: Array<{
      type: 'redistribute' | 'add_user' | 'reduce_tasks';
      description: string;
      priority: 'low' | 'medium' | 'high';
    }> = [];

    const overloadedUsers = this.getOverloadedUsers(users, workloads, maxTasksPerUser);
    const usersWithCapacity = this.getUsersWithCapacity(users, workloads, maxTasksPerUser);

    if (overloadedUsers.length > 0) {
      if (usersWithCapacity.length > 0) {
        recommendations.push({
          type: 'redistribute',
          description: `Redistribute tasks from ${overloadedUsers.length} overloaded users to ${usersWithCapacity.length} users with capacity`,
          priority: 'high',
        });
      } else {
        recommendations.push({
          type: 'add_user',
          description: `All users are at capacity. Consider adding more staff or increasing capacity limits`,
          priority: 'high',
        });
      }
    }

    const averageUtilization = Array.from(workloads.values()).reduce(
      (sum, workload) => sum + workload.utilization,
      0
    ) / workloads.size;

    if (averageUtilization > 90) {
      recommendations.push({
        type: 'reduce_tasks',
        description: 'Overall utilization is very high. Consider reducing task load or adding resources',
        priority: 'medium',
      });
    }

    return {
      recommendations,
      canBalance: usersWithCapacity.length > 0,
    };
  }

  /**
   * Get user performance metrics
   */
  async getUserPerformanceMetrics(
    facilityId: string,
    _timeRange?: { start: Date; end: Date }
  ): Promise<{
    userId: string;
    userName: string;
    role: string;
    tasksCompleted: number;
    averageCompletionTime: number;
    pointsEarned: number;
    efficiency: number;
  }[]> {
    // This would typically query task completion data
    // For now, return mock data structure
    const users = await this.getFacilityUsers(facilityId);
    
    return users.map((user) => ({
      userId: user.id,
      userName: user.full_name,
      role: user.role,
      tasksCompleted: 0, // Would be calculated from actual data
      averageCompletionTime: 0,
      pointsEarned: 0,
      efficiency: 0,
    }));
  }

  /**
   * Validate user data
   */
  validateUserData(user: Partial<FacilityUser>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!user.id || user.id.trim() === '') {
      errors.push('User ID is required');
    }

    if (!user.role || user.role.trim() === '') {
      errors.push('User role is required');
    }

    if (!user.full_name || user.full_name.trim() === '') {
      errors.push('Full name is required');
    }

    if (!user.facility_id || user.facility_id.trim() === '') {
      errors.push('Facility ID is required');
    }

    // Validate role exists
    const availableRoles = this.getAvailableRoles();
    if (user.role && !availableRoles.find((r) => r.role === user.role)) {
      errors.push(`Invalid role: ${user.role}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export user data
   */
  exportUserData(users: FacilityUser[]): string {
    return JSON.stringify(users, null, 2);
  }

  /**
   * Import user data
   */
  importUserData(jsonData: string): {
    success: boolean;
    users: FacilityUser[];
    errors: string[];
  } {
    try {
      const users = JSON.parse(jsonData) as FacilityUser[];
      
      if (!Array.isArray(users)) {
        return {
          success: false,
          users: [],
          errors: ['Invalid format: expected array of users'],
        };
      }

      const errors: string[] = [];
      users.forEach((user, index) => {
        const validation = this.validateUserData(user);
        if (!validation.isValid) {
          errors.push(`User ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      return {
        success: errors.length === 0,
        users,
        errors,
      };
    } catch {
      return {
        success: false,
        users: [],
        errors: ['Invalid JSON format'],
      };
    }
  }
}
