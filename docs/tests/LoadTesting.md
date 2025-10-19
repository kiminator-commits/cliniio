# Cliniio Load Testing with k6

This directory contains load testing scripts for the Cliniio application using k6.

## Prerequisites

k6 is already downloaded and available at: `.\k6\k6-v0.47.0-windows-amd64\k6.exe`

## Test Scripts

### 1. Basic Load Test (`basic-load-test.js`)

- Simple test with 10 virtual users for 30 seconds
- Tests a single API endpoint
- Good for quick performance checks

### 2. Comprehensive Load Test (`cliniio-load-test.js`)

- Realistic load test with ramp-up/ramp-down stages
- Tests multiple Cliniio endpoints
- Includes performance thresholds and error tracking
- Simulates realistic user behavior

## Running the Tests

### Basic Test

```bash
.\k6\k6-v0.47.0-windows-amd64\k6.exe run load-tests/basic-load-test.js
```

### Comprehensive Test

```bash
.\k6\k6-v0.47.0-windows-amd64\k6.exe run load-tests/cliniio-load-test.js
```

## Configuration

Before running tests, update the `BASE_URL` in the test scripts to match your Cliniio deployment:

```javascript
const BASE_URL = 'http://localhost:3001'; // Update this URL
```

## Test Parameters

### Basic Test

- **Virtual Users**: 10
- **Duration**: 30 seconds
- **Think Time**: 1 second

### Comprehensive Test

- **Ramp Up**: 2 minutes to 10 users
- **Sustain**: 5 minutes at 10 users
- **Ramp Down**: 2 minutes to 0 users
- **Performance Thresholds**: 95% of requests < 2 seconds
- **Error Rate**: < 10%

## Expected Results

The tests will output metrics including:

- HTTP request duration
- Request rate
- Error rate
- Virtual user count
- Data transfer rates

## Customization

You can modify the test parameters by editing the `options` object in each script:

```javascript
export const options = {
  vus: 20,           // Change number of virtual users
  duration: '1m',    // Change test duration
  stages: [...],     // Modify load stages
  thresholds: {...}, // Adjust performance thresholds
};
```
