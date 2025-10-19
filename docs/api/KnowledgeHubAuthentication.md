# Authentication

## 🔐 Authentication Methods

The Cliniio Knowledge Hub API supports two authentication methods:

### **1. JWT Token Authentication (Recommended)**

```http
Authorization: Bearer <your-jwt-token>
```

**Get JWT Token:**

```bash
curl -X POST "http://localhost:3001/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "your-password"
  }'
```

**Response:**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "learner",
      "permissions": ["read:content", "update:progress"]
    }
  }
}
```

### **2. API Key Authentication (Admin Only)**

```http
X-API-Key: <your-api-key>
```

---

## 🔑 Token Management

### **Refresh Token**

```bash
curl -X POST "http://localhost:3001/v1/auth/refresh" \
  -H "Authorization: Bearer <refresh-token>"
```

### **Revoke Token**

```bash
curl -X POST "http://localhost:3001/v1/auth/logout" \
  -H "Authorization: Bearer <access-token>"
```

---

## 📋 Required Headers

```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <jwt-token>
User-Agent: Cliniio-Client/1.0
```

---

## 🚦 Rate Limiting

### **Rate Limits by Plan**

| Plan           | Requests per Minute | Burst Limit | Description     |
| -------------- | ------------------- | ----------- | --------------- |
| **Free**       | 60                  | 10          | Basic usage     |
| **Standard**   | 100                 | 20          | Regular usage   |
| **Premium**    | 500                 | 50          | High usage      |
| **Enterprise** | 1000                | 100         | Unlimited usage |

### **Rate Limit Headers**

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567
```

### **Rate Limit Exceeded Response**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "retryAfter": 60
  }
}
```

### **Handling Rate Limits**

```typescript
const handleRateLimit = async (response: Response) => {
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const delay = parseInt(retryAfter || '60') * 1000;

    console.log(`Rate limited. Waiting ${delay}ms before retry...`);
    await new Promise((resolve) => setTimeout(resolve, delay));

    return true; // Retry the request
  }
  return false;
};
```

---

## 🔗 Related Documentation

- **[API Overview](./README.md)** - Complete API reference
- **[Error Handling](./error-handling.md)** - Authentication error codes
- **[Getting Started](../guides/getting-started.md)** - Setup and configuration
