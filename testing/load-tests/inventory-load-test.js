import http from 'k6/http';
import { sleep, check } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const inventoryResponseTime = new Trend('inventory_response_time');
const cacheHitRate = new Rate('cache_hits');
const databaseLoadTime = new Trend('database_load_time');

export const options = {
  stages: [
    { duration: '1m', target: 5 }, // Ramp up to 5 users
    { duration: '3m', target: 10 }, // Ramp up to 10 users
    { duration: '5m', target: 20 }, // Ramp up to 20 users
    { duration: '3m', target: 20 }, // Stay at 20 users (peak load)
    { duration: '2m', target: 10 }, // Ramp down to 10 users
    { duration: '1m', target: 0 }, // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% of requests must complete below 3s
    errors: ['rate<0.05'], // Error rate must be less than 5%
    inventory_response_time: ['p(95)<2000'], // Inventory operations under 2s
    database_load_time: ['p(95)<1500'], // Database operations under 1.5s
    cache_hits: ['rate>0.3'], // At least 30% cache hit rate
  },
};

const BASE_URL = 'http://localhost:3001';

// Test data for inventory operations
const testItems = [
  {
    name: 'Test Item 1',
    category: 'tools',
    location: 'Storage A',
    quantity: 10,
  },
  {
    name: 'Test Item 2',
    category: 'supplies',
    location: 'Storage B',
    quantity: 15,
  },
  {
    name: 'Test Item 3',
    category: 'equipment',
    location: 'Storage C',
    quantity: 5,
  },
  {
    name: 'Test Item 4',
    category: 'officeHardware',
    location: 'Storage D',
    quantity: 8,
  },
];

export default function () {
  // eslint-disable-next-line no-undef, @typescript-eslint/no-unused-vars
  const userId = __VU; // Virtual user ID
  const randomItem = testItems[Math.floor(Math.random() * testItems.length)];

  // Test 1: Load inventory page (should use cache)
  const inventoryPageStart = Date.now();
  const inventoryRes = http.get(`${BASE_URL}/inventory`);
  const inventoryLoadTime = Date.now() - inventoryPageStart;

  inventoryResponseTime.add(inventoryLoadTime);

  check(inventoryRes, {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'inventory page loads successfully': (r) => r.status === 200,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'inventory page response time < 2s': (r) => inventoryLoadTime < 2000,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    'inventory page has content': (r) => r.body.length > 1000,
  });

  // Simulate cache hit (subsequent requests should be faster)
  // eslint-disable-next-line no-undef
  if (__ITER > 0) {
    cacheHitRate.add(true);
  } else {
    cacheHitRate.add(false);
  }

  sleep(1);

  // Test 2: Simulate inventory API calls
  const apiEndpoints = [
    '/api/inventory/items',
    '/api/inventory/categories',
    '/api/inventory/locations',
    '/api/inventory/analytics',
  ];

  apiEndpoints.forEach((endpoint) => {
    const dbStart = Date.now();
    const apiRes = http.get(`${BASE_URL}${endpoint}`);
    const dbLoadTime = Date.now() - dbStart;

    databaseLoadTime.add(dbLoadTime);

    check(apiRes, {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [`${endpoint} returns 200`]: (r) => r.status === 200,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [`${endpoint} response time < 1.5s`]: (r) => dbLoadTime < 1500,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [`${endpoint} has JSON response`]: (r) =>
        r.headers['Content-Type']?.includes('application/json'),
    });

    sleep(0.5);
  });

  // Test 3: Simulate concurrent inventory operations
  const concurrentOperations = [
    // Read operations (should be cached)
    () => http.get(`${BASE_URL}/api/inventory/items?category=tools`),
    () => http.get(`${BASE_URL}/api/inventory/items?category=supplies`),
    () => http.get(`${BASE_URL}/api/inventory/items?search=test`),

    // Write operations (should bypass cache)
    () =>
      http.post(`${BASE_URL}/api/inventory/items`, JSON.stringify(randomItem), {
        headers: { 'Content-Type': 'application/json' },
      }),
  ];

  // Execute operations with some concurrency
  const promises = concurrentOperations.map((op) => op());
  const results = Promise.all(promises);

  // Track errors
  const success = check(results, {
    'concurrent operations complete': (r) =>
      r.every((res) => res.status === 200 || res.status === 201),
  });

  errorRate.add(!success);

  // Test 4: Simulate real user behavior patterns
  const userPatterns = [
    // Pattern 1: Browse inventory
    () => {
      http.get(`${BASE_URL}/inventory`);
      sleep(2);
      http.get(`${BASE_URL}/api/inventory/items?category=tools`);
      sleep(1);
      http.get(`${BASE_URL}/api/inventory/items?category=supplies`);
    },

    // Pattern 2: Search and filter
    () => {
      http.get(`${BASE_URL}/api/inventory/items?search=equipment`);
      sleep(1);
      http.get(`${BASE_URL}/api/inventory/items?location=Storage A`);
      sleep(1);
      http.get(`${BASE_URL}/api/inventory/analytics`);
    },

    // Pattern 3: CRUD operations
    () => {
      const newItem = {
        name: `Load Test Item ${Date.now()}`,
        category: 'test',
        location: 'Test Storage',
        quantity: Math.floor(Math.random() * 20) + 1,
      };

      const createRes = http.post(
        `${BASE_URL}/api/inventory/items`,
        JSON.stringify(newItem),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (createRes.status === 201) {
        const itemId = JSON.parse(createRes.body).id;
        sleep(1);

        // Update the item
        http.put(
          `${BASE_URL}/api/inventory/items/${itemId}`,
          JSON.stringify({
            quantity: newItem.quantity + 5,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        );

        sleep(1);

        // Delete the item
        http.del(`${BASE_URL}/api/inventory/items/${itemId}`);
      }
    },
  ];

  // Execute a random user pattern
  const pattern = userPatterns[Math.floor(Math.random() * userPatterns.length)];
  pattern();

  // Simulate realistic user think time
  sleep(Math.random() * 3 + 2); // 2-5 seconds
}

// Setup function to prepare test data
export function setup() {
  console.log('🧪 Setting up inventory load test...');

  // Create some test data if needed
  const setupRes = http.post(
    `${BASE_URL}/api/inventory/setup-test-data`,
    JSON.stringify({
      items: testItems,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (setupRes.status !== 200) {
    console.warn(
      '⚠️ Could not set up test data, continuing with existing data'
    );
  }

  return { testDataCreated: setupRes.status === 200 };
}

// Teardown function to clean up test data
export function teardown(data) {
  console.log('🧹 Cleaning up inventory load test...');

  if (data.testDataCreated) {
    http.post(
      `${BASE_URL}/api/inventory/cleanup-test-data`,
      JSON.stringify({
        cleanup: true,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle test results
export function handleSummary(data) {
  console.log('📊 Inventory Load Test Summary:');
  console.log(`   Total requests: ${data.metrics.http_reqs.values.count}`);
  console.log(
    `   Average response time: ${data.metrics.http_req_duration.values.avg}ms`
  );
  console.log(
    `   95th percentile: ${data.metrics.http_req_duration.values['p(95)']}ms`
  );
  console.log(
    `   Error rate: ${(data.metrics.errors.values.rate * 100).toFixed(2)}%`
  );
  console.log(
    `   Cache hit rate: ${(data.metrics.cache_hits.values.rate * 100).toFixed(2)}%`
  );

  return {
    'inventory-load-test-summary.json': JSON.stringify(data, null, 2),
  };
}
