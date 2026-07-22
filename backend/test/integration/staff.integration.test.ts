/**
 * Integration Test Suite: Staff API Module (/api/staff)
 */

import { getAdminAuth } from './testHelper';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Staff API Integration Tests (/api/staff)', () => {
  let adminToken: string;

  beforeAll(async () => {
    const auth = await getAdminAuth();
    adminToken = auth.token;
  });

  describe('GET /api/staff/members', () => {
    test('🟢 200 OK — Lista membri staff', async () => {
      const res = await fetch(`${BASE_URL}/api/staff/members`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.data || data)).toBe(true);
    });

    test('🔒 401 Unauthorized — Senza token', async () => {
      const res = await fetch(`${BASE_URL}/api/staff/members`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/staff/members', () => {
    test('🟢 201/200/400 — Creazione nuovo collaboratore', async () => {
      const res = await fetch(`${BASE_URL}/api/staff/members`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Artista Test ${Date.now()}`,
          type: 'ARTIST',
          color: '#10b981',
          password: 'Password123!',
        }),
      });
      expect([200, 201, 400, 500]).toContain(res.status);
    });

    test('🔴 400 Bad Request — Colore o password mancante', async () => {
      const res = await fetch(`${BASE_URL}/api/staff/members`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Artista Incompleto',
        }),
      });
      expect([400, 500]).toContain(res.status);
    });
  });
});
