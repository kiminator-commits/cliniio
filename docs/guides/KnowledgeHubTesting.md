# Testing

## 🧪 Test Environment

| Environment | Base URL                               | Description            |
| ----------- | -------------------------------------- | ---------------------- |
| **Staging** | `https://staging.your-instance.com/v1` | Pre-production testing |
| **Sandbox** | `https://sandbox.your-instance.com/v1` | Isolated testing       |
| **Local**   | `http://localhost:3001/v1`             | Local development      |

---

## 📊 Test Data

### **Sample Content**

```json
{
  "id": "test_course_123",
  "title": "Test Course",
  "category": "Courses",
  "status": "Not Started",
  "dueDate": "2024-12-31",
  "progress": 0
}
```

### **Sample User**

```json
{
  "id": "test_user_123",
  "email": "test@cliniio.com",
  "role": "learner",
  "department": "Testing"
}
```

---

## 🛠️ API Testing Tools

### **Postman Collection**

1. **Download Collection:**

   ```bash
   curl -O http://localhost:3001/v1/docs/postman-collection.json
   ```

2. **Import to Postman:**
   - Open Postman
   - Click "Import"
   - Select the downloaded file

3. **Set Environment Variables:**

   ```json
   {
     "baseUrl": "http://localhost:3001/v1",
     "token": "your-test-token",
     "userId": "test-user-123"
   }
   ```

4. **Run Tests:**
   ```bash
   newman run postman-collection.json -e environment.json
   ```

---

## 🧪 Automated Testing

### **JavaScript/TypeScript**

```typescript
import { CliniioAPI } from '@cliniio/sdk';

describe('Cliniio Knowledge Hub API', () => {
  let api: CliniioAPI;

  beforeEach(() => {
    api = new CliniioAPI({
      baseURL: process.env.TEST_API_URL || 'http://localhost:3001/v1',
      token: process.env.TEST_TOKEN || 'test-token',
    });
  });

  test('should get all courses', async () => {
    const courses = await api.content.getAll({ category: 'Courses' });
    expect(courses.data).toBeInstanceOf(Array);
    expect(courses.success).toBe(true);
  });

  test('should update progress', async () => {
    const result = await api.content.updateProgress('test-course', {
      progress: 50,
      status: 'In Progress',
    });
    expect(result.success).toBe(true);
  });

  test('should handle authentication errors', async () => {
    const invalidApi = new CliniioAPI({
      baseURL: 'http://localhost:3001/v1',
      token: 'invalid-token',
    });

    await expect(invalidApi.content.getAll()).rejects.toThrow(
      'Authentication failed'
    );
  });
});
```

### **Python**

```python
import pytest
from cliniio import CliniioAPI

class TestCliniioAPI:
    @pytest.fixture
    def api(self):
        return CliniioAPI(
            base_url='http://localhost:3001/v1',
            token='test-token'
        )

    def test_get_all_courses(self, api):
        courses = api.content.get_all(category='Courses')
        assert courses['success'] is True
        assert 'data' in courses

    def test_update_progress(self, api):
        result = api.content.update_progress('test-course', {
            'progress': 50,
            'status': 'In Progress'
        })
        assert result['success'] is True
```

---

## 📈 Load Testing

### **k6 Script**

```javascript
import { check } from 'k6';
import http from 'k6/http';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  const response = http.get('http://localhost:3001/v1/content', {
    headers: {
      Authorization: `Bearer ${__ENV.TEST_TOKEN}`,
    },
  });

  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

### **Run Load Test**

```bash
k6 run -e TEST_TOKEN=your-test-token load-test.js
```

---

## 🔍 Integration Testing

### **Complete Workflow Test**

```typescript
describe('Complete Course Workflow', () => {
  let api: CliniioAPI;
  let courseId: string;
  let userId: string;

  beforeAll(async () => {
    api = new CliniioAPI({
      baseURL: process.env.TEST_API_URL || 'http://localhost:3001/v1',
      token: process.env.TEST_TOKEN || 'test-token',
    });

    // Get test user
    const user = await api.users.getCurrentUser();
    userId = user.data.id;
  });

  test('should complete full course lifecycle', async () => {
    // 1. Create course
    const course = await api.content.create({
      title: 'Integration Test Course',
      category: 'Courses',
      domain: 'Testing',
      department: 'QA',
    });
    courseId = course.data.id;

    // 2. Get course details
    const courseDetails = await api.content.getById(courseId);
    expect(courseDetails.data.title).toBe('Integration Test Course');

    // 3. Update progress
    await api.content.updateProgress(courseId, {
      progress: 50,
      status: 'In Progress',
    });

    // 4. Complete course
    await api.content.updateProgress(courseId, {
      progress: 100,
      status: 'Completed',
    });

    // 5. Verify completion
    const finalCourse = await api.content.getById(courseId);
    expect(finalCourse.data.status).toBe('Completed');
    expect(finalCourse.data.progress).toBe(100);

    // 6. Check analytics
    const analytics = await api.analytics.getDashboard({
      dateFrom: new Date().toISOString().split('T')[0],
    });
    expect(analytics.data.overview.completionRate).toBeGreaterThan(0);
  });

  afterAll(async () => {
    // Cleanup test course
    if (courseId) {
      await api.content.delete(courseId);
    }
  });
});
```

---

## 🚨 Error Testing

### **Test Error Scenarios**

```typescript
describe('Error Handling', () => {
  let api: CliniioAPI;

  beforeEach(() => {
    api = new CliniioAPI({
      baseURL: 'http://localhost:3001/v1',
      token: 'test-token',
    });
  });

  test('should handle 404 errors', async () => {
    await expect(api.content.getById('non-existent-id')).rejects.toThrow(
      'Resource not found'
    );
  });

  test('should handle validation errors', async () => {
    await expect(
      api.content.create({
        // Missing required fields
        title: '',
        category: 'InvalidCategory',
      })
    ).rejects.toThrow('Validation failed');
  });

  test('should handle rate limiting', async () => {
    // Make many requests quickly
    const promises = Array(150)
      .fill(0)
      .map(() => api.content.getAll());

    await expect(Promise.all(promises)).rejects.toThrow('Rate limit exceeded');
  });
});
```

---

## 📋 Test Checklist

### **Before Running Tests**

- [ ] Test environment is accessible
- [ ] Test credentials are valid
- [ ] Test data is available
- [ ] Dependencies are installed

### **Test Coverage**

- [ ] Authentication flows
- [ ] CRUD operations
- [ ] Error scenarios
- [ ] Rate limiting
- [ ] Data validation
- [ ] Performance benchmarks

### **After Tests**

- [ ] Clean up test data
- [ ] Verify no side effects
- [ ] Check test reports
- [ ] Update documentation if needed

---

## 🔗 Related Documentation

- **[Getting Started](./getting-started.md)** - Setup and configuration
- **[SDK Usage](./sdk-usage.md)** - Using SDKs for testing
- **[Error Handling](../api/error-handling.md)** - Error codes and handling
- **[Examples](../examples/)** - Code examples and patterns
