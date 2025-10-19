# User Data Integration for Knowledge Hub

## Overview

The Knowledge Hub now includes comprehensive user data integration features that provide personalized learning experiences based on user roles, departments, learning preferences, and progress tracking.

## Features Implemented

### 1. User Learning Progress Tracking

**What it does:**

- Tracks individual user progress across all Knowledge Hub content
- Monitors completion rates, time spent, and learning milestones
- Provides real-time progress updates and analytics

**Key Components:**

- `UserLearningProgress` interface for progress data structure
- `getUserLearningProgress()` method to fetch user-specific progress
- Progress visualization in `UserProgressPanel` component

**Example Usage:**

```typescript
const progress =
  await userDataIntegrationService.getUserLearningProgress(userId);
// Returns array of user's learning progress across all content
```

### 2. User Role and Department Integration

**What it does:**

- Automatically filters content based on user's role and department
- Provides role-specific content recommendations
- Enables department-based content organization

**Key Components:**

- `DepartmentRoleFilter` component for content filtering
- `getContentByDepartment()` and `getContentByRole()` methods
- Role-to-content mapping system

**Supported Roles:**

- Admin → Management, Leadership, Policy content
- Manager → Team Management, Operations content
- Nurse → Patient Care, Clinical Procedures content
- Physician → Clinical Diagnosis, Treatment content
- Technician → Equipment, Technical Procedures content
- Student → Basic Procedures, Training content

**Example Usage:**

```typescript
// Get department-specific content
const departmentContent =
  await userDataIntegrationService.getContentByDepartment('Nursing');

// Get role-specific content
const roleContent = await userDataIntegrationService.getContentByRole('nurse');
```

### 3. Personalized Content Recommendations

**What it does:**

- Analyzes user preferences, interests, and learning goals
- Generates personalized content recommendations
- Provides relevance scoring and reasoning for recommendations

**Key Components:**

- `ContentRecommendation` interface for recommendation data
- `getPersonalizedRecommendations()` method with scoring algorithm
- Recommendation display in `UserProgressPanel`

**Recommendation Factors:**

- **Department Match** (30 points): Content relevant to user's department
- **Category Preference** (25 points): Matches user's preferred content types
- **Skill Level Match** (20 points): Appropriate difficulty level
- **Interest Match** (15 points): Aligned with user's interests
- **Learning Goal Match** (10 points): Supports user's learning objectives

**Example Usage:**

```typescript
const recommendations =
  await userDataIntegrationService.getPersonalizedRecommendations(userId, 10);
// Returns personalized content recommendations with relevance scores
```

### 4. User Performance Analytics

**What it does:**

- Calculates comprehensive performance metrics
- Tracks completion rates, time spent, and skill development
- Identifies skill gaps and learning opportunities

**Key Metrics:**

- Total courses assigned/completed
- Average progress across all content
- Completion rate percentage
- Time spent learning
- Certificates earned
- Progress by content category
- Recent learning activity

**Example Usage:**

```typescript
const metrics =
  await userDataIntegrationService.getUserPerformanceMetrics(userId);
// Returns comprehensive performance analytics
```

### 5. Learning Activity Tracking

**What it does:**

- Tracks user interactions with content
- Updates learning preferences based on behavior
- Improves recommendation accuracy over time

**Tracked Activities:**

- Content viewing
- Content starting
- Content completion
- Content bookmarking

**Example Usage:**

```typescript
await userDataIntegrationService.trackLearningActivity({
  contentId: 'course-123',
  action: 'completed',
  duration: 45,
  category: 'Courses',
});
```

## Database Schema

### User Profile Extensions

```sql
-- Additional user columns for learning integration
ALTER TABLE public.users
ADD COLUMN department TEXT,
ADD COLUMN title TEXT,
ADD COLUMN specialization TEXT,
ADD COLUMN years_experience INTEGER,
ADD COLUMN learning_preferences JSONB DEFAULT '{}',
ADD COLUMN skill_level TEXT CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner';
```

### Learning Preferences Structure

```json
{
  "interests": ["Patient Safety", "Clinical Procedures", "Infection Control"],
  "learningGoals": [
    "Improve Clinical Skills",
    "Stay Updated with Best Practices"
  ],
  "timeAvailability": 60,
  "preferredCategories": ["Courses", "Procedures"],
  "difficultyPreference": "Intermediate"
}
```

## Components and Services

### Core Services

1. **UserDataIntegrationService**
   - Main service for all user data operations
   - Handles profile management, progress tracking, and recommendations
   - Provides unified interface for user data integration

2. **useUserDataIntegration Hook**
   - React hook for integrating user data with Knowledge Hub store
   - Manages state synchronization between user data and UI
   - Provides actions for updating user preferences and progress

### UI Components

1. **UserProgressPanel**
   - Displays user profile summary
   - Shows learning progress overview
   - Presents personalized recommendations
   - Visualizes performance metrics

2. **DepartmentRoleFilter**
   - Provides content filtering options
   - Shows user context (role, department, skill level)
   - Displays learning preferences summary
   - Enables personalized content views

## Integration Points

### With Existing Knowledge Hub

1. **Store Integration**
   - User data automatically loads with Knowledge Hub initialization
   - Content filtered based on user profile
   - Progress updates sync with store state

2. **Content Management**
   - User progress integrated with content status updates
   - Department/role filtering affects content display
   - Recommendations influence content suggestions

3. **Analytics Integration**
   - Performance metrics feed into Knowledge Hub analytics
   - User activity tracking enhances content recommendations
   - Progress data supports reporting features

### With Authentication System

1. **User Profile Loading**
   - Automatically loads user profile on authentication
   - Syncs user metadata with learning preferences
   - Maintains user context across sessions

2. **Permission Integration**
   - Role-based content access control
   - Department-specific content visibility
   - User-specific progress tracking

## Usage Examples

### Basic User Data Loading

```typescript
import { useUserDataIntegration } from '../hooks/useUserDataIntegration';

const MyComponent = () => {
  const {
    userProfile,
    userMetrics,
    loading,
    error,
    hasUserData
  } = useUserDataIntegration();

  if (loading) return <div>Loading user data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!hasUserData) return <div>No user data available</div>;

  return (
    <div>
      <h2>Welcome, {userProfile?.role}</h2>
      <p>Department: {userProfile?.department}</p>
      <p>Completion Rate: {userMetrics?.completionRate}%</p>
    </div>
  );
};
```

### Content Filtering

```typescript
const {
  filterContentByDepartment,
  filterContentByRole,
  filterContentByRecommendations,
} = useUserDataIntegration();

// Filter by department
await filterContentByDepartment();

// Filter by role
await filterContentByRole();

// Show personalized recommendations
await filterContentByRecommendations();
```

### Progress Tracking

```typescript
const { updateContentProgress } = useUserDataIntegration();

// Update content progress
await updateContentProgress('content-id', 75, 'In Progress');

// Complete content
await updateContentProgress('content-id', 100, 'Completed');
```

## Configuration

### User Profile Setup

Users can configure their learning preferences through:

1. **Profile Settings**
   - Department assignment
   - Role specification
   - Skill level selection
   - Years of experience

2. **Learning Preferences**
   - Interest areas
   - Learning goals
   - Time availability
   - Preferred content categories
   - Difficulty preferences

### System Configuration

1. **Role Mappings**
   - Configure role-to-content mappings
   - Define department-specific content
   - Set up skill level requirements

2. **Recommendation Weights**
   - Adjust scoring algorithm weights
   - Configure relevance thresholds
   - Set recommendation limits

## Performance Considerations

### Optimization Strategies

1. **Caching**
   - User profile data cached locally
   - Progress metrics cached with TTL
   - Recommendations cached and refreshed periodically

2. **Lazy Loading**
   - User data loaded on demand
   - Progress tracking batched
   - Recommendations generated asynchronously

3. **Database Optimization**
   - Indexed queries for user data
   - Efficient recommendation algorithms
   - Optimized progress calculations

### Monitoring

1. **Performance Metrics**
   - User data loading times
   - Recommendation generation speed
   - Progress update latency

2. **Usage Analytics**
   - Feature adoption rates
   - User engagement patterns
   - Recommendation effectiveness

## Security and Privacy

### Data Protection

1. **User Privacy**
   - Learning preferences stored securely
   - Progress data user-controlled
   - Anonymous analytics where possible

2. **Access Control**
   - Role-based content access
   - Department-specific visibility
   - User-specific data isolation

3. **Data Retention**
   - Configurable data retention policies
   - User data deletion capabilities
   - Audit trail maintenance

## Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Learning path optimization
   - Skill gap analysis
   - Predictive content recommendations

2. **Social Learning**
   - Peer recommendations
   - Collaborative learning groups
   - Social progress sharing

3. **Adaptive Learning**
   - Dynamic difficulty adjustment
   - Personalized learning paths
   - Intelligent content sequencing

4. **Integration Extensions**
   - External learning platform integration
   - Certification system integration
   - Performance review integration

## Troubleshooting

### Common Issues

1. **User Data Not Loading**
   - Check authentication status
   - Verify user profile exists
   - Check database permissions

2. **Recommendations Not Working**
   - Ensure user preferences are set
   - Check content availability
   - Verify recommendation algorithm

3. **Progress Not Updating**
   - Check content status updates
   - Verify tracking permissions
   - Check database triggers

### Debug Tools

1. **User Data Debug Panel**
   - Display current user profile
   - Show recommendation calculations
   - Log learning activity

2. **Performance Monitoring**
   - Track data loading times
   - Monitor recommendation generation
   - Log user interactions

## Support and Maintenance

### Regular Maintenance

1. **Data Cleanup**
   - Remove outdated user preferences
   - Archive old progress data
   - Optimize recommendation cache

2. **Performance Monitoring**
   - Monitor query performance
   - Track recommendation accuracy
   - Analyze user engagement

3. **Feature Updates**
   - Update recommendation algorithms
   - Enhance user interface
   - Add new integration points

This comprehensive user data integration system provides a foundation for personalized learning experiences while maintaining performance, security, and scalability.
