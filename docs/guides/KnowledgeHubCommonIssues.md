# Common Issues

## 🚨 Frequently Encountered Problems

### **Authentication Errors**

#### **Problem: 401 Unauthorized**

```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid or expired token"
  }
}
```

**Solutions:**

1. **Check token validity**
   - Verify the token hasn't expired
   - Ensure the token format is correct: `Bearer <token>`

2. **Refresh token if expired**

   ```typescript
   const refreshToken = async () => {
     try {
       const response = await fetch('http://localhost:3001/v1/auth/refresh', {
         method: 'POST',
         headers: {
           Authorization: `Bearer ${refreshToken}`,
           'Content-Type': 'application/json',
         },
       });

       if (response.ok) {
         const data = await response.json();
         localStorage.setItem('cliniio_token', data.data.accessToken);
         return data.data.accessToken;
       }
     } catch (error) {
       console.error('Failed to refresh token:', error);
       // Redirect to login
     }
   };
   ```

3. **Verify token format**
   ```typescript
   const getAuthHeaders = () => {
     const token = localStorage.getItem('cliniio_token');
     if (!token) {
       throw new Error('No token available');
     }
     return {
       Authorization: `Bearer ${token}`,
       'Content-Type': 'application/json',
     };
   };
   ```

#### **Problem: 403 Forbidden**

```json
{
  "error": {
    "code": "AUTHORIZATION_ERROR",
    "message": "Insufficient permissions"
  }
}
```

**Solutions:**

1. **Check user role and permissions**

   ```typescript
   const checkPermissions = async () => {
     const user = await api.users.getCurrentUser();
     console.log('User permissions:', user.data.permissions);
     console.log('User role:', user.data.role);
   };
   ```

2. **Verify endpoint access**
   - Some endpoints require specific roles (admin, instructor, etc.)
   - Check if you're using the correct authentication method

---

### **Rate Limiting**

#### **Problem: 429 Too Many Requests**

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "retryAfter": 60
  }
}
```

**Solutions:**

1. **Implement exponential backoff**

   ```typescript
   const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = 3) => {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (error.status === 429 && i < maxRetries - 1) {
           const retryAfter = error.retryAfter || Math.pow(2, i) * 1000;
           console.log(`Rate limited. Waiting ${retryAfter}ms before retry...`);
           await new Promise((resolve) => setTimeout(resolve, retryAfter));
           continue;
         }
         throw error;
       }
     }
   };
   ```

2. **Reduce request frequency**
   - Implement request batching
   - Use caching to avoid repeated requests
   - Add delays between requests

3. **Upgrade plan if needed**
   - Check your current rate limit plan
   - Contact support for higher limits

---

### **Validation Errors**

#### **Problem: 400 Bad Request**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      },
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

**Solutions:**

1. **Check request body format**

   ```typescript
   const validateRequest = (data: any, requiredFields: string[]) => {
     const errors: string[] = [];

     requiredFields.forEach((field) => {
       if (!data[field] || data[field].toString().trim() === '') {
         errors.push(`${field} is required`);
       }
     });

     if (errors.length > 0) {
       throw new Error(`Validation failed: ${errors.join(', ')}`);
     }
   };
   ```

2. **Validate data types**

   ```typescript
   const validateTypes = (data: any, schema: Record<string, string>) => {
     const errors: string[] = [];

     Object.entries(schema).forEach(([field, expectedType]) => {
       const value = data[field];
       const actualType = typeof value;

       if (value !== undefined && actualType !== expectedType) {
         errors.push(`${field} should be ${expectedType}, got ${actualType}`);
       }
     });

     if (errors.length > 0) {
       throw new Error(`Type validation failed: ${errors.join(', ')}`);
     }
   };
   ```

3. **Use TypeScript interfaces**

   ```typescript
   interface CreateContentRequest {
     title: string;
     category: 'Courses' | 'Procedures' | 'Policies';
     domain: string;
     department?: string;
     dueDate: string;
   }

   const createContent = async (data: CreateContentRequest) => {
     // TypeScript will catch type errors at compile time
     return api.content.create(data);
   };
   ```

---

### **Network Errors**

#### **Problem: Connection Timeout**

**Solutions:**

1. **Set appropriate timeouts**

   ```typescript
   const apiRequest = async (url: string, options: RequestInit = {}) => {
     const controller = new AbortController();
     const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds

     try {
       const response = await fetch(url, {
         ...options,
         signal: controller.signal,
       });

       clearTimeout(timeoutId);
       return response;
     } catch (error) {
       clearTimeout(timeoutId);
       if (error.name === 'AbortError') {
         throw new Error('Request timeout');
       }
       throw error;
     }
   };
   ```

2. **Implement retry logic**
   ```typescript
   const retryOnNetworkError = async (
     fn: () => Promise<any>,
     maxRetries = 3
   ) => {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await fn();
       } catch (error) {
         if (error.message === 'Request timeout' && i < maxRetries - 1) {
           const delay = Math.pow(2, i) * 1000;
           console.log(`Request timeout. Retrying in ${delay}ms...`);
           await new Promise((resolve) => setTimeout(resolve, delay));
           continue;
         }
         throw error;
       }
     }
   };
   ```

---

### **Data Not Found**

#### **Problem: 404 Not Found**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

**Solutions:**

1. **Verify resource ID**

   ```typescript
   const getContent = async (id: string) => {
     if (!id || id.trim() === '') {
       throw new Error('Content ID is required');
     }

     try {
       return await api.content.getById(id);
     } catch (error) {
       if (error.status === 404) {
         console.error(`Content with ID ${id} not found`);
         // Handle gracefully - maybe show a "not found" message
         return null;
       }
       throw error;
     }
   };
   ```

2. **Check if resource exists before operations**

   ```typescript
   const updateContent = async (id: string, updates: any) => {
     // First check if content exists
     const existing = await api.content.getById(id);
     if (!existing) {
       throw new Error(`Cannot update: content ${id} not found`);
     }

     // Proceed with update
     return api.content.update(id, updates);
   };
   ```

---

## 🔧 Prevention Strategies

### **Input Validation**

```typescript
const validateInput = (input: any) => {
  const errors: string[] = [];

  // Required fields
  if (!input.title?.trim()) {
    errors.push('Title is required');
  }

  // Field length limits
  if (input.title && input.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  // Valid values
  const validCategories = ['Courses', 'Procedures', 'Policies'];
  if (input.category && !validCategories.includes(input.category)) {
    errors.push(`Category must be one of: ${validCategories.join(', ')}`);
  }

  // Date validation
  if (input.dueDate) {
    const dueDate = new Date(input.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.push('Invalid due date format');
    }
  }

  if (errors.length > 0) {
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  return true;
};
```

### **Error Boundaries**

```typescript
class APIErrorBoundary {
  private retryCount = 0;
  private maxRetries = 3;

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (this.shouldRetry(error) && this.retryCount < this.maxRetries) {
        this.retryCount++;
        console.log(
          `Retrying request (${this.retryCount}/${this.maxRetries})...`
        );
        return this.execute(fn);
      }

      this.handleError(error);
      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    return (
      error.status === 429 || // Rate limited
      error.status === 500 || // Server error
      error.message === 'Request timeout'
    );
  }

  private handleError(error: any) {
    console.error('API Error:', error);

    // Log to monitoring service
    // this.logError(error);

    // Show user-friendly message
    this.showUserMessage(error);
  }

  private showUserMessage(error: any) {
    const message = this.getUserFriendlyMessage(error);
    // Display message to user
    console.log(message);
  }

  private getUserFriendlyMessage(error: any): string {
    switch (error.status) {
      case 401:
        return 'Please log in again to continue.';
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return 'The requested resource was not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Something went wrong on our end. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}
```

---

## 🔗 Related Documentation

- **[Error Handling](../api/error-handling.md)** - Error codes and handling patterns
- **[Debugging](./debugging.md)** - Debugging tools and techniques
- **[Performance](./performance.md)** - Optimization and best practices
- **[API Reference](../api/README.md)** - Complete endpoint documentation
