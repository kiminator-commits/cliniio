import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 10 }, // Stay at 10 users
    { duration: '2m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests must complete below 2s
    errors: ['rate<0.1'], // Error rate must be less than 10%
  },
};

const BASE_URL = 'http://localhost:3001'; // Update with your Cliniio URL

export default function () {
  // Test different endpoints
  const endpoints = [
    '/',
    '/home',
    '/inventory',
    '/sterilization',
    '/environmental-clean',
    '/knowledge-hub',
    '/settings',
  ];

  // Randomly select an endpoint
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

  const res = http.get(`${BASE_URL}${endpoint}`);

  // Check response
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timings.duration < 2000,
    'response has content': (r) => r.body.length > 0,
  });

  // Track errors
  errorRate.add(!success);

  // Simulate realistic user behavior
  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}
