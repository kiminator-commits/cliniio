# React Components

## ⚛️ React Hooks and Components

### **Custom Hook for API Calls**

```typescript
import { useState, useEffect, useCallback } from 'react';

interface UseCliniioAPIOptions<T> {
  endpoint: string;
  params?: Record<string, any>;
  immediate?: boolean;
}

interface UseCliniioAPIResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (data: Partial<T>) => Promise<void>;
}

export function useCliniioAPI<T>({
  endpoint,
  params = {},
  immediate = true,
}: UseCliniioAPIOptions<T>): UseCliniioAPIResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `http://localhost:3001/v1${endpoint}${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('cliniio_token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [endpoint, params]);

  const mutate = useCallback(
    async (updates: Partial<T>) => {
      if (!data) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:3001/v1${endpoint}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('cliniio_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error?.message || `HTTP ${response.status}`
          );
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    [endpoint, data]
  );

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    mutate,
  };
}
```

---

## 📚 Course List Component

### **Course List with Filtering**

```typescript
import React, { useState } from 'react';
import { useCliniioAPI } from './useCliniioAPI';

interface Course {
  id: string;
  title: string;
  category: string;
  status: string;
  progress: number;
  dueDate: string;
  domain: string;
}

interface CourseListProps {
  onCourseSelect?: (courseId: string) => void;
}

export const CourseList: React.FC<CourseListProps> = ({ onCourseSelect }) => {
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    domain: '',
    search: ''
  });

  const { data: courses, loading, error, refetch } = useCliniioAPI<Course[]>({
    endpoint: '/content',
    params: filters
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      search: searchTerm
    }));
  };

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error loading courses: {error}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="course-list">
      {/* Filters */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search courses..."
          value={filters.search}
          onChange={(e) => handleSearch(e.target.value)}
          className="search-input"
        />

        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="Courses">Courses</option>
          <option value="Procedures">Procedures</option>
          <option value="Policies">Policies</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={filters.domain}
          onChange={(e) => handleFilterChange('domain', e.target.value)}
          className="filter-select"
        >
          <option value="">All Domains</option>
          <option value="Safety">Safety</option>
          <option value="Clinical">Clinical</option>
          <option value="Administrative">Administrative</option>
        </select>
      </div>

      {/* Course Grid */}
      <div className="courses-grid">
        {courses?.map(course => (
          <div key={course.id} className="course-card">
            <h3 className="course-title">{course.title}</h3>
            <div className="course-meta">
              <span className="category">{course.category}</span>
              <span className="domain">{course.domain}</span>
            </div>

            <div className="progress-section">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
              <span className="progress-text">{course.progress}%</span>
            </div>

            <div className="course-status">
              <span className={`status-badge status-${course.status.toLowerCase().replace(' ', '-')}`}>
                {course.status}
              </span>
              <span className="due-date">Due: {course.dueDate}</span>
            </div>

            <div className="course-actions">
              <button
                onClick={() => onCourseSelect?.(course.id)}
                className="btn btn-primary"
              >
                View Course
              </button>
            </div>
          </div>
        ))}
      </div>

      {courses?.length === 0 && (
        <div className="no-courses">
          <p>No courses found matching your criteria.</p>
          <button onClick={() => setFilters({ category: '', status: '', domain: '', search: '' })}>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## 📊 Progress Tracking Component

### **Progress Update Component**

```typescript
import React, { useState } from 'react';
import { useCliniioAPI } from './useCliniioAPI';

interface ProgressUpdateProps {
  courseId: string;
  currentProgress: number;
  onProgressUpdate: (progress: number) => void;
}

export const ProgressUpdate: React.FC<ProgressUpdateProps> = ({
  courseId,
  currentProgress,
  onProgressUpdate
}) => {
  const [progress, setProgress] = useState(currentProgress);
  const [updating, setUpdating] = useState(false);

  const { mutate } = useCliniioAPI({
    endpoint: `/content/${courseId}/progress`,
    immediate: false
  });

  const handleProgressChange = (newProgress: number) => {
    setProgress(Math.max(0, Math.min(100, newProgress));
  };

  const handleSave = async () => {
    if (progress === currentProgress) return;

    setUpdating(true);
    try {
      await mutate({
        progress,
        status: progress === 100 ? 'Completed' : 'In Progress',
        timeSpent: 30 // This could be calculated based on actual time
      });

      onProgressUpdate(progress);
    } catch (error) {
      console.error('Failed to update progress:', error);
      // Reset to current progress on error
      setProgress(currentProgress);
    } finally {
      setUpdating(false);
    }
  };

  const handleComplete = () => {
    setProgress(100);
  };

  return (
    <div className="progress-update">
      <div className="progress-controls">
        <label htmlFor="progress-slider">Progress: {progress}%</label>
        <input
          id="progress-slider"
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => handleProgressChange(parseInt(e.target.value))}
          className="progress-slider"
        />

        <div className="progress-buttons">
          <button
            onClick={handleComplete}
            className="btn btn-success"
            disabled={updating}
          >
            Mark Complete
          </button>

          <button
            onClick={handleSave}
            className="btn btn-primary"
            disabled={updating || progress === currentProgress}
          >
            {updating ? 'Saving...' : 'Save Progress'}
          </button>
        </div>
      </div>

      <div className="progress-visual">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="progress-text">{progress}%</span>
      </div>
    </div>
  );
};
```

---

## 👤 User Profile Component

### **User Profile with Edit Mode**

```typescript
import React, { useState } from 'react';
import { useCliniioAPI } from './useCliniioAPI';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  preferences: {
    theme: string;
    notifications: boolean;
    language: string;
  };
}

export const UserProfile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});

  const { data: user, loading, error, mutate, refetch } = useCliniioAPI<User>({
    endpoint: '/users/me'
  });

  const handleEdit = () => {
    if (user) {
      setEditData({
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department,
        preferences: { ...user.preferences }
      });
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({});
  };

  const handleSave = async () => {
    try {
      await mutate(editData);
      setIsEditing(false);
      setEditData({});
      refetch(); // Refresh user data
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setEditData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error loading profile: {error}</p>
        <button onClick={refetch}>Try Again</button>
      </div>
    );
  }

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h2>User Profile</h2>
        {!isEditing && (
          <button onClick={handleEdit} className="btn btn-primary">
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Personal Information</h3>

          <div className="form-group">
            <label>First Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.firstName || ''}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="form-input"
              />
            ) : (
              <span className="profile-value">{user.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <label>Last Name</label>
            {isEditing ? (
              <input
                type="text"
                value={editData.lastName || ''}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="form-input"
              />
            ) : (
              <span className="profile-value">{user.lastName}</span>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>
            <span className="profile-value">{user.email}</span>
          </div>

          <div className="form-group">
            <label>Department</label>
            {isEditing ? (
              <select
                value={editData.department || ''}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="form-select"
              >
                <option value="Nursing">Nursing</option>
                <option value="Emergency">Emergency</option>
                <option value="Surgery">Surgery</option>
                <option value="Administrative">Administrative</option>
              </select>
            ) : (
              <span className="profile-value">{user.department}</span>
            )}
          </div>

          <div className="form-group">
            <label>Role</label>
            <span className="profile-value">{user.role}</span>
          </div>
        </div>

        <div className="profile-section">
          <h3>Preferences</h3>

          <div className="form-group">
            <label>Theme</label>
            {isEditing ? (
              <select
                value={editData.preferences?.theme || ''}
                onChange={(e) => handleInputChange('preferences.theme', e.target.value)}
                className="form-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            ) : (
              <span className="profile-value">{user.preferences.theme}</span>
            )}
          </div>

          <div className="form-group">
            <label>Notifications</label>
            {isEditing ? (
              <input
                type="checkbox"
                checked={editData.preferences?.notifications || false}
                onChange={(e) => handleInputChange('preferences.notifications', e.target.checked)}
                className="form-checkbox"
              />
            ) : (
              <span className="profile-value">
                {user.preferences.notifications ? 'Enabled' : 'Disabled'}
              </span>
            )}
          </div>

          <div className="form-group">
            <label>Language</label>
            {isEditing ? (
              <select
                value={editData.preferences?.language || ''}
                onChange={(e) => handleInputChange('preferences.language', e.target.value)}
                className="form-select"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            ) : (
              <span className="profile-value">{user.preferences.language}</span>
            )}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="profile-actions">
          <button onClick={handleSave} className="btn btn-success">
            Save Changes
          </button>
          <button onClick={handleCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};
```

---

## 🔗 Related Documentation

- **[Basic Requests](./basic-requests.md)** - Simple API calls
- **[Integration Patterns](./integration-patterns.md)** - Complete workflows
- **[API Reference](../api/README.md)** - Endpoint documentation
- **[Data Models](../api/data-models.md)** - TypeScript interfaces
