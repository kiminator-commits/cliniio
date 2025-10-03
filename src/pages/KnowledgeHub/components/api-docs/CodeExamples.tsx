import React from 'react';

export const CodeExamples: React.FC = () => {
  return (
    <div className="code-examples">
      <h2>Code Examples</h2>

      <section>
        <h3>📚 JavaScript/TypeScript Examples</h3>

        <h4>Fetch All Content</h4>
        <pre>
          <code>
            {`// Using fetch API
const fetchContent = async () => {
  const response = await fetch('/api/knowledge-hub/content', {
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  
  return await response.json();
};

// Using axios
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/knowledge-hub',
  headers: {
    'Authorization': \`Bearer \${token}\`
  }
});

const fetchContent = async () => {
  const response = await api.get('/content');
  return response.data;
};`}
          </code>
        </pre>

        <h4>Create New Content</h4>
        <pre>
          <code>
            {`const createContent = async (contentData) => {
  const response = await fetch('/api/knowledge-hub/content', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: 'New Safety Protocol',
      category: 'Procedures',
      status: 'Not Started',
      dueDate: '2024-03-01',
      progress: 0,
      department: 'Safety',
      description: 'Updated safety protocols for laboratory procedures'
    })
  });
  
  return await response.json();
};`}
          </code>
        </pre>

        <h4>Update Content Status</h4>
        <pre>
          <code>
            {`const updateStatus = async (contentId, status, progress) => {
  const response = await fetch(\`/api/knowledge-hub/content/\${contentId}/status\`, {
    method: 'PATCH',
    headers: {
      'Authorization': \`Bearer \${token}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: 'Completed',
      progress: 100
    })
  });
  
  return await response.json();
};`}
          </code>
        </pre>

        <h4>Search Content</h4>
        <pre>
          <code>
            {`const searchContent = async (query, filters = {}) => {
  const params = new URLSearchParams({
    q: query,
    ...filters
  });
  
  const response = await fetch(\`/api/knowledge-hub/content/search?\${params}\`, {
    headers: {
      'Authorization': \`Bearer \${token}\`
    }
  });
  
  return await response.json();
};

// Usage
const results = await searchContent('infection control', {
  category: 'Courses',
  status: 'In Progress'
});`}
          </code>
        </pre>
      </section>

      <section>
        <h3>🐍 Python Examples</h3>

        <h4>Using requests library</h4>
        <pre>
          <code>
            {`import requests
import json

class KnowledgeHubAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_content(self, page=1, page_size=20):
        params = {'page': page, 'pageSize': page_size}
        response = requests.get(
            f'{self.base_url}/content',
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()
    
    def create_content(self, content_data):
        response = requests.post(
            f'{self.base_url}/content',
            headers=self.headers,
            json=content_data
        )
        response.raise_for_status()
        return response.json()
    
    def search_content(self, query, **filters):
        params = {'q': query, **filters}
        response = requests.get(
            f'{self.base_url}/content/search',
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()

# Usage
api = KnowledgeHubAPI('http://localhost:3001/api/knowledge-hub', 'your-token')
content = api.get_content()
new_item = api.create_content({
    'title': 'New Protocol',
    'category': 'Procedures',
    'status': 'Not Started',
    'dueDate': '2024-03-01',
    'progress': 0
})`}
          </code>
        </pre>
      </section>

      <section>
        <h3>🔧 cURL Examples</h3>

        <h4>Basic requests</h4>
        <pre>
          <code>
            {`# Get all content
curl -X GET "http://localhost:3001/api/knowledge-hub/content" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json"

# Create new content
curl -X POST "http://localhost:3001/api/knowledge-hub/content" \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "New Safety Protocol",
    "category": "Procedures",
    "status": "Not Started",
    "dueDate": "2024-03-01",
    "progress": 0,
    "department": "Safety",
    "description": "Updated safety protocols"
  }'

# Search content
curl -X GET "http://localhost:3001/api/knowledge-hub/content/search?q=infection+control&category=Courses" \\
  -H "Authorization: Bearer YOUR_TOKEN"`}
          </code>
        </pre>
      </section>
    </div>
  );
};
