# Basic Requests

## 📡 Simple API Calls

### **Get All Content**

```typescript
// Using fetch
const getAllContent = async () => {
  const response = await fetch('http://localhost:3001/v1/content', {
    headers: {
      Authorization: 'Bearer YOUR_TOKEN',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Using axios
import axios from 'axios';

const getAllContent = async () => {
  const response = await axios.get('http://localhost:3001/v1/content', {
    headers: {
      Authorization: 'Bearer YOUR_TOKEN',
    },
  });

  return response.data;
};
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "course_123",
      "title": "Infection Control Basics",
      "category": "Courses",
      "status": "In Progress",
      "progress": 65
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### **Get Content by ID**

```typescript
const getContentById = async (id: string) => {
  const response = await fetch(`http://localhost:3001/v1/content/${id}`, {
    headers: {
      Authorization: 'Bearer YOUR_TOKEN',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Usage
const course = await getContentById('course_123');
console.log(course.data.title); // "Infection Control Basics"
```

### **Create New Content**

```typescript
const createContent = async (contentData: any) => {
  const response = await fetch('http://localhost:3001/v1/content', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer YOUR_TOKEN',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(contentData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Usage
const newCourse = await createContent({
  title: 'New Safety Course',
  category: 'Courses',
  domain: 'Safety',
  department: 'Nursing',
  dueDate: '2024-04-01',
  description: 'Essential safety protocols for healthcare workers',
});
```

### **Update Content**

```typescript
const updateContent = async (id: string, updates: any) => {
  const response = await fetch(`http://localhost:3001/v1/content/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer YOUR_TOKEN',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Usage
const updatedCourse = await updateContent('course_123', {
  title: 'Updated Course Title',
  description: 'Updated description',
});
```

### **Delete Content**

```typescript
const deleteContent = async (id: string) => {
  const response = await fetch(`http://localhost:3001/v1/content/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer YOUR_TOKEN',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Usage
const result = await deleteContent('course_123');
console.log(result.data.message); // "Content deleted successfully"
```

---

## 🔍 Filtering and Searching

### **Filter by Category**

```typescript
const getCoursesByCategory = async (category: string) => {
  const params = new URLSearchParams({ category });
  const response = await fetch(`http://localhost:3001/v1/content?${params}`, {
    headers: {
      Authorization: 'Bearer YOUR_TOKEN',
    },
  });

  return response.json();
};

// Usage
const safetyCourses = await getCoursesByCategory('Safety');
```

### **Search Content**

```typescript
const searchContent = async (query: string) => {
  const params = new URLSearchParams({ search: query });
  const response = await fetch(`http://localhost:3001/v1/content?${params}`, {
    headers: {
      Authorization: 'Bearer YOUR_TOKEN',
    },
  });

  return response.json();
};

// Usage
const infectionControlCourses = await searchContent('infection control');
```

### **Combined Filters**

```typescript
const getFilteredContent = async (filters: any) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  });

  const response = await fetch(`http://localhost:3001/v1/content?${params}`, {
    headers: {
      Authorization: 'Bearer YOUR_TOKEN',
    },
  });

  return response.json();
};

// Usage
const filteredCourses = await getFilteredContent({
  category: 'Courses',
  status: 'In Progress',
  domain: 'Safety',
  page: 1,
  limit: 10,
});
```

---

## 📊 Progress Management

### **Update Progress**

```typescript
const updateProgress = async (contentId: string, progress: number) => {
  const response = await fetch(
    `http://localhost:3001/v1/content/${contentId}/progress`,
    {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer YOUR_TOKEN',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        progress,
        status: progress === 100 ? 'Completed' : 'In Progress',
        timeSpent: 30, // minutes
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Usage
await updateProgress('course_123', 75);
```

### **Get User Progress**

```typescript
const getUserProgress = async (userId: string) => {
  const response = await fetch(
    `http://localhost:3001/v1/users/${userId}/progress`,
    {
      headers: {
        Authorization: 'Bearer YOUR_TOKEN',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Usage
const progress = await getUserProgress('user_123');
console.log(`Completion rate: ${progress.data.completionRate}%`);
```

---

## 👤 User Management

### **Get Current User**

```typescript
const getCurrentUser = async () => {
  const response = await fetch('http://localhost:3001/v1/users/me', {
    headers: {
      Authorization: 'Bearer YOUR_TOKEN',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Usage
const user = await getCurrentUser();
console.log(`Welcome, ${user.data.firstName} ${user.data.lastName}!`);
```

### **Update User Profile**

```typescript
const updateUserProfile = async (updates: any) => {
  const response = await fetch('http://localhost:3001/v1/users/me', {
    method: 'PUT',
    headers: {
      Authorization: 'Bearer YOUR_TOKEN',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Usage
const updatedUser = await updateUserProfile({
  firstName: 'John',
  lastName: 'Smith',
  department: 'Emergency',
});
```

---

## 📈 Analytics

### **Get Dashboard Analytics**

```typescript
const getAnalytics = async (dateRange?: { from: string; to: string }) => {
  const params = new URLSearchParams();

  if (dateRange) {
    params.append('dateFrom', dateRange.from);
    params.append('dateTo', dateRange.to);
  }

  const response = await fetch(
    `http://localhost:3001/v1/analytics/dashboard?${params}`,
    {
      headers: {
        Authorization: 'Bearer YOUR_TOKEN',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Usage
const analytics = await getAnalytics({
  from: '2024-01-01',
  to: '2024-01-31',
});

console.log(`Total users: ${analytics.data.overview.totalUsers}`);
console.log(`Completion rate: ${analytics.data.overview.completionRate}%`);
```

---

## 🔗 Related Documentation

- **[API Reference](../api/README.md)** - Complete endpoint documentation
- **[Data Models](../api/data-models.md)** - TypeScript interfaces
- **[React Components](./react-components.md)** - React-specific examples
- **[Integration Patterns](./integration-patterns.md)** - Complete workflows
