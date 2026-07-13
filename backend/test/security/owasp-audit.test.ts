/**
 * OWASP Top 10 Security Audit — automated checks
 *
 * Testa le vulnerabilità OWASP più comuni sull'API backend.
 * Richiede: backend in esecuzione su localhost:3001
 *
 * NOTA: il rate limiter è in-memory con finestra di 15 min.
 * Il login viene fatto una sola volta e il token riutilizzato.
 * Il test del rate limiting è l'ultimo per non bloccare gli altri.
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const VALID_EMAIL = 'superadmin@nagma.it';
const VALID_PASSWORD = 'superadmin123';

let sharedToken: string;

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// Login una sola volta per tutta la suite, prima di tutto il resto
beforeAll(async () => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: VALID_EMAIL, password: VALID_PASSWORD }),
  });

  if (res.status === 429) {
    // Rate limited da un run precedente — skip gracefully
    console.warn('⚠️  Login rate limited (429). Riavvia il backend per resettare il rate limiter.');
  }

  const data = await res.json();
  sharedToken = data.token;
});

function requireToken() {
  if (!sharedToken) {
    throw new Error('Token non disponibile — probabilmente rate limited. Riavvia il backend.');
  }
}

// ─── A01: Broken Access Control ─────────────────────────────────────

describe('A01: Broken Access Control', () => {
  test('unauthenticated requests to protected endpoints return 401', async () => {
    const protectedEndpoints = [
      '/api/customers',
      '/api/bookings',
      '/api/staff/members',
      '/api/finance/transactions/summary',
      '/api/auth/me',
      '/api/client-config',
    ];

    for (const ep of protectedEndpoints) {
      const res = await fetch(`${BASE_URL}${ep}`);
      expect(res.status).toBe(401);
    }
  });

  test('invalid JWT token returns 401', async () => {
    const res = await fetch(`${BASE_URL}/api/customers`, {
      headers: { Authorization: 'Bearer invalid.token.here' },
    });
    expect(res.status).toBe(401);
  });

  test('expired/malformed tokens are rejected', async () => {
    const fakeTokens = [
      'Bearer ',
      'Bearer null',
      'Bearer undefined',
      'NotBearer sometoken',
      '',
    ];

    for (const header of fakeTokens) {
      const res = await fetch(`${BASE_URL}/api/customers`, {
        headers: { Authorization: header },
      });
      expect(res.status).toBe(401);
    }
  });

  test('superadmin can access admin-only endpoints', async () => {
    requireToken();
    const res = await fetch(`${BASE_URL}/api/finance/transactions/history`, {
      headers: authHeaders(sharedToken),
    });
    expect([200, 204]).toContain(res.status);
  });
});

// ─── A02: Cryptographic Failures ────────────────────────────────────

describe('A02: Cryptographic Failures', () => {
  test('auth/me does not expose password hash', async () => {
    requireToken();
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: authHeaders(sharedToken),
    });
    const body = await res.text();

    expect(body).not.toContain('$2a$'); // bcrypt hash prefix
    expect(body).not.toContain('$2b$');
    expect(body.toLowerCase()).not.toMatch(/"password"\s*:/);
  });

  test('health endpoint does not expose connection strings', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const body = await res.text();

    expect(body).not.toContain('postgresql://');
    expect(body).not.toContain('DATABASE_URL');
    expect(body).not.toContain('JWT_SECRET');
  });
});

// ─── A03: Injection ─────────────────────────────────────────────────

describe('A03: Injection', () => {
  test('SQL injection in search parameters is neutralized', async () => {
    requireToken();
    const sqliPayloads = [
      "'; DROP TABLE users; --",
      "1 OR 1=1",
      "' UNION SELECT * FROM pg_tables --",
      "1'; EXEC xp_cmdshell('whoami')--",
    ];

    for (const payload of sqliPayloads) {
      const res = await fetch(
        `${BASE_URL}/api/customers?search=${encodeURIComponent(payload)}&limit=5`,
        { headers: authHeaders(sharedToken) },
      );
      expect(res.status).not.toBe(500);
    }
  });

  test('NoSQL/JSON injection in login body is handled', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: { $gt: '' },
        password: { $gt: '' },
      }),
    });
    expect(res.status).not.toBe(200);
  });

  test('XSS payloads in search are not reflected as raw HTML', async () => {
    requireToken();
    const xssPayloads = [
      '<script>alert("xss")</script>',
      '<img src=x onerror=alert(1)>',
      '"><svg onload=alert(1)>',
    ];

    for (const payload of xssPayloads) {
      const res = await fetch(
        `${BASE_URL}/api/customers?search=${encodeURIComponent(payload)}&limit=5`,
        { headers: authHeaders(sharedToken) },
      );
      const body = await res.text();
      expect(body).not.toContain('<script>');
    }
  });
});

// ─── A04: Insecure Design ───────────────────────────────────────────

describe('A04: Insecure Design', () => {
  test('login does not reveal whether email exists (anti-enumeration)', async () => {
    const nonExistentRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent999@example.com', password: 'wrongpassword123' }),
    });

    const wrongPasswordRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: VALID_EMAIL, password: 'definitelywrongpassword' }),
    });

    // Both should return the same status code (no user enumeration)
    // 401 normally, 429 if rate limited — either way, they should match
    expect(nonExistentRes.status).toBe(wrongPasswordRes.status);
  });
});

// ─── A05: Security Misconfiguration ─────────────────────────────────

describe('A05: Security Misconfiguration', () => {
  test('security headers are present (Helmet)', async () => {
    const res = await fetch(`${BASE_URL}/health`);

    expect(res.headers.get('x-content-type-options')).toBe('nosniff');
    expect(res.headers.get('x-frame-options')).toBeTruthy();
  });

  test('server does not expose technology stack', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    expect(res.headers.get('x-powered-by')).toBeNull();
  });

  test('non-existent routes return 404 without stack traces', async () => {
    const res = await fetch(`${BASE_URL}/api/nonexistent-route-xyz`);
    const body = await res.text();

    expect(res.status).toBe(404);
    expect(body).not.toContain('node_modules');
    expect(body).not.toContain('at Object.');
  });

  test('malformed JSON returns 400, not 500', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{invalid json content',
    });
    expect(res.status).toBe(400);
  });

  test('oversized payload is rejected (not 200)', async () => {
    const largeBody = JSON.stringify({ data: 'x'.repeat(2 * 1024 * 1024) });
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: largeBody,
    });
    expect(res.status).not.toBe(200);
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});

// ─── A07: Identification and Authentication Failures ────────────────

describe('A07: Identification and Authentication Failures', () => {
  test('JWT is 3 dot-separated base64 segments', async () => {
    requireToken();
    const parts = sharedToken.split('.');
    expect(parts).toHaveLength(3);
  });

  test('empty credentials are rejected', async () => {
    const testCases = [
      { email: '', password: '' },
      { email: VALID_EMAIL, password: '' },
      { email: '', password: VALID_PASSWORD },
    ];

    for (const creds of testCases) {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      expect(res.status).not.toBe(200);
    }
  });
});

// ─── A08: Software and Data Integrity ───────────────────────────────

describe('A08: Software and Data Integrity', () => {
  test('API rejects non-JSON Content-Type for JSON endpoints', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ email: VALID_EMAIL, password: VALID_PASSWORD }),
    });
    expect(res.status).not.toBe(200);
  });
});

// ─── A09: Security Logging and Monitoring ───────────────────────────

describe('A09: Security Logging and Monitoring', () => {
  test('error responses have consistent structure and no internals', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'attacker@evil.com', password: 'bruteforce' }),
    });

    // 401 (bad creds) or 429 (rate limited) — both are acceptable security responses
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);

    const data = await res.json();
    expect(data).toHaveProperty('message');
    // No stack traces or internal paths
    const body = JSON.stringify(data);
    expect(body).not.toContain('at Object.');
    expect(body).not.toContain('node_modules');
  });
});

// ─── A10: SSRF Prevention ───────────────────────────────────────────

describe('A10: SSRF Prevention', () => {
  test('URL-like values in search are not fetched server-side', async () => {
    requireToken();
    const ssrfPayloads = [
      'http://169.254.169.254/latest/meta-data/',
      'http://localhost:22',
      'file:///etc/passwd',
    ];

    for (const payload of ssrfPayloads) {
      const res = await fetch(
        `${BASE_URL}/api/customers?search=${encodeURIComponent(payload)}&limit=5`,
        { headers: authHeaders(sharedToken) },
      );
      expect(res.status).toBeLessThan(500);
    }
  });
});

// ─── Rate Limiting (LAST — innesca 429 su IP di test) ───────────────

describe('Rate Limiting (run last)', () => {
  test('login rate limiting activates after repeated failures', async () => {
    const attempts: number[] = [];

    for (let i = 0; i < 8; i++) {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'brute@force.test', password: 'wrong' }),
      });
      attempts.push(res.status);
    }

    const rateLimited = attempts.some((s) => s === 429);
    expect(rateLimited).toBe(true);
  });
});
