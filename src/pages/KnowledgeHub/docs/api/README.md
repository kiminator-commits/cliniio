# API Overview

## 🏗️ Core Concepts

### **API Versioning**

- **Current Version**: v1
- **Version Header**: `X-API-Version: v1`
- **Deprecation Policy**: 6 months notice for breaking changes
- **Backward Compatibility**: Maintained within major versions

### **Pagination**

All list endpoints support pagination:

```http
GET /content?page=1&limit=20
```

**Pagination Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Pagination Response:**

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### **Filtering & Sorting**

#### **Filtering**

```http
GET /content?category=Courses&status=In Progress&domain=Safety
```

#### **Searching**

```http
GET /content?search=infection control
```

#### **Sorting**

```http
GET /content?sortBy=title&sortOrder=asc
```

**Available Sort Fields:**

- `title` - Content title
- `dueDate` - Due date
- `progress` - Progress percentage
- `lastUpdated` - Last update timestamp
- `createdAt` - Creation timestamp

---

## 📡 Endpoints Reference

### **Content Management**

#### **Get All Content**

```http
GET /content
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter by category |
| `status` | string | No | Filter by status |
| `domain` | string | No | Filter by domain |
| `search` | string | No | Search in title/description |
| `page` | number | No | Page number (default: 1) |
| `limit` | number | No | Items per page (default: 20) |
| `sortBy` | string | No | Sort field |
| `sortOrder` | string | No | Sort order (asc/desc) |

**Example Request:**

```bash
curl -X GET "http://localhost:3001/v1/content?category=Courses&status=In%20Progress&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
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
      "dueDate": "2024-03-01",
      "progress": 65,
      "domain": "Safety",
      "department": "Nursing",
      "lastUpdated": "2024-01-15T10:30:00Z",
      "tags": ["Required", "New"],
      "estimatedDuration": 45,
      "difficulty": "Beginner"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

#### **Get Content by ID**

```http
GET /content/{id}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | Content ID |

**Example:**

```bash
curl -X GET "http://localhost:3001/v1/content/course_123" \
  -H "Authorization: Bearer <token>"
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "course_123",
    "title": "Infection Control Basics",
    "category": "Courses",
    "status": "In Progress",
    "dueDate": "2024-03-01",
    "progress": 65,
    "domain": "Safety",
    "department": "Nursing",
    "lastUpdated": "2024-01-15T10:30:00Z",
    "description": "Comprehensive guide to infection control protocols...",
    "objectives": [
      "Understand basic infection control principles",
      "Identify common transmission routes",
      "Apply proper hand hygiene techniques"
    ],
    "modules": [
      {
        "id": "module_1",
        "title": "Introduction to Infection Control",
        "duration": 15,
        "completed": true
      },
      {
        "id": "module_2",
        "title": "Hand Hygiene Protocols",
        "duration": 20,
        "completed": false
      }
    ],
    "tags": ["Required", "New"],
    "estimatedDuration": 45,
    "difficulty": "Beginner",
    "prerequisites": [],
    "certificate": {
      "available": true,
      "validFor": "365 days"
    }
  }
}
```

#### **Create Content**

```http
POST /content
```

**Request Body:**

```json
{
  "title": "New Course Title",
  "category": "Courses",
  "domain": "Safety",
  "department": "Nursing",
  "dueDate": "2024-04-01",
  "description": "Course description...",
  "objectives": ["Learning objective 1", "Learning objective 2"],
  "estimatedDuration": 60,
  "difficulty": "Intermediate",
  "tags": ["Required", "Updated"]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "course_456",
    "title": "New Course Title",
    "category": "Courses",
    "status": "Not Started",
    "progress": 0,
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": "user_123"
  }
}
```

#### **Update Content**

```http
PUT /content/{id}
```

**Request Body:**

```json
{
  "title": "Updated Course Title",
  "description": "Updated description...",
  "dueDate": "2024-05-01"
}
```

#### **Delete Content**

```http
DELETE /content/{id}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "message": "Content deleted successfully",
    "deletedAt": "2024-01-15T10:30:00Z"
  }
}
```

### **Progress Management**

#### **Update Progress**

```http
PATCH /content/{id}/progress
```

**Request Body:**

```json
{
  "progress": 75,
  "status": "In Progress",
  "completedModules": ["module_1", "module_2"],
  "timeSpent": 30
}
```

#### **Get User Progress**

```http
GET /users/{userId}/progress
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | string | No | Filter by category |
| `dateFrom` | string | No | Start date (YYYY-MM-DD) |
| `dateTo` | string | No | End date (YYYY-MM-DD) |

**Response:**

```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "totalCourses": 25,
    "completedCourses": 18,
    "inProgressCourses": 5,
    "notStartedCourses": 2,
    "averageProgress": 72.5,
    "completionRate": 72,
    "timeSpent": 1250,
    "certificatesEarned": 15,
    "progressByCategory": {
      "Courses": 75,
      "Procedures": 60,
      "Policies": 90,
      "Learning Pathways": 45
    },
    "recentActivity": [
      {
        "contentId": "course_123",
        "action": "completed",
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ]
  }
}
```

### **User Management**

#### **Get Current User**

```http
GET /users/me
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "learner",
    "department": "Nursing",
    "permissions": ["read:content", "update:progress", "create:notes"],
    "preferences": {
      "theme": "light",
      "notifications": true,
      "language": "en"
    },
    "lastLogin": "2024-01-15T10:30:00Z",
    "createdAt": "2023-01-01T00:00:00Z"
  }
}
```

#### **Update User Profile**

```http
PUT /users/me
```

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Smith",
  "department": "Emergency",
  "preferences": {
    "theme": "dark",
    "notifications": false
  }
}
```

### **Analytics & Reporting**

#### **Get Analytics Dashboard**

```http
GET /analytics/dashboard
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `dateFrom` | string | No | Start date |
| `dateTo` | string | No | End date |
| `department` | string | No | Filter by department |

**Response:**

```json
{
  "success": true,
  "data": {
    "overview": {
      "totalUsers": 1250,
      "activeUsers": 890,
      "totalContent": 450,
      "completionRate": 78.5
    },
    "completionTrends": {
      "daily": [
        { "date": "2024-01-15", "completions": 45 },
        { "date": "2024-01-16", "completions": 52 }
      ],
      "weekly": [
        { "week": "2024-W03", "completions": 320 },
        { "week": "2024-W04", "completions": 345 }
      ]
    },
    "topContent": [
      {
        "id": "course_123",
        "title": "Infection Control Basics",
        "completions": 125,
        "averageRating": 4.5
      }
    ],
    "departmentStats": {
      "Nursing": { "users": 450, "completionRate": 82 },
      "Emergency": { "users": 200, "completionRate": 75 },
      "Surgery": { "users": 150, "completionRate": 88 }
    }
  }
}
```

#### **Export Report**

```http
POST /analytics/export
```

**Request Body:**

```json
{
  "reportType": "completion",
  "format": "csv",
  "filters": {
    "dateFrom": "2024-01-01",
    "dateTo": "2024-01-31",
    "department": "Nursing"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "downloadUrl": "http://localhost:3001/v1/downloads/report_123.csv",
    "expiresAt": "2024-01-16T10:30:00Z"
  }
}
```

---

## 🔗 Related Documentation

- **[Authentication](./authentication.md)** - Authentication methods and security
- **[Data Models](./data-models.md)** - TypeScript interfaces and schemas
- **[Error Handling](./error-handling.md)** - Error codes and handling patterns
- **[Examples](../examples/)** - Code examples and integration patterns
