import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// export let options = {
//   vus: 150,
//   duration: '30s',
//   // Add thresholds for percentiles
//   thresholds: {
//     // http_req_duration is a built-in metric that measures response time
//     http_req_duration: [
//       'p(50) < 500', // p50 should be below 500ms
//       'p(90) < 1000', // p90 should be below 1000ms
//       'p(95) < 1200', // p95 should be below 1200ms
//       'p(99) < 2000', // p99 should be below 2000ms
//     ],
//   },
//   // Add summary report configuration
//   summaryTrendStats: [
//     'avg',
//     'min',
//     'med',
//     'max',
//     'p(50)',
//     'p(90)',
//     'p(95)',
//     'p(99)',
//   ],
// };

// export default function () {
//   const url = 'http://localhost:3000/shorten';
//   const payload = JSON.stringify({
//     longUrl: `https://www.example.com/page-${Math.random()}`,
//   });
//   const params = {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   };

//   let res = http.post(url, payload, params);

//   check(res, {
//     'is status 201': (r) => r.status === 201,
//   });

//   sleep(1);
// }

export let options = {
  vus: 500, // 10 Virtual Users (simultaneous requests)
  duration: '1s', // Run for 5 seconds
  // Add thresholds for percentiles
  thresholds: {
    // http_req_duration is a built-in metric that measures response time
    http_req_duration: [
      'p(50) < 500', // p50 should be below 500ms
      'p(90) < 1000', // p90 should be below 1000ms
      'p(95) < 1200', // p95 should be below 1200ms
      'p(99) < 2000', // p99 should be below 2000ms
    ],
  },
  // Add summary report configuration
  summaryTrendStats: [
    'avg',
    'min',
    'med',
    'max',
    'p(50)',
    'p(90)',
    'p(95)',
    'p(99)',
  ],
};

export default function () {
  const shortCodes = [
    '4glxAY',
    'aVF4mY',
    'KYXuqu',
    '5ue7Je',
    'xUR8HG',
    'Jumqee',
  ]; // Mix of valid codes
  const shortCode = shortCodes[Math.floor(Math.random() * shortCodes.length)]; // Pick one randomly

  const url = `http://localhost:3000/redirect?code=${shortCode}`;

  let res = http.get(url, { redirects: 0 });

  check(res, {
    'is status 302 (redirect)': (r) => r.status === 302,
  });
}
