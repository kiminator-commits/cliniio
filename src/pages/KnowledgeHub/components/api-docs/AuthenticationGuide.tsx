import React from 'react';

export const AuthenticationGuide: React.FC = () => {
  return (
    <div className="api-guide">
      <h2>Getting Started with KnowledgeHub API</h2>

      <section>
        <h3>🔐 Authentication</h3>
        <p>
          The KnowledgeHub API uses JWT (JSON Web Tokens) for authentication.
        </p>

        <h4>Getting a Token</h4>
        <pre>
          <code>
            {`// Login to get authentication token
POST /auth/login
{
  "email": "user@example.com",
  "password": "Cliniio2025.secure!"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-123",
    "email": "user@example.com",
    "role": "admin"
  }
}`}
          </code>
        </pre>

        <h4>Using the Token</h4>
        <pre>
          <code>
            {`// Include token in Authorization header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Example request
fetch('/api/knowledge-hub/content', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
})`}
          </code>
        </pre>
      </section>

      <section>
        <h3>⚡ Rate Limiting</h3>
        <p>To ensure fair usage, the API implements rate limiting:</p>
        <ul>
          <li>
            <strong>Standard requests:</strong> 100 requests per minute
          </li>
          <li>
            <strong>Burst requests:</strong> 10 requests per second
          </li>
          <li>
            <strong>Search requests:</strong> 50 requests per minute
          </li>
        </ul>

        <h4>Rate Limit Headers</h4>
        <pre>
          <code>
            {`X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642684800`}
          </code>
        </pre>
      </section>

      <section>
        <h3>📊 Pagination</h3>
        <p>List endpoints support pagination for efficient data retrieval:</p>

        <h4>Pagination Parameters</h4>
        <ul>
          <li>
            <code>page</code> - Page number (1-based, default: 1)
          </li>
          <li>
            <code>pageSize</code> - Items per page (1-100, default: 20)
          </li>
        </ul>

        <h4>Pagination Response</h4>
        <pre>
          <code>
            {`{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}`}
          </code>
        </pre>
      </section>

      <section>
        <h3>🔍 Search & Filtering</h3>
        <p>The API provides powerful search and filtering capabilities:</p>

        <h4>Search Endpoint</h4>
        <pre>
          <code>
            {`GET /api/knowledge-hub/content/search?q=infection+control&category=Courses&status=In+Progress`}
          </code>
        </pre>

        <h4>Filter Parameters</h4>
        <ul>
          <li>
            <code>category</code> - Filter by content category
          </li>
          <li>
            <code>status</code> - Filter by content status
          </li>
          <li>
            <code>department</code> - Filter by department
          </li>
          <li>
            <code>sortBy</code> - Sort field (title, status, dueDate, progress,
            lastUpdated)
          </li>
          <li>
            <code>sortDirection</code> - Sort direction (asc, desc)
          </li>
        </ul>
      </section>
    </div>
  );
};
