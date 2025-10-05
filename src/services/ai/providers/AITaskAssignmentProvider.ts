import { askCliniioAI } from '../../aiService';
import {
  OperationalGap,
  DailyTaskAssignment,
  generateAITaskId,
  generateTaskId,
} from '../../aiDailyTaskProgress';
import {
  AdminTaskConfig,
  getPriorityScore,
  isRoleCompatibleWithCategory,
} from '../../aiDailyTaskConfig';

export class AITaskAssignmentProvider {
  /**
   * Use AI to prioritize and assign tasks
   */
  async assignTasksWithAI(
    gaps: OperationalGap[],
    users: Array<{ id: string; role: string; [key: string]: unknown }>,
    config: AdminTaskConfig
  ): Promise<DailyTaskAssignment[]> {
    try {
      // Prepare data for AI analysis
      const analysisData = this.prepareAnalysisData(gaps, users, config);

      // Use AI to prioritize and assign tasks
      const aiResponse = await askCliniioAI({
        prompt: this.buildAIPrompt(analysisData),
        context: 'Daily Operations Task Assignment',
      });

      // Parse AI response and create task assignments
      return this.parseAITaskAssignments(aiResponse, gaps, users, config);
    } catch (error) {
      console.error('AI task assignment failed, using fallback logic:', error);
      return this.fallbackTaskAssignment(gaps, users, config);
    }
  }

  /**
   * Prepare data for AI analysis
   */
  private prepareAnalysisData(
    gaps: OperationalGap[],
    users: Array<{ id: string; role: string; [key: string]: unknown }>,
    config: AdminTaskConfig
  ) {
    return {
      operationalGaps: gaps,
      availableUsers: users,
      configuration: config,
      facilityContext: {
        totalGaps: gaps.length,
        gapTypes: gaps.reduce(
          (acc, gap) => {
            acc[gap.type] = (acc[gap.type] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
        priorityDistribution: gaps.reduce(
          (acc, gap) => {
            acc[gap.priority] = (acc[gap.priority] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ),
      },
    };
  }

  /**
   * Build AI prompt for task assignment
   */
  private buildAIPrompt(analysisData: Record<string, unknown>): string {
    return `Analyze the following operational gaps and assign tasks to users optimally:

Operational Gaps: ${JSON.stringify(analysisData.operationalGaps, null, 2)}
Available Users: ${JSON.stringify(analysisData.availableUsers, null, 2)}
Configuration: ${JSON.stringify(analysisData.configuration, null, 2)}
Facility Context: ${JSON.stringify(analysisData.facilityContext, null, 2)}

Please provide a JSON response with task assignments that:
1. Respects max tasks per user (${analysisData.configuration.maxTasksPerUser})
2. Prioritizes urgent and high priority tasks
3. Matches user roles to task categories
4. Balances workload across users
5. Considers task priority and estimated duration

Return ONLY valid JSON in this exact format:
[
  {
    "userId": "user_id_here",
    "tasks": [
      {
        "gapId": "gap_id_here"
      }
    ]
  }
]

Each task should reference a gapId from the operational gaps. Do not include any explanatory text, only the JSON array.`;
  }

  /**
   * Parse AI response into task assignments
   */
  private parseAITaskAssignments(
    aiResponse: string,
    gaps: OperationalGap[],
    users: Array<{ id: string; role: string; [key: string]: unknown }>,
    config: AdminTaskConfig
  ): DailyTaskAssignment[] {
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.warn('No JSON array found in AI response, using fallback');
        return this.fallbackTaskAssignment(gaps, users, config);
      }

      const aiAssignments = JSON.parse(jsonMatch[0]);

      if (!Array.isArray(aiAssignments)) {
        console.warn('AI response is not an array, using fallback');
        return this.fallbackTaskAssignment(gaps, users, config);
      }

      const assignments: DailyTaskAssignment[] = [];
      const userMap = new Map(users.map((user) => [user.id, user]));
      const gapMap = new Map(gaps.map((gap) => [gap.id, gap]));

      for (const aiAssignment of aiAssignments) {
        if (!aiAssignment.userId || !Array.isArray(aiAssignment.tasks)) {
          continue;
        }

        const user = userMap.get(aiAssignment.userId);
        if (!user) {
          console.warn(
            `User ${aiAssignment.userId} not found, skipping assignment`
          );
          continue;
        }

        const userTasks = [];
        for (const aiTask of aiAssignment.tasks) {
          if (!aiTask.gapId) continue;

          const gap = gapMap.get(aiTask.gapId);
          if (!gap) continue;

          userTasks.push({
            id: generateAITaskId(),
            title: gap.title,
            description: gap.description,
            category: gap.category,
            priority: gap.priority,
            points: gap.estimatedPoints,
            estimatedDuration: gap.estimatedDuration,
            dueDate: gap.dueDate,
            type: gap.type,
            assignedRole: gap.assignedRole,
            facilityId: gap.facilityId,
            metadata: gap.metadata,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        if (userTasks.length > 0) {
          assignments.push({
            userId: aiAssignment.userId,
            tasks: userTasks,
          });
        }
      }

      // If AI parsing produced valid assignments, return them
      if (assignments.length > 0) {
        return assignments;
      }

      console.warn('AI parsing produced no valid assignments, using fallback');
      return this.fallbackTaskAssignment(gaps, users, config);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.fallbackTaskAssignment(gaps, users, config);
    }
  }

  /**
   * Fallback task assignment logic
   */
  fallbackTaskAssignment(
    gaps: OperationalGap[],
    users: Array<{ id: string; role: string; [key: string]: unknown }>,
    config: AdminTaskConfig
  ): DailyTaskAssignment[] {
    const assignments: DailyTaskAssignment[] = [];

    // Sort gaps by priority
    const sortedGaps = [...gaps].sort((a, b) => {
      return getPriorityScore(b.priority) - getPriorityScore(a.priority);
    });

    // Assign tasks to users based on role matching and max tasks per user
    const userTaskCounts = new Map<string, number>();

    for (const gap of sortedGaps) {
      // Find available users for this task
      const availableUsers = users.filter((user) => {
        const currentTaskCount = userTaskCounts.get(user.id) || 0;
        return currentTaskCount < config.maxTasksPerUser;
      });

      if (availableUsers.length === 0) break;

      // Find best user match based on role
      const bestUser = this.findBestUserMatch(gap, availableUsers);

      if (bestUser) {
        const currentTaskCount = userTaskCounts.get(bestUser.id) || 0;
        userTaskCounts.set(bestUser.id, currentTaskCount + 1);

        // Create or update assignment
        let assignment = assignments.find((a) => a.userId === bestUser.id);
        if (!assignment) {
          assignment = { userId: bestUser.id, tasks: [] };
          assignments.push(assignment);
        }

        assignment.tasks.push({
          id: generateTaskId(),
          title: gap.title,
          description: gap.description,
          category: gap.category,
          priority: gap.priority,
          points: gap.estimatedPoints,
          dueDate: gap.dueDate,
          type: gap.type,
          estimatedDuration: gap.estimatedDuration,
          assignedRole: gap.assignedRole,
          facilityId: gap.facilityId,
          metadata: gap.metadata,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }

    return assignments;
  }

  /**
   * Find best user match for a task
   */
  private findBestUserMatch(
    gap: OperationalGap,
    availableUsers: Array<{ id: string; role: string; [key: string]: unknown }>
  ): { id: string; role: string; [key: string]: unknown } | null {
    // First, try to match by assigned role
    if (gap.assignedRole) {
      const roleMatch = availableUsers.find(
        (user) => user.role === gap.assignedRole
      );
      if (roleMatch) return roleMatch;
    }

    // Then try to match by category
    const categoryMatches = availableUsers.filter((user) =>
      isRoleCompatibleWithCategory(user.role, gap.category)
    );

    if (categoryMatches.length > 0) {
      return categoryMatches[0];
    }

    // Fallback to any available user
    return availableUsers[0] || null;
  }

  /**
   * Validate task assignments
   */
  validateTaskAssignments(
    assignments: DailyTaskAssignment[],
    config: AdminTaskConfig
  ): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    assignments.forEach((assignment, index) => {
      if (!assignment.userId) {
        errors.push(`Assignment ${index + 1}: Missing userId`);
      }

      if (!assignment.tasks || assignment.tasks.length === 0) {
        warnings.push(`Assignment ${index + 1}: No tasks assigned`);
      }

      if (
        assignment.tasks &&
        assignment.tasks.length > config.maxTasksPerUser
      ) {
        errors.push(
          `Assignment ${index + 1}: Exceeds max tasks per user (${assignment.tasks.length} > ${config.maxTasksPerUser})`
        );
      }

      assignment.tasks?.forEach((task, taskIndex) => {
        if (!task.title) {
          errors.push(
            `Assignment ${index + 1}, Task ${taskIndex + 1}: Missing title`
          );
        }

        if (!task.category) {
          errors.push(
            `Assignment ${index + 1}, Task ${taskIndex + 1}: Missing category`
          );
        }

        if (!task.priority) {
          errors.push(
            `Assignment ${index + 1}, Task ${taskIndex + 1}: Missing priority`
          );
        }

        if (task.points <= 0) {
          warnings.push(
            `Assignment ${index + 1}, Task ${taskIndex + 1}: Zero or negative points`
          );
        }

        if (task.estimatedDuration <= 0) {
          warnings.push(
            `Assignment ${index + 1}, Task ${taskIndex + 1}: Zero or negative duration`
          );
        }
      });
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get assignment statistics
   */
  getAssignmentStatistics(assignments: DailyTaskAssignment[]): {
    totalAssignments: number;
    totalTasks: number;
    averageTasksPerUser: number;
    tasksByPriority: Record<string, number>;
    tasksByCategory: Record<string, number>;
    totalPoints: number;
    totalEstimatedDuration: number;
  } {
    const totalAssignments = assignments.length;
    const totalTasks = assignments.reduce(
      (sum, assignment) => sum + assignment.tasks.length,
      0
    );
    const averageTasksPerUser =
      totalAssignments > 0 ? totalTasks / totalAssignments : 0;

    const tasksByPriority: Record<string, number> = {};
    const tasksByCategory: Record<string, number> = {};
    let totalPoints = 0;
    let totalEstimatedDuration = 0;

    assignments.forEach((assignment) => {
      assignment.tasks.forEach((task) => {
        tasksByPriority[task.priority] =
          (tasksByPriority[task.priority] || 0) + 1;
        tasksByCategory[task.category] =
          (tasksByCategory[task.category] || 0) + 1;
        totalPoints += task.points;
        totalEstimatedDuration += task.estimatedDuration;
      });
    });

    return {
      totalAssignments,
      totalTasks,
      averageTasksPerUser,
      tasksByPriority,
      tasksByCategory,
      totalPoints,
      totalEstimatedDuration,
    };
  }

  /**
   * Optimize task assignments for workload balance
   */
  optimizeTaskAssignments(
    assignments: DailyTaskAssignment[],
    config: AdminTaskConfig
  ): DailyTaskAssignment[] {
    // Calculate current workload for each user
    const userWorkloads = new Map<
      string,
      { taskCount: number; totalPoints: number; totalDuration: number }
    >();

    assignments.forEach((assignment) => {
      const workload = {
        taskCount: assignment.tasks.length,
        totalPoints: assignment.tasks.reduce(
          (sum, task) => sum + task.points,
          0
        ),
        totalDuration: assignment.tasks.reduce(
          (sum, task) => sum + task.estimatedDuration,
          0
        ),
      };
      userWorkloads.set(assignment.userId, workload);
    });

    // Find overloaded users and redistribute tasks
    const optimizedAssignments = [...assignments];
    const overloadedUsers = Array.from(userWorkloads.entries())
      .filter(([_, workload]) => workload.taskCount > config.maxTasksPerUser)
      .map(([userId, _]) => userId);

    // Simple redistribution logic - move excess tasks to users with capacity
    overloadedUsers.forEach((userId) => {
      const assignment = optimizedAssignments.find((a) => a.userId === userId);
      if (!assignment) return;

      const excessTasks = assignment.tasks.slice(config.maxTasksPerUser);
      assignment.tasks = assignment.tasks.slice(0, config.maxTasksPerUser);

      // Find users with capacity and redistribute excess tasks
      const availableUsers = optimizedAssignments.filter(
        (a) => a.tasks.length < config.maxTasksPerUser && a.userId !== userId
      );

      excessTasks.forEach((task) => {
        if (availableUsers.length > 0) {
          const targetUser = availableUsers[0];
          targetUser.tasks.push(task);

          // Update available users list
          const index = availableUsers.findIndex(
            (u) => u.userId === targetUser.userId
          );
          if (index >= 0 && targetUser.tasks.length >= config.maxTasksPerUser) {
            availableUsers.splice(index, 1);
          }
        }
      });
    });

    return optimizedAssignments;
  }

  /**
   * Export task assignments
   */
  exportTaskAssignments(assignments: DailyTaskAssignment[]): string {
    return JSON.stringify(assignments, null, 2);
  }

  /**
   * Import task assignments
   */
  importTaskAssignments(jsonData: string): {
    success: boolean;
    assignments: DailyTaskAssignment[];
    errors: string[];
  } {
    try {
      const assignments = JSON.parse(jsonData) as DailyTaskAssignment[];

      if (!Array.isArray(assignments)) {
        return {
          success: false,
          assignments: [],
          errors: ['Invalid format: expected array of assignments'],
        };
      }

      // Basic validation
      const errors: string[] = [];
      assignments.forEach((assignment, index) => {
        if (!assignment.userId) {
          errors.push(`Assignment ${index + 1}: Missing userId`);
        }
        if (!assignment.tasks || !Array.isArray(assignment.tasks)) {
          errors.push(
            `Assignment ${index + 1}: Missing or invalid tasks array`
          );
        }
      });

      return {
        success: errors.length === 0,
        assignments,
        errors,
      };
    } catch {
      return {
        success: false,
        assignments: [],
        errors: ['Invalid JSON format'],
      };
    }
  }
}
