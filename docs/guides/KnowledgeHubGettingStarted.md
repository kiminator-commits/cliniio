# Getting Started

## 🚀 Quick Start Guide

### **Prerequisites**

- Cliniio instance running
- API access credentials
- Basic knowledge of HTTP APIs

### **Step 1: Get Your API Credentials**

1. **Contact your Cliniio administrator** to get API access
2. **Receive your credentials:**
   - JWT token (recommended)
   - API key (admin only)

### **Step 2: Set Up Your Environment**

#### **Environment Variables**

```bash
# .env file
CLINIIO_API_URL=http://localhost:3001/v1
CLINIIO_API_TOKEN=your-jwt-token
CLINIIO_API_KEY=your-api-key
```

#### **Base Configuration**

```typescript
const API_CONFIG = {
  baseURL: process.env.CLINIIO_API_URL || 'http://localhost:3001/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'User-Agent': 'Cliniio-Client/1.0',
  },
};
```

### **Step 3: Make Your First Request**

#### **Simple GET Request**

```typescript
const getContent = async () => {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}/content`, {
      headers: {
        ...API_CONFIG.headers,
        Authorization: `Bearer ${process.env.CLINIIO_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching content:', error);
    throw error;
  }
};
```

#### **Test the Request**

```bash
curl -X GET "http://localhost:3001/v1/content" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 Configuration

### **Authentication Setup**

#### **JWT Token (Recommended)**

```typescript
class CliniioAPI {
  private baseURL: string;
  private token: string;

  constructor(baseURL: string, token: string) {
    this.baseURL = baseURL;
    this.token = token;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${this.token}`,
      'User-Agent': 'Cliniio-Client/1.0',
    };
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  }
}
```

#### **API Key (Admin Only)**

```typescript
class CliniioAdminAPI {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-API-Key': this.apiKey,
      'User-Agent': 'Cliniio-Admin-Client/1.0',
    };
  }

  // ... similar request method
}
```

### **Error Handling Setup**

```typescript
class CliniioAPIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'CliniioAPIError';
  }
}

const handleAPIError = (response: Response, data: any) => {
  if (!response.ok) {
    throw new CliniioAPIError(
      data.error?.message || 'API request failed',
      response.status,
      data.error?.code || 'UNKNOWN_ERROR',
      data.error?.details
    );
  }
};
```

---

## 📱 SDK Setup

### **Install Official SDK**

```bash
npm install @cliniio/sdk
```

### **Initialize SDK**

```typescript
import { CliniioAPI } from '@cliniio/sdk';

const api = new CliniioAPI({
  baseURL: 'http://localhost:3001/v1',
  token: 'your-jwt-token',
});

// Use the API
const content = await api.content.getAll();
```

---

## 🧪 Testing Your Setup

### **Health Check**

```bash
curl -X GET "http://localhost:3001/v1/health" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **User Profile Test**

```bash
curl -X GET "http://localhost:3001/v1/users/me" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **Content List Test**

```bash
curl -X GET "http://localhost:3001/v1/content?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔗 Next Steps

- **[API Reference](../api/README.md)** - Explore all available endpoints
- **[Examples](../examples/)** - See real-world usage examples
- **[SDK Usage](./sdk-usage.md)** - Learn about official SDKs and libraries
- **[Testing](./testing.md)** - Set up testing environments

---

## 🆘 Need Help?

- **Check the [Troubleshooting](../troubleshooting/) section**
- **Review [Error Handling](../api/error-handling.md)**
- **Contact your Cliniio administrator**
