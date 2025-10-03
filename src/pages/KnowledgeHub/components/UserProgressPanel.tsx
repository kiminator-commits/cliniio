import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';

import {
  UserDataIntegrationService,
  UserPerformanceMetrics,
  UserProfile,
  ContentRecommendation,
} from '../services/userDataIntegrationService';
import {
  BookOpen,
  Award,
  Clock,
  Target,
  TrendingUp,
  User,
  Building,
  Star,
  Calendar,
  CheckCircle,
  PlayCircle,
  AlertCircle,
} from 'lucide-react';

interface UserProgressPanelProps {
  className?: string;
}

export const UserProgressPanel: React.FC<UserProgressPanelProps> = ({
  className = '',
}) => {
  const [metrics, setMetrics] = useState<UserPerformanceMetrics | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recommendations, setRecommendations] = useState<
    ContentRecommendation[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Instantiate the service
  const userDataIntegrationService = useMemo(
    () => new UserDataIntegrationService(),
    []
  );

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [metricsData, profileData, recommendationsData] = await Promise.all(
        [
          userDataIntegrationService.getUserPerformanceMetrics(),
          userDataIntegrationService.getUserProfile(),
          userDataIntegrationService.getPersonalizedRecommendations(
            undefined,
            5
          ),
        ]
      );

      setMetrics(metricsData);
      setProfile(profileData);
      setRecommendations(recommendationsData);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError('Failed to load user progress data');
    } finally {
      setLoading(false);
    }
  }, [userDataIntegrationService]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleContentClick = async (contentId: string) => {
    try {
      await userDataIntegrationService.trackLearningActivity({
        contentId,
        action: 'viewed',
        category: 'Courses',
      });
      // Navigate to content or open modal
      console.log('Navigating to content:', contentId);
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  if (loading) {
    return null;
  }

  if (error) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* User Profile Summary */}
      {profile && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Your Profile</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Role</span>
              <Badge variant="secondary">{profile.role}</Badge>
            </div>
            {profile.department && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Department</span>
                <div className="flex items-center space-x-1">
                  <Building className="h-3 w-3 text-gray-500" />
                  <span className="text-sm font-medium">
                    {profile.department}
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Skill Level</span>
              <Badge variant="outline">{profile.skillLevel}</Badge>
            </div>
            {profile.yearsExperience && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Experience</span>
                <span className="text-sm font-medium">
                  {profile.yearsExperience} years
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Learning Progress Overview */}
      {metrics && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Learning Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">
                  {metrics.averageProgress.toFixed(1)}%
                </span>
              </div>
              <Progress value={metrics.averageProgress} className="h-2" />
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {metrics.completedCourses}
                </div>
                <div className="text-xs text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.inProgressCourses}
                </div>
                <div className="text-xs text-gray-600">In Progress</div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium">Completion Rate</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">
                {metrics.completionRate.toFixed(0)}%
              </span>
            </div>

            {/* Time Spent */}
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Total Time</span>
              </div>
              <span className="text-sm font-medium text-blue-600">
                {Math.round(metrics.timeSpent / 60)}h {metrics.timeSpent % 60}m
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress by Category */}
      {metrics && Object.keys(metrics.progressByCategory).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Progress by Category</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(metrics.progressByCategory).map(
              ([category, progress]) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-gray-600">
                      {progress.toFixed(0)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )
            )}
          </CardContent>
        </Card>
      )}

      {/* Skill Gaps */}
      {metrics && metrics.skillGaps.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              <span>Skill Gaps</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.skillGaps.slice(0, 5).map((skill, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">{skill}</span>
                </div>
              ))}
              {metrics.skillGaps.length > 5 && (
                <div className="text-xs text-gray-500 mt-2">
                  +{metrics.skillGaps.length - 5} more skills to develop
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <span>Recommended for You</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((recommendation) => (
              <div
                key={recommendation.contentId}
                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleContentClick(recommendation.contentId)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleContentClick(recommendation.contentId);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {recommendation.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {recommendation.reason}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {recommendation.category}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {recommendation.difficulty}
                      </Badge>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{recommendation.estimatedDuration}m</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">
                      {recommendation.relevanceScore}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {metrics && metrics.recentActivity.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center space-x-2">
                {activity.action === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : activity.action === 'started' ? (
                  <PlayCircle className="h-4 w-4 text-blue-600" />
                ) : (
                  <BookOpen className="h-4 w-4 text-gray-600" />
                )}
                <span className="text-sm text-gray-700 capitalize">
                  {activity.action} content
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
