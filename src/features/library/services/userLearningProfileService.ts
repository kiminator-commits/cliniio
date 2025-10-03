import { supabase } from '../../../lib/supabase';

export interface UserLearningPreferences {
  preferredCategories: string[];
  preferredDuration: 'short' | 'medium' | 'long';
  preferredLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  learningGoals: string[];
  timeAvailability: number; // minutes per week
  notificationPreferences: {
    email: boolean;
    push: boolean;
    weeklyDigest: boolean;
  };
  interests: string[];
  careerGoals: string[];
}

export interface UserLearningProfile {
  id: string;
  role: string;
  department?: string;
  title?: string;
  specialization?: string;
  yearsExperience?: number;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  learningPreferences: UserLearningPreferences;
  lastUpdated: string;
}

export class UserLearningProfileService {
  private tableName = 'users';

  /**
   * Get current user's learning profile
   */
  async getUserLearningProfile(): Promise<UserLearningProfile | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const userData = data as {
        id: string;
        learning_preferences?: unknown;
        learning_goals?: unknown;
        learning_history?: unknown;
      };

      return {
        id: userData.id as string,
        role: userData.role as string,
        department: userData.department as string,
        title: userData.position as string, // Use position instead of title
        specialization: '', // Default value since field doesn't exist
        yearsExperience: 0, // Default value since field doesn't exist
        skillLevel: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced', // Default value since field doesn't exist
        learningPreferences: this.getDefaultPreferences(), // Default value since field doesn't exist
        lastUpdated: userData.updated_at as string,
      };
    } catch (error) {
      console.error('Error fetching user learning profile:', error);
      return null;
    }
  }

  /**
   * Update user's learning preferences
   */
  async updateLearningPreferences(
    preferences: Partial<UserLearningPreferences>
  ): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      // Get current preferences
      const currentProfile = await this.getUserLearningProfile();
      const currentPreferences =
        currentProfile?.learningPreferences || this.getDefaultPreferences();

      // Merge with new preferences
      const updatedPreferences = { ...currentPreferences, ...preferences };

      const { error } = await supabase
        .from('users')
        .update({
          learning_preferences: updatedPreferences,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating learning preferences:', error);
      return false;
    }
  }

  /**
   * Update user's department and role information
   */
  async updateUserInfo(updates: {
    department?: string;
    title?: string;
    specialization?: string;
    yearsExperience?: number;
    skillLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  }): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating user info:', error);
      return false;
    }
  }

  /**
   * Get learning recommendations based on user profile
   */
  async getLearningRecommendations(): Promise<{
    skillGaps: string[];
    recommendedCategories: string[];
    suggestedLevel: string;
    timeRecommendations: string;
  }> {
    try {
      const profile = await this.getUserLearningProfile();
      if (!profile) {
        return {
          skillGaps: [],
          recommendedCategories: [],
          suggestedLevel: 'Beginner',
          timeRecommendations: 'Start with 30-minute sessions',
        };
      }

      // Analyze skill gaps based on role and department
      const skillGaps = this.analyzeSkillGaps(profile);

      // Recommend categories based on role and interests
      const recommendedCategories = this.getRecommendedCategories(profile);

      // Suggest appropriate level
      const suggestedLevel = this.getSuggestedLevel(profile);

      // Time recommendations
      const timeRecommendations = this.getTimeRecommendations(profile);

      return {
        skillGaps,
        recommendedCategories,
        suggestedLevel,
        timeRecommendations,
      };
    } catch (error) {
      console.error('Error getting learning recommendations:', error);
      return {
        skillGaps: [],
        recommendedCategories: [],
        suggestedLevel: 'Beginner',
        timeRecommendations: 'Start with 30-minute sessions',
      };
    }
  }

  /**
   * Get default learning preferences
   */
  private getDefaultPreferences(): UserLearningPreferences {
    return {
      preferredCategories: ['Courses', 'Procedures'],
      preferredDuration: 'medium',
      preferredLevel: 'Beginner',
      learningGoals: ['Improve skills', 'Stay updated'],
      timeAvailability: 120, // 2 hours per week
      notificationPreferences: {
        email: true,
        push: false,
        weeklyDigest: true,
      },
      interests: [],
      careerGoals: [],
    };
  }

  /**
   * Analyze skill gaps based on user profile
   */
  private analyzeSkillGaps(profile: UserLearningProfile): string[] {
    const skillGaps: string[] = [];

    // Role-based skill requirements
    const roleRequirements: Record<string, string[]> = {
      admin: [
        'Leadership',
        'Management',
        'Policy Development',
        'Strategic Planning',
      ],
      manager: [
        'Team Management',
        'Process Improvement',
        'Quality Assurance',
        'Compliance',
      ],
      user: [
        'Basic Procedures',
        'Safety Protocols',
        'Equipment Operation',
        'Documentation',
      ],
    };

    const requiredSkills =
      roleRequirements[profile.role] || roleRequirements.user;

    // Department-based additional requirements
    const departmentRequirements: Record<string, string[]> = {
      Sterilization: [
        'Infection Control',
        'Equipment Maintenance',
        'Quality Control',
        'Regulatory Compliance',
      ],
      Surgery: [
        'Surgical Procedures',
        'Patient Safety',
        'Sterile Technique',
        'Emergency Protocols',
      ],
      Emergency: [
        'Emergency Response',
        'Critical Care',
        'Patient Assessment',
        'Rapid Decision Making',
      ],
      Nursing: [
        'Patient Care',
        'Medication Administration',
        'Clinical Procedures',
        'Patient Education',
      ],
      Management: [
        'Leadership',
        'Strategic Planning',
        'Resource Management',
        'Performance Management',
      ],
      Operations: [
        'Process Management',
        'Quality Control',
        'Team Leadership',
        'Efficiency Optimization',
      ],
    };

    if (profile.department && departmentRequirements[profile.department]) {
      requiredSkills.push(...departmentRequirements[profile.department]);
    }

    // Check against user's interests and goals
    const userSkills = [
      ...profile.learningPreferences.interests,
      ...profile.learningPreferences.learningGoals,
    ];

    requiredSkills.forEach((skill) => {
      const hasSkill = userSkills.some((userSkill) =>
        userSkill.toLowerCase().includes(skill.toLowerCase())
      );
      if (!hasSkill) {
        skillGaps.push(skill);
      }
    });

    return skillGaps;
  }

  /**
   * Get recommended categories based on user profile
   */
  private getRecommendedCategories(profile: UserLearningProfile): string[] {
    const recommendations: string[] = [];

    // Role-based recommendations
    const roleCategories: Record<string, string[]> = {
      admin: ['Policies', 'Learning Pathways', 'Leadership'],
      manager: ['Procedures', 'Learning Pathways', 'Management'],
      user: ['Courses', 'Procedures', 'Safety'],
    };

    const roleRecs = roleCategories[profile.role] || roleCategories.user;
    recommendations.push(...roleRecs);

    // Department-based recommendations
    if (profile.department) {
      const deptCategories: Record<string, string[]> = {
        Sterilization: ['Procedures', 'Safety', 'Equipment'],
        Surgery: ['Procedures', 'Safety', 'Patient Care'],
        Emergency: ['Procedures', 'Safety', 'Emergency Response'],
        Nursing: ['Patient Care', 'Procedures', 'Safety'],
      };

      const deptRecs = deptCategories[profile.department] || [];
      recommendations.push(...deptRecs);
    }

    // Remove duplicates
    return Array.from(new Set(recommendations));
  }

  /**
   * Get suggested learning level
   */
  private getSuggestedLevel(profile: UserLearningProfile): string {
    // Consider years of experience and current skill level
    const yearsExp = profile.yearsExperience || 0;
    const currentLevel = profile.skillLevel;

    if (yearsExp >= 5 && currentLevel === 'Advanced') {
      return 'Advanced';
    } else if (yearsExp >= 2 || currentLevel === 'Intermediate') {
      return 'Intermediate';
    } else {
      return 'Beginner';
    }
  }

  /**
   * Get time recommendations
   */
  private getTimeRecommendations(profile: UserLearningProfile): string {
    const timeAvailable = profile.learningPreferences.timeAvailability;

    if (timeAvailable >= 300) {
      // 5+ hours per week
      return 'You have plenty of time for comprehensive learning. Consider longer courses and learning pathways.';
    } else if (timeAvailable >= 120) {
      // 2-5 hours per week
      return 'Focus on medium-length courses and prioritize your learning goals.';
    } else {
      // Less than 2 hours per week
      return 'Start with short, focused sessions. Consider micro-learning content and quick procedures.';
    }
  }

  /**
   * Track learning activity for better recommendations
   */
  async trackLearningActivity(activity: {
    contentId: string;
    action: 'viewed' | 'started' | 'completed' | 'bookmarked';
    duration?: number;
    category?: string;
  }): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;

      // This could be expanded to store in a separate learning_activity table
      // For now, we'll update the user's learning preferences with recent activity
      const profile = await this.getUserLearningProfile();
      if (!profile) return false;

      const preferences = profile.learningPreferences;

      // Update interests based on viewed content
      if (activity.action === 'viewed' && activity.category) {
        if (!preferences.interests.includes(activity.category)) {
          preferences.interests.push(activity.category);
        }
      }

      // Update time availability based on actual usage
      if (activity.duration) {
        const actualTime = Math.min(
          activity.duration,
          preferences.timeAvailability
        );
        preferences.timeAvailability = Math.max(actualTime, 30); // Minimum 30 minutes
      }

      await this.updateLearningPreferences(preferences);
      return true;
    } catch (error) {
      console.error('Error tracking learning activity:', error);
      return false;
    }
  }
}

// Export singleton instance
export const userLearningProfileService = new UserLearningProfileService();
