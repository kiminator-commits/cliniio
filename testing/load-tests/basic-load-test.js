import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10, // number of virtual users
  duration: '30s', // total test duration
};

export default function () {
  // Test against a real endpoint - you can update this URL
  const res = http.get('http://localhost:3001/');
  check(res, { 'status is 200': (r) => r.status === 200 });
  sleep(1); // simulate user think time
}
