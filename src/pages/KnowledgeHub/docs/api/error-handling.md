# Error Handling

## ❌ Error Response Format

All API errors follow this consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

---

## 🚨 Error Codes Reference

| Code                   | HTTP Status | Description                       | Action             |
| ---------------------- | ----------- | --------------------------------- | ------------------ |
| `AUTHENTICATION_ERROR` | 401         | Invalid or missing authentication | Re-authenticate    |
| `AUTHORIZATION_ERROR`  | 403         | Insufficient permissions          | Check user role    |
| `VALIDATION_ERROR`     | 400         | Invalid request data              | Fix request format |
| `NOT_FOUND`            | 404         | Resource not found                | Check resource ID  |
| `RATE_LIMIT_EXCEEDED`  | 429         | Too many requests                 | Wait and retry     |
| `INTERNAL_ERROR`       | 500         | Server error                      | Contact support    |

---

## 💻 Error Handling Examples

### **JavaScript/TypeScript**

```typescript
try {
  const response = await fetch('/api/content', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error appropriately
}
```

### **Python**

```python
import requests

try:
    response = requests.get(
        'http://localhost:3001/v1/content',
        headers={'Authorization': f'Bearer {token}'}
    )
    response.raise_for_status()
    data = response.json()
except requests.exceptions.HTTPError as e:
    error_data = e.response.json()
    print(f"API Error: {error_data['error']['message']}")
```

---

## 🔗 Related Documentation

- **[API Overview](./README.md)** - Complete API reference
- **[Authentication](./authentication.md)** - Authentication error handling
- **[Troubleshooting](../troubleshooting/)** - Common issues and solutions
