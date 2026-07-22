/**
 * Integration Test Suite: Auth API Module (/api/auth)
 */

import { getAdminAuth } from './testHelper';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Auth API Integration Tests (/api/auth)', () => {
  let adminToken: string;

  beforeAll(async () => {
    const auth = await getAdminAuth();
    adminToken = auth.token;
  });

  describe('GET /api/auth/me (Chiamata Autenticata con JWT Valido)', () => {
    test('🟢 200 OK — Profilo dell utente autenticato', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      console.log('✅ Risposta API /api/auth/me con JWT valido:', { email: data.email, role: data.role });
      expect(data.email).toBe('superadmin@nagma.it');
      expect(data.password).toBeUndefined();
    });

    test('🔒 401 Unauthorized — Test di sicurezza senza token', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/me`);
      expect(res.status).toBe(401);
    });
  });

  describe('PUT /api/auth/me/password', () => {
    test('🔴 400 Bad Request — Vecchia password errata', async () => {
      const res = await fetch(`${BASE_URL}/api/auth/me/password`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ oldPassword: 'wrongOldPassword', newPassword: 'newPassword123!' }),
      });
      expect(res.status).toBe(400);
    });
  });
});
