# SDK Usage

## 📚 Official SDKs

### **JavaScript/TypeScript SDK**

#### **Installation**

```bash
npm install @cliniio/sdk
```

#### **Basic Usage**

```typescript
import { CliniioAPI } from '@cliniio/sdk';

const api = new CliniioAPI({
  baseURL: 'http://localhost:3001/v1',
  token: 'your-jwt-token',
});

// Get all courses
const courses = await api.content.getAll({
  category: 'Courses',
  status: 'In Progress',
  page: 1,
  limit: 20,
});

// Update progress
await api.content.updateProgress('course_123', {
  progress: 75,
  status: 'In Progress',
});

// Get user analytics
const analytics = await api.analytics.getDashboard({
  dateFrom: '2024-01-01',
  dateTo: '2024-01-31',
});
```

#### **Advanced Configuration**

```typescript
import { CliniioAPI, CliniioConfig } from '@cliniio/sdk';

const config: CliniioConfig = {
  baseURL: 'http://localhost:3001/v1',
  token: 'your-jwt-token',
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000,
  onError: (error) => {
    console.error('API Error:', error);
    // Custom error handling
  },
  onRateLimit: (retryAfter) => {
    console.log(`Rate limited. Retry after ${retryAfter} seconds`);
    // Custom rate limit handling
  },
};

const api = new CliniioAPI(config);
```

### **React Hook**

#### **Installation**

```bash
npm install @cliniio/react-hooks
```

#### **Usage**

```typescript
import { useCliniioAPI } from '@cliniio/react-hooks';

const MyComponent = () => {
  const { data: courses, loading, error } = useCliniioAPI(
    'content.getAll',
    { category: 'Courses' }
  );

  const { mutate: updateProgress } = useCliniioAPI(
    'content.updateProgress'
  );

  const handleComplete = async (courseId: string) => {
    await updateProgress(courseId, {
      progress: 100,
      status: 'Completed'
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>
          <h3>{course.title}</h3>
          <button onClick={() => handleComplete(course.id)}>
            Mark Complete
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## 🌐 Community Libraries

### **Python**

#### **Installation**

```bash
pip install cliniio-python
```

#### **Usage**

```python
from cliniio import CliniioAPI

api = CliniioAPI(token='your-token')
courses = api.content.get_all(category='Courses')
```

### **PHP**

#### **Installation**

```bash
composer require cliniio/php-sdk
```

#### **Usage**

```php
use Cliniio\CliniioAPI;

$api = new CliniioAPI('your-token');
$courses = $api->content->getAll(['category' => 'Courses']);
```

---

## 🔧 Custom SDK Implementation

### **Basic HTTP Client**

```typescript
class CustomCliniioClient {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${this.token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Content methods
  async getContent(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/content${queryString}`);
  }

  async getContentById(id: string) {
    return this.request(`/content/${id}`);
  }

  async createContent(data: any) {
    return this.request('/content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateContent(id: string, data: any) {
    return this.request(`/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteContent(id: string) {
    return this.request(`/content/${id}`, {
      method: 'DELETE',
    });
  }

  // Progress methods
  async updateProgress(id: string, progress: any) {
    return this.request(`/content/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify(progress),
    });
  }

  // User methods
  async getCurrentUser() {
    return this.request('/users/me');
  }

  async updateUserProfile(data: any) {
    return this.request('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Analytics methods
  async getAnalytics(params?: any) {
    const queryString = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/analytics/dashboard${queryString}`);
  }
}
```

### **Usage Example**

```typescript
const client = new CustomCliniioClient(
  'http://localhost:3001/v1',
  'your-jwt-token'
);

// Get all courses
const courses = await client.getContent({
  category: 'Courses',
  status: 'In Progress',
  page: 1,
  limit: 20,
});

// Create new course
const newCourse = await client.createContent({
  title: 'New Course',
  category: 'Courses',
  domain: 'Safety',
  department: 'Nursing',
});

// Update progress
await client.updateProgress('course_123', {
  progress: 75,
  status: 'In Progress',
});
```

---

## 🔗 Related Documentation

- **[Getting Started](./getting-started.md)** - Setup and configuration
- **[API Reference](../api/README.md)** - Complete API documentation
- **[Examples](../examples/)** - Code examples and patterns
- **[Testing](./testing.md)** - Testing with SDKs
