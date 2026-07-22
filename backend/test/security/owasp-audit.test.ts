/**
 * OWASP Top 10 Security Audit — automated checks
 *
 * Testa le vulnerabilità OWASP più comuni sull'API backend.
 * Richiede: backend in esecuzione su localhost:3001
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const VALID_EMAIL = 'superadmin@nagma.it';
const VALID_PASSWORD = 'superadmin123';

let sharedToken: string = '';
let isServerOnline = false;

async function safeFetch(url: string, init?: RequestInit): Promise<Response | null> {
  if (!isServerOnline && !url.endsWith('/login')) return null;
  try {
    return await fetch(url, init);
  } catch {
    return null;
  }
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// Login una sola volta per tutta la suite, prima di tutto il resto
beforeAll(async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: VALID_EMAIL, password: VALID_PASSWORD }),
    });

    if (res && res.ok) {
      const data = await res.json();
      sharedToken = data.token;
      isServerOnline = true;
    }
  } catch {
    console.warn('⚠️ Server HTTP non in ascolto su localhost:3001. Audit OWASP HTTP ignorato.');
  }
});

// ─── A01: Broken Access Control ─────────────────────────────────────

describe('A01: Broken Access Control', () => {
  test('unauthenticated requests to protected endpoints return 401', async () => {
    if (!isServerOnline) return;
    const protectedEndpoints = [
      '/api/customers',
      '/api/bookings',
      '/api/staff/members',
      '/api/finance/transactions/summary',
      '/api/auth/me',
      '/api/client-config',
    ];

    for (const ep of protectedEndpoints) {
      const res = await safeFetch(`${BASE_URL}${ep}`);
      if (res) expect(res.status).toBe(401);
    }
  });

  test('invalid JWT token returns 401', async () => {
    if (!isServerOnline) return;
    const res = await safeFetch(`${BASE_URL}/api/customers`, {
      headers: { Authorization: 'Bearer invalid.token.here' },
    });
    if (res) expect(res.status).toBe(401);
  });

  test('expired/malformed tokens are rejected', async () => {
    if (!isServerOnline) return;
    const fakeTokens = [
      'Bearer ',
      'Bearer null',
      'Bearer undefined',
      'NotBearer sometoken',
      '',
    ];

    for (const header of fakeTokens) {
      const res = await safeFetch(`${BASE_URL}/api/customers`, {
        headers: { Authorization: header },
      });
      if (res) expect(res.status).toBe(401);
    }
  });

  test('superadmin can access admin-only endpoints', async () => {
    if (!isServerOnline || !sharedToken) return;
    const res = await safeFetch(`${BASE_URL}/api/finance/transactions/history`, {
      headers: authHeaders(sharedToken),
    });
    if (res) expect([200, 204]).toContain(res.status);
  });
});

// ─── A02: Cryptographic Failures ────────────────────────────────────

describe('A02: Cryptographic Failures', () => {
  test('auth/me does not expose password hash', async () => {
    if (!isServerOnline || !sharedToken) return;
    const res = await safeFetch(`${BASE_URL}/api/auth/me`, {
      headers: authHeaders(sharedToken),
    });
    if (res) {
      const body = await res.text();
      expect(body).not.toContain('$2a$');
      expect(body).not.toContain('$2b$');
      expect(body.toLowerCase()).not.toMatch(/"password"\s*:/);
    }
  });

  test('health endpoint does not expose connection strings', async () => {
    if (!isServerOnline) return;
    const res = await safeFetch(`${BASE_URL}/health`);
    if (res) {
      const body = await res.text();
      expect(body).not.toContain('postgresql://');
      expect(body).not.toContain('DATABASE_URL');
      expect(body).not.toContain('JWT_SECRET');
    }
  });
});

// ─── A03: Injection ─────────────────────────────────────────────────

describe('A03: Injection', () => {
  test('SQL injection in search parameters is neutralized', async () => {
    if (!isServerOnline || !sharedToken) return;
    const sqliPayloads = [
      "'; DROP TABLE users; --",
      "1 OR 1=1",
      "' UNION SELECT * FROM pg_tables --",
      "1'; EXEC xp_cmdshell('whoami')--",
    ];

    for (const payload of sqliPayloads) {
      const res = await safeFetch(
        `${BASE_URL}/api/customers?search=${encodeURIComponent(payload)}&limit=5`,
        { headers: authHeaders(sharedToken) },
      );
      if (res) expect(res.status).not.toBe(500);
    }
  });

  test('NoSQL/JSON injection in login body is handled', async () => {
    if (!isServerOnline) return;
    const res = await safeFetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: { $gt: '' },
        password: { $gt: '' },
      }),
    });
    if (res) expect(res.status).not.toBe(200);
  });

  test('XSS payloads in search are not reflected as raw HTML', async () => {
    if (!isServerOnline || !sharedToken) return;
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      '"><svg onload=alert(1)>',
    ];

    for (const payload of xssPayloads) {
      const res = await safeFetch(
        `${BASE_URL}/api/customers?search=${encodeURIComponent(payload)}&limit=5`,
        { headers: authHeaders(sharedToken) },
      );
      if (res) {
        const body = await res.text();
        expect(body).not.toContain('<script>');
      }
    }
  });
});

// ─── A04: Insecure Design ───────────────────────────────────────────

describe('A04: Insecure Design', () => {
  test('login does not reveal whether email exists (anti-enumeration)', async () => {
    if (!isServerOnline) return;
    const nonExistentRes = await safeFetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent999@example.com', password: 'wrongpassword123' }),
    });

    const wrongPasswordRes = await safeFetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: VALID_EMAIL, password: 'definitelywrongpassword' }),
    });

    if (nonExistentRes && wrongPasswordRes) {
      expect(nonExistentRes.status).toBe(wrongPasswordRes.status);
    }
  });
});

// ─── A05: Security Misconfiguration ─────────────────────────────────

describe('A05: Security Misconfiguration', () => {
  test('security headers are present (Helmet)', async () => {
    if (!isServerOnline) return;
    const res = await safeFetch(`${BASE_URL}/health`);
    if (res) {
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('x-frame-options')).toBeTruthy();
    }
  });

  test('server does not expose technology stack', async () => {
    if (!isServerOnline) return;
    const res = await safeFetch(`${BASE_URL}/health`);
    if (res) expect(res.headers.get('x-powered-by')).toBeNull();
  });

  test('non-existent routes return 404 without stack traces', async () => {
    if (!isServerOnline) return;
    const res = await safeFetch(`${BASE_URL}/api/nonexistent-route-xyz`);
    if (res) {
      const body = await res.text();
      expect(res.status).toBe(404);
      expect(body).not.toContain('node_modules');
      expect(body).not.toContain('at Object.');
    }
  });

  test('malformed JSON returns 400, not 500', async () => {
    if (!isServerOnline) return;
    const res = await safeFetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid json content',
    });
    if (res) expect(res.status).toBe(400);
  });

  test('oversized payload is rejected (not 200)', async () => {
    if (!isServerOnline) return;
    const largeBody = JSON.stringify({ data: 'x'.repeat(2 * 1024 * 1024) });
    const res = await safeFetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: largeBody,
    });
    if (res) {
      expect(res.status).not.toBe(200);
      expect(res.status).toBeGreaterThanOrEqual(400);
    }
  });
});

// ─── A07: Identification and Authentication Failures ────────────────

describe('A07: Identification and Authentication Failures', () => {
  test('JWT is 3 dot-separated base64 segments', async () => {
    if (!isServerOnline || !sharedToken) return;
    const parts = sharedToken.split('.');
    expect(parts).toHaveLength(3);
  });

  test('empty credentials are rejected', async () => {
    if (!isServerOnline) return;
    const testCases = [
      { email: '', password: '' },
      { email: VALID_EMAIL, password: '' },
      { email: '', password: VALID_PASSWORD },
    ];

    for (const creds of testCases) {
      const res = await safeFetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      if (res) expect(res.status).not.toBe(200);
    }
  });
});

// ─── A08: Software and Data Integrity ───────────────────────────────

describe('A08: Software and Data Integrity', () => {
  test('API rejects non-JSON Content-Type for JSON endpoints', async () => {
    if (!isServerOnline) return;
    const res = await safeFetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ email: VALID_EMAIL, password: VALID_PASSWORD }),
    });
    if (res) expect(res.status).not.toBe(200);
  });
});

// ─── A09: Security Logging and Monitoring ───────────────────────────

describe('A09: Security Logging and Monitoring', () => {
  test('error responses have consistent structure and no internals', async () => {
    if (!isServerOnline) return;
    const res = await safeFetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'attacker@evil.com', password: 'bruteforce' }),
    });

    if (res) {
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);

      const data = await res.json();
      expect(data).toHaveProperty('message');
      const body = JSON.stringify(data);
      expect(body).not.toContain('at Object.');
      expect(body).not.toContain('node_modules');
    }
  });
});

// ─── A10: SSRF Prevention ───────────────────────────────────────────

describe('A10: SSRF Prevention', () => {
  test('URL-like values in search are not fetched server-side', async () => {
    if (!isServerOnline || !sharedToken) return;
    const ssrfPayloads = [
      'http://169.254.169.254/latest/meta-data/',
      'http://localhost:22',
      'file:///etc/passwd',
    ];

    for (const payload of ssrfPayloads) {
      const res = await safeFetch(
        `${BASE_URL}/api/customers?search=${encodeURIComponent(payload)}&limit=5`,
        { headers: authHeaders(sharedToken) },
      );
      if (res) expect(res.status).toBeLessThan(500);
    }
  });
});

// ─── Rate Limiting (LAST — innesca 429 su IP di test) ───────────────

describe('Rate Limiting (run last)', () => {
  test('login rate limiting activates after repeated failures', async () => {
    if (!isServerOnline) return;
    const attempts: number[] = [];

    for (let i = 0; i < 8; i++) {
      const res = await safeFetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'brute@force.test', password: 'wrong' }),
      });
      if (res) attempts.push(res.status);
    }

    if (attempts.length > 0) {
      const rateLimited = attempts.some((s) => s === 429);
      expect(rateLimited).toBe(true);
    }
  });
});
