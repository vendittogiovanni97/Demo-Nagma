import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiTrend = new Trend('api_duration');
const loginTrend = new Trend('login_duration');
const crudTrend = new Trend('crud_duration');
const reqCount = new Counter('total_requests');

export const options = {
  scenarios: {
    // Smoke test: verifica che tutto funzioni
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '10s',
      startTime: '0s',
      tags: { scenario: 'smoke' },
    },
    // Ramp-up: carico crescente fino a 50 VU
    ramp_up: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 20 },
        { duration: '1m', target: 50 },
        { duration: '30s', target: 50 },
        { duration: '30s', target: 0 },
      ],
      startTime: '15s',
      tags: { scenario: 'ramp_up' },
    },
    // Spike: picco improvviso
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 100 },
        { duration: '30s', target: 100 },
        { duration: '10s', target: 0 },
      ],
      startTime: '3m',
      tags: { scenario: 'spike' },
    },
  },
  thresholds: {
    errors: ['rate<0.05'],
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    login_duration: ['p(95)<1500'],
    crud_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';
const email = __ENV.EMAIL || 'superadmin@nagma.it';
const password = __ENV.PASSWORD || 'superadmin123';

function authHeaders(token) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

export default function () {
  let token;

  // 1. Login
  group('Login', () => {
    const res = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({ email, password }),
      { headers: { 'Content-Type': 'application/json' } },
    );

    check(res, { 'login 200': (r) => r.status === 200 });
    errorRate.add(res.status !== 200);
    loginTrend.add(res.timings.duration);
    reqCount.add(1);

    if (res.status !== 200) {
      sleep(1);
      return;
    }
    token = res.json('token');
  });

  if (!token) return;

  const headers = authHeaders(token);

  // 2. Read endpoints (GET)
  group('Read Operations', () => {
    const readEndpoints = [
      { path: '/api/customers?limit=10', name: 'customers' },
      { path: '/api/bookings?limit=10', name: 'bookings' },
      { path: '/api/staff/members', name: 'staff' },
      { path: '/api/finance/transactions/summary', name: 'finance_summary' },
      { path: '/api/bookings/stats', name: 'booking_stats' },
      { path: '/api/client-config', name: 'client_config' },
      { path: '/api/auth/me', name: 'auth_me' },
    ];

    for (const ep of readEndpoints) {
      const res = http.get(`${BASE_URL}${ep.path}`, { headers, tags: { endpoint: ep.name } });
      check(res, { [`${ep.name} ok`]: (r) => r.status === 200 || r.status === 204 });
      errorRate.add(res.status >= 400);
      crudTrend.add(res.timings.duration);
      apiTrend.add(res.timings.duration);
      reqCount.add(1);
      sleep(0.3);
    }
  });

  // 3. Search con query params
  group('Search with Filters', () => {
    const searches = [
      '/api/customers?limit=5&search=test',
      '/api/bookings?limit=5&page=1',
      '/api/finance/transactions?limit=5',
    ];

    for (const path of searches) {
      const res = http.get(`${BASE_URL}${path}`, { headers });
      check(res, { 'search ok': (r) => r.status === 200 || r.status === 204 });
      errorRate.add(res.status >= 400);
      crudTrend.add(res.timings.duration);
      reqCount.add(1);
      sleep(0.2);
    }
  });

  // 4. Health check (no auth)
  group('Health Check', () => {
    const res = http.get(`${BASE_URL}/health`);
    check(res, {
      'health 200': (r) => r.status === 200,
      'health db ok': (r) => {
        try { return r.json('db') === 'connected'; } catch (_e) { return false; }
      },
    });
    reqCount.add(1);
  });

  sleep(1);
}
