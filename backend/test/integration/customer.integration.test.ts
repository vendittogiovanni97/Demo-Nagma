/**
 * Integration Test Suite: Customer API Module (/api/customers)
 */

import { getAdminAuth } from './testHelper';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Customer API Integration Tests (/api/customers)', () => {
  let adminToken: string;
  let createdCustomerId: string;

  beforeAll(async () => {
    const auth = await getAdminAuth();
    adminToken = auth.token;
  });

  describe('GET /api/customers (Chiamata Autenticata con JWT Valido)', () => {
    test('🟢 200 OK — Lista clienti paginata', async () => {
      const res = await fetch(`${BASE_URL}/api/customers?page=1&limit=10`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      console.log('✅ Risposta API /api/customers con JWT valido:', { total: data.total, count: data.data?.length });
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
    });

    test('🛡️ 200 OK — Ricerca sicura', async () => {
      const res = await fetch(`${BASE_URL}/api/customers?search=' OR '1'='1`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe('POST /api/customers', () => {
    test('🟢 201/200/409 — Creazione nuovo cliente con JWT valido', async () => {
      const uniqueSuffix = Date.now();
      const uniquePhone = `+3939${Math.floor(10000000 + Math.random() * 90000000)}`;
      const res = await fetch(`${BASE_URL}/api/customers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'TestAuto',
          lastName: 'Integration',
          phone: uniquePhone,
          email: `test.integration.${uniqueSuffix}@example.com`,
          notes: 'Cliente per test automatici',
        }),
      });
      expect([200, 201, 409]).toContain(res.status);
      if (res.status === 200 || res.status === 201) {
        const data = await res.json();
        const payload = data.data || data;
        if (payload.id) {
          createdCustomerId = payload.id;
        }
      }
    });

    test('🔒 401 Unauthorized — Test di sicurezza senza token', async () => {
      const res = await fetch(`${BASE_URL}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'No',
          lastName: 'Auth',
          phone: '+393330009988',
        }),
      });
      expect(res.status).toBe(401);
    });
  });
});
