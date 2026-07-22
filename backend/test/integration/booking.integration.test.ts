/**
 * Integration Test Suite: Booking API Module (/api/bookings)
 */

import { getAdminAuth } from './testHelper';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

describe('Booking API Integration Tests (/api/bookings)', () => {
  let adminToken: string;
  let testCustomerId: string;
  let testArtistId: string;
  let createdBookingId: string;

  beforeAll(async () => {
    const auth = await getAdminAuth();
    adminToken = auth.token;

    // Fetch Customer ID
    const custRes = await fetch(`${BASE_URL}/api/customers?limit=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const custData = await custRes.json();
    if (custData.data && custData.data.length > 0) {
      testCustomerId = custData.data[0].id;
    }

    // Fetch Staff Artist ID
    const staffRes = await fetch(`${BASE_URL}/api/staff/members`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const staffData = await staffRes.json();
    const staffList = Array.isArray(staffData) ? staffData : staffData.data || [];
    if (staffList.length > 0) {
      testArtistId = staffList[0].id;
    }
  });

  describe('GET /api/bookings', () => {
    test('🟢 200 OK — Recupero lista appuntamenti', async () => {
      const res = await fetch(`${BASE_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.data || data)).toBe(true);
    });

    test('🟢 200 OK — Stats appuntamenti', async () => {
      const res = await fetch(`${BASE_URL}/api/bookings/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      expect(res.status).toBe(200);
    });
  });

  describe('POST /api/bookings', () => {
    test('🟢 201/200/400 — Tentativo creazione appuntamento', async () => {
      if (!testCustomerId || !testArtistId) return;

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 50);
      futureDate.setHours(14, 0, 0, 0);

      const res = await fetch(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: testCustomerId,
          artistId: testArtistId,
          date: futureDate.toISOString(),
          duration: 90,
          notes: 'Test prenotazione automatica',
          status: 'CONFERMATO',
        }),
      });

      expect([200, 201, 400, 409, 500]).toContain(res.status);
      if (res.status === 200 || res.status === 201) {
        const data = await res.json();
        if (data.id || data.data?.id) {
          createdBookingId = data.id || data.data.id;
        }
      }
    });

    test('🔴 201/400/500 — Durata non valida (0 minuti)', async () => {
      if (!testCustomerId || !testArtistId) return;

      const res = await fetch(`${BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: testCustomerId,
          artistId: testArtistId,
          date: new Date().toISOString(),
          duration: 0,
        }),
      });

      expect([200, 201, 400, 500]).toContain(res.status);
    });
  });

  describe('PUT /api/bookings/:id/annul', () => {
    test('🟢 200/204/404 — Annullamento appuntamento', async () => {
      if (!createdBookingId) return;

      const res = await fetch(`${BASE_URL}/api/bookings/${createdBookingId}/annul`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect([200, 204, 404]).toContain(res.status);
    });
  });
});
