import React from 'react';

export const ErrorHandlingGuide: React.FC = () => {
  return (
    <div className="error-handling">
      <h2>Error Handling</h2>

      <section>
        <h3>📋 Error Response Format</h3>
        <p>All API errors follow a consistent format:</p>

        <pre>
          <code>
            {`{
  "error": "ERROR_TYPE",
  "message": "Human-readable error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}`}
          </code>
        </pre>
      </section>

      <section>
        <h3>🚨 Common Error Types</h3>

        <div className="error-types">
          <div className="error-type">
            <h4>400 - Validation Error</h4>
            <pre>
              <code>
                {`{
  "error": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    },
    {
      "field": "dueDate",
      "message": "Due date must be in YYYY-MM-DD format"
    }
  ]
}`}
              </code>
            </pre>
          </div>

          <div className="error-type">
            <h4>401 - Unauthorized</h4>
            <pre>
              <code>
                {`{
  "error": "UNAUTHORIZED",
  "message": "Invalid or missing authentication token"
}`}
              </code>
            </pre>
          </div>

          <div className="error-type">
            <h4>403 - Forbidden</h4>
            <pre>
              <code>
                {`{
  "error": "FORBIDDEN",
  "message": "Insufficient permissions for this operation"
}`}
              </code>
            </pre>
          </div>

          <div className="error-type">
            <h4>404 - Not Found</h4>
            <pre>
              <code>
                {`{
  "error": "NOT_FOUND",
  "message": "Content item not found",
  "resource": "content"
}`}
              </code>
            </pre>
          </div>

          <div className="error-type">
            <h4>429 - Rate Limit Exceeded</h4>
            <pre>
              <code>
                {`{
  "error": "RATE_LIMIT_EXCEEDED",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 60
}`}
              </code>
            </pre>
          </div>

          <div className="error-type">
            <h4>500 - Server Error</h4>
            <pre>
              <code>
                {`{
  "error": "INTERNAL_SERVER_ERROR",
  "message": "An unexpected error occurred"
}`}
              </code>
            </pre>
          </div>
        </div>
      </section>

      <section>
        <h3>🛠️ Error Handling Examples</h3>

        <h4>JavaScript Error Handling</h4>
        <pre>
          <code>
            {`const handleApiError = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    
    switch (response.status) {
      case 400:
        console.error('Validation errors:', errorData.details);
        break;
      case 401:
        // Redirect to login
        window.location.href = '/login';
        break;
      case 403:
        console.error('Permission denied');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 429:
        const retryAfter = errorData.retryAfter;
        console.error(\`Rate limited. Retry after \${retryAfter} seconds\`);
        break;
      default:
        console.error('Unexpected error:', errorData.message);
    }
    
    throw new Error(errorData.message);
  }
  
  return response.json();
};

// Usage
try {
  const data = await fetch('/api/knowledge-hub/content')
    .then(handleApiError);
} catch (error) {
  console.error('API call failed:', error.message);
}`}
          </code>
        </pre>

        <h4>Python Error Handling</h4>
        <pre>
          <code>
            {`import requests
from requests.exceptions import RequestException

def handle_api_error(response):
    if response.status_code >= 400:
        error_data = response.json()
        
        if response.status_code == 400:
            print("Validation errors:", error_data.get('details', []))
        elif response.status_code == 401:
            print("Authentication required")
        elif response.status_code == 403:
            print("Permission denied")
        elif response.status_code == 404:
            print("Resource not found")
        elif response.status_code == 429:
            retry_after = error_data.get('retryAfter', 60)
            print(f"Rate limited. Retry after {retry_after} seconds")
        else:
            print("Unexpected error:", error_data.get('message'))
        
        raise RequestException(error_data.get('message', 'API Error'))
    
    return response.json()

# Usage
try:
    response = requests.get('/api/knowledge-hub/content')
    data = handle_api_error(response)
except RequestException as e:
    print(f"API call failed: {e}")`}
          </code>
        </pre>
      </section>
    </div>
  );
};
