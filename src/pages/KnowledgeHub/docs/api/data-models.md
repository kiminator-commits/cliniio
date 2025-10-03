# Data Models

## 📊 Core Data Types

### **ContentItem**

```typescript
interface ContentItem {
  id: string;
  title: string;
  category: ContentCategory;
  status: ContentStatus;
  dueDate: string; // YYYY-MM-DD
  progress: number; // 0-100
  domain: string;
  department?: string;
  lastUpdated?: string;
  description?: string;
  objectives?: string[];
  modules?: Module[];
  tags?: string[];
  estimatedDuration?: number; // minutes
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced';
  prerequisites?: string[];
  certificate?: Certificate;
}

type ContentCategory =
  | 'Courses'
  | 'Procedures'
  | 'Policies'
  | 'Learning Pathways';
type ContentStatus = 'Not Started' | 'In Progress' | 'Completed';
```

### **Module**

```typescript
interface Module {
  id: string;
  title: string;
  duration: number; // minutes
  completed: boolean;
  content?: string;
  quiz?: Quiz;
}
```

### **Certificate**

```typescript
interface Certificate {
  available: boolean;
  validFor?: string;
  issuedAt?: string;
  expiresAt?: string;
}
```

### **User**

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department: string;
  permissions: string[];
  preferences: UserPreferences;
  lastLogin: string;
  createdAt: string;
}

type UserRole = 'learner' | 'instructor' | 'admin';
```

### **Progress**

```typescript
interface Progress {
  userId: string;
  contentId: string;
  progress: number;
  status: ContentStatus;
  completedModules: string[];
  timeSpent: number; // minutes
  lastAccessed: string;
  completedAt?: string;
}
```

---

## 🔗 Related Documentation

- **[API Overview](./README.md)** - Complete API reference
- **[Endpoints](./README.md)** - API endpoint documentation
- **[Examples](../examples/)** - Usage examples with these models
