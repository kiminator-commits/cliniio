import React, { useEffect, useState, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import Button from '../../../components/ui/button';
import {
  Building,
  User,
  Filter,
  BookOpen,
  Target,
  Users,
  Briefcase,
} from 'lucide-react';
import { useUserDataIntegration } from '../hooks/useUserDataIntegration';
import { ContentItem } from '../types';
import { UserProfileService } from '../services/userData/UserProfileService';
import { ContentRecommendationService } from '../services/userData/ContentRecommendationService';
import { ContentCategory, ContentStatus } from '../types';

interface DepartmentRoleFilterProps {
  onContentFiltered: (content: ContentItem[]) => void;
  className?: string;
}

type FilterType = 'all' | 'department' | 'role' | 'recommended';

export const DepartmentRoleFilter: React.FC<DepartmentRoleFilterProps> = ({
  onContentFiltered,
  className = '',
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [departmentContent, setDepartmentContent] = useState<ContentItem[]>([]);
  const [roleContent, setRoleContent] = useState<ContentItem[]>([]);
  const [recommendedContent, setRecommendedContent] = useState<ContentItem[]>(
    []
  );
  const [isFiltering, setIsFiltering] = useState(false);

  const { currentUser: profile, isLoading: loading } = useUserDataIntegration();

  // Real implementation of department filtering
  const filterContentByDepartment = useCallback(async () => {
    if (!profile?.department) {
      console.log('No department found in profile:', profile);
      return;
    }

    try {
      setIsFiltering(true);
      console.log('Filtering content by department:', profile.department);

      const service = new UserProfileService();
      const content = await service.getContentByDepartment(profile.department);
      console.log('Department content received:', content);

      // Transform the content to match ContentItem interface
      const transformedContent: ContentItem[] = content.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category as ContentCategory, // Cast to ContentCategory
        status: item.status as ContentStatus, // Cast to ContentCategory
        dueDate: item.dueDate || new Date().toISOString().split('T')[0],
        progress: item.progress || 0,
        department: item.department || '',
        description: item.data?.description || '',
        tags: item.data?.tags || [],
        domain: item.domain || '',
        contentType: item.contentType || 'course',
        type: item.type || 'course',
        createdAt: item.data?.createdAt || new Date().toISOString(),
        lastUpdated: item.lastUpdated || new Date().toISOString(),
        isActive: item.data?.isActive !== false,
        estimatedDuration: item.estimatedDuration,
        difficultyLevel: item.difficultyLevel || 'Beginner',
      }));

      console.log('Transformed department content:', transformedContent);
      setDepartmentContent(transformedContent);
      onContentFiltered(transformedContent);
    } catch (error) {
      console.error('Error filtering by department:', error);
      setDepartmentContent([]);
      onContentFiltered([]);
    } finally {
      setIsFiltering(false);
    }
  }, [profile, onContentFiltered]);

  // Real implementation of role filtering
  const filterContentByRole = useCallback(async () => {
    if (!profile?.role) {
      console.log('No role found in profile:', profile);
      return;
    }

    try {
      setIsFiltering(true);
      console.log('Filtering content by role:', profile.role);

      const service = new UserProfileService();
      const content = await service.getContentByRole(profile.role);
      console.log('Role content received:', content);

      // Transform the content to match ContentItem interface
      const transformedContent: ContentItem[] = content.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category as ContentCategory, // Cast to ContentCategory
        status: item.status as ContentStatus, // Cast to ContentStatus
        dueDate: item.dueDate || new Date().toISOString().split('T')[0],
        progress: item.progress || 0,
        department: item.department || '',
        description: item.data?.description || '',
        tags: item.data?.tags || [],
        domain: item.domain || '',
        contentType: item.contentType || 'course',
        type: item.type || 'course',
        createdAt: item.data?.createdAt || new Date().toISOString(),
        lastUpdated: item.lastUpdated || new Date().toISOString(),
        isActive: item.data?.isActive !== false,
        estimatedDuration: item.estimatedDuration,
        difficultyLevel: item.difficultyLevel || 'Beginner',
      }));

      console.log('Transformed role content:', transformedContent);
      setRoleContent(transformedContent);
      onContentFiltered(transformedContent);
    } catch (error) {
      console.error('Error filtering by role:', error);
      setRoleContent([]);
      onContentFiltered([]);
    } finally {
      setIsFiltering(false);
    }
  }, [profile, onContentFiltered]);

  // Real implementation of recommendations filtering
  const filterContentByRecommendations = useCallback(async () => {
    if (!profile?.id) {
      console.log('No user ID found in profile:', profile);
      return;
    }

    try {
      setIsFiltering(true);
      console.log('Filtering content by recommendations for user:', profile.id);

      const service = new ContentRecommendationService();
      const recommendations = await service.getPersonalizedRecommendations(
        profile.id,
        20
      );
      console.log('Recommendations received:', recommendations);

      // Transform recommendations to ContentItem format
      const content: ContentItem[] = recommendations.map((rec) => ({
        id: rec.contentId,
        title: rec.title,
        category: rec.category as ContentCategory, // Cast to ContentCategory
        status: 'published',
        dueDate: new Date().toISOString().split('T')[0], // Default due date
        progress: 0,
        department: '',
        description: '',
        tags: rec.tags || [],
        domain: '',
        contentType: 'course',
        type: 'course',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        isActive: true,
        estimatedDuration: rec.estimatedDuration,
        difficultyLevel: rec.difficulty || 'Beginner',
      }));

      console.log('Transformed recommendations content:', content);
      setRecommendedContent(content);
      onContentFiltered(content);
    } catch (error) {
      console.error('Error filtering by recommendations:', error);
      setRecommendedContent([]);
      onContentFiltered([]);
    } finally {
      setIsFiltering(false);
    }
  }, [profile, onContentFiltered]);

  const loadFilteredContent = useCallback(async () => {
    if (!profile) return;

    try {
      switch (activeFilter) {
        case 'department':
          if (profile.department) {
            await filterContentByDepartment();
          }
          break;
        case 'role':
          await filterContentByRole();
          break;
        case 'recommended':
          await filterContentByRecommendations();
          break;
        default:
          // Load all content - clear filtered content and let parent handle it
          setDepartmentContent([]);
          setRoleContent([]);
          setRecommendedContent([]);
          onContentFiltered([]);
          break;
      }
    } catch (error) {
      console.error('Error loading filtered content:', error);
      onContentFiltered([]);
    }
  }, [
    profile,
    activeFilter,
    filterContentByDepartment,
    filterContentByRole,
    filterContentByRecommendations,
    onContentFiltered,
  ]);

  useEffect(() => {
    if (profile) {
      loadFilteredContent();
    }
  }, [profile, activeFilter, loadFilteredContent]);

  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);

    // Handle "All Content" filter immediately
    if (filter === 'all') {
      setDepartmentContent([]);
      setRoleContent([]);
      setRecommendedContent([]);
      onContentFiltered([]);
    }
  };

  const getFilterButtonVariant = (filter: FilterType) => {
    return activeFilter === filter ? 'primary' : 'secondary';
  };

  const getContentCount = (filter: FilterType) => {
    switch (filter) {
      case 'department':
        return departmentContent.length;
      case 'role':
        return roleContent.length;
      case 'recommended':
        return recommendedContent.length;
      default:
        return 0;
    }
  };

  if (!profile) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* User Context */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Personalized Content</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Your Role</span>
            <div className="flex items-center space-x-1">
              <Briefcase className="h-3 w-3 text-gray-500" />
              <Badge variant="secondary">{profile.role}</Badge>
            </div>
          </div>
          {profile.department && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Your Department</span>
              <div className="flex items-center space-x-1">
                <Building className="h-3 w-3 text-gray-500" />
                <Badge variant="outline">{profile.department}</Badge>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Skill Level</span>
            <Badge variant="secondary">{profile.skillLevel}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Filter Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Content Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={getFilterButtonVariant('all')}
              size="sm"
              onClick={() => handleFilterChange('all')}
              disabled={loading || isFiltering}
              className="justify-start"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              All Content
            </Button>

            {profile.department && (
              <Button
                variant={getFilterButtonVariant('department')}
                size="sm"
                onClick={() => handleFilterChange('department')}
                disabled={loading || isFiltering}
                className="justify-start"
              >
                <Building className="h-4 w-4 mr-2" />
                {profile.department}
                <Badge variant="secondary" className="ml-auto">
                  {getContentCount('department')}
                </Badge>
              </Button>
            )}

            <Button
              variant={getFilterButtonVariant('role')}
              size="sm"
              onClick={() => handleFilterChange('role')}
              disabled={loading || isFiltering}
              className="justify-start"
            >
              <Users className="h-4 w-4 mr-2" />
              {profile.role} Specific
              <Badge variant="secondary" className="ml-auto">
                {getContentCount('role')}
              </Badge>
            </Button>

            <Button
              variant={getFilterButtonVariant('recommended')}
              size="sm"
              onClick={() => handleFilterChange('recommended')}
              disabled={loading || isFiltering}
              className="justify-start"
            >
              <Target className="h-4 w-4 mr-2" />
              Recommended
              <Badge variant="secondary" className="ml-auto">
                {getContentCount('recommended')}
              </Badge>
            </Button>
          </div>

          {/* Loading indicator for filtering */}
          {isFiltering && (
            <div className="flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-sm text-gray-600">
                Loading filtered content...
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Learning Preferences Summary */}
      {profile.learningPreferences && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Learning Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">
                Interests
              </span>
              <div className="flex flex-wrap gap-1">
                {profile.learningPreferences.interests
                  .slice(0, 3)
                  .map((interest: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                {profile.learningPreferences.interests.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.learningPreferences.interests.length - 3} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-700">
                Learning Goals
              </span>
              <div className="flex flex-wrap gap-1">
                {profile.learningPreferences.learningGoals
                  .slice(0, 2)
                  .map((goal: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {goal}
                    </Badge>
                  ))}
                {profile.learningPreferences.learningGoals.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{profile.learningPreferences.learningGoals.length - 2} more
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Daily Learning Time</span>
              <span className="text-sm font-medium">
                {profile.learningPreferences.timeAvailability} minutes
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
