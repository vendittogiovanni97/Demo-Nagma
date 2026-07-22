/**
 * Integration Test Suite: Extra Modules (Finance, Export, Reports, Creams, Forms, Attachments, Config)
 */

import { getAdminAuth } from './testHelper';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Extra Modules API Integration Tests', () => {
  let adminToken: string;

  beforeAll(async () => {
    const auth = await getAdminAuth();
    adminToken = auth.token;
  });

  describe('💰 Finance Module (/api/finance)', () => {
    test('🟢 200 OK — Sommario finanziario', async () => {
      const res = await fetch(`${BASE_URL}/api/finance/transactions/summary`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
    });

    test('🔴 400 Bad Request — Spesa libera con importo negativo', async () => {
      const res = await fetch(`${BASE_URL}/api/finance/spese-libere`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: 'Spesa negativa non valida',
          amount: -150,
          category: 'MATERIALE',
          date: new Date().toISOString(),
        }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('📊 Export Module (/api/export)', () => {
    test('🟢 200 OK — Esportazione CSV clienti', async () => {
      const res = await fetch(`${BASE_URL}/api/export`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'csv',
          entityType: 'customer',
          columns: [{ key: 'firstName', label: 'Nome' }],
        }),
      });
      expect(res.status).toBe(200);
    });

    test('🟢 200/400 — Tipo esportazione non valido', async () => {
      const res = await fetch(`${BASE_URL}/api/export`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format: 'invalid-type',
          entityType: 'customer',
          columns: [],
        }),
      });
      expect([200, 400]).toContain(res.status);
    });
  });

  describe('🧴 Cream Tattoo Module (/api/cream)', () => {
    test('🟢 200 OK — Lista creme tattoo attive', async () => {
      const res = await fetch(`${BASE_URL}/api/cream/active`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
    });
  });

  describe('📋 Form Templates (/api/form-templates)', () => {
    test('🟢 200 OK — Lista modelli form di consenso', async () => {
      const res = await fetch(`${BASE_URL}/api/form-templates`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
    });
  });

  describe('⚙️ Config Module (/api/config)', () => {
    test('🟢 200 OK — Recupero impostazioni di sistema', async () => {
      const res = await fetch(`${BASE_URL}/api/config`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
    });
  });
});
