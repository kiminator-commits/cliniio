import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 5, // number of virtual users
  duration: '10s', // total test duration
};

export default function () {
  // Test against a public API to demonstrate k6 works
  const res = http.get('https://httpbin.org/get');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });
  sleep(1); // simulate user think time
}
