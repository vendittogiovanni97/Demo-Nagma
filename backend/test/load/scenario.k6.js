import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const apiTrend = new Trend('api_duration');

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 100 },
    { duration: '1m', target: 100 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const email = __ENV.EMAIL || 'superadmin@nagma.it';
const password = __ENV.PASSWORD || 'superadmin123';

export default function () {
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json' },
  });

  check(loginRes, { 'login ok': (r) => r.status === 200 });
  errorRate.add(loginRes.status !== 200);
  apiTrend.add(loginRes.timings.duration);

  if (loginRes.status !== 200) {
    sleep(1);
    return;
  }

  const token = loginRes.json('token');
  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const endpoints = [
    '/api/bookings?limit=10',
    '/api/customers?limit=10',
    '/api/staff/members',
    '/api/finance/transactions/summary',
  ];

  for (const ep of endpoints) {
    const res = http.get(`${BASE_URL}${ep}`, { headers: authHeaders });
    check(res, { [`${ep} ok`]: (r) => r.status === 200 || r.status === 204 });
    errorRate.add(res.status >= 400);
    apiTrend.add(res.timings.duration);
    sleep(0.5);
  }
}
