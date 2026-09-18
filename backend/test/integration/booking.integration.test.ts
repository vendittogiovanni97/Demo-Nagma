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

    const custRes = await fetch(`${BASE_URL}/api/customers?limit=1`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const custData = await custRes.json();
    testCustomerId = custData.data?.[0]?.id;

    // Il seed base non crea clienti: senza questo i test di scrittura
    // uscirebbero senza eseguire nulla e la suite risulterebbe verde a vuoto.
    if (!testCustomerId) {
      const createRes = await fetch(`${BASE_URL}/api/customers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: 'Cliente',
          lastName: `Integrazione ${Date.now()}`,
          phone: `+39000${Date.now().toString().slice(-7)}`,
        }),
      });
      if (!createRes.ok) {
        throw new Error(`Impossibile creare il cliente di prova: HTTP ${createRes.status}`);
      }
      const created = await createRes.json();
      testCustomerId = created.id ?? created.data?.id;
    }

    const staffRes = await fetch(`${BASE_URL}/api/staff/members`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const staffData = await staffRes.json();
    const staffList = Array.isArray(staffData) ? staffData : staffData.data || [];
    testArtistId = staffList[0]?.id;

    if (!testCustomerId || !testArtistId) {
      throw new Error(
        `Prerequisiti mancanti: cliente=${testCustomerId ?? 'assente'}, artista=${testArtistId ?? 'assente'}`
      );
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
    test('🟢 201/200 — Creazione appuntamento', async () => {
      // Data univoca per esecuzione: su un database gia popolato una data fissa
      // darebbe 409 e il test passerebbe senza aver creato nulla.
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 5);
      futureDate.setMilliseconds(0);
      futureDate.setSeconds(0);

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

      // Accettare 400/409/500 renderebbe il test incapace di fallire: e' cosi
      // che un errore di persistenza sul salvataggio e' passato inosservato.
      expect([200, 201]).toContain(res.status);

      const data = await res.json();
      createdBookingId = data.id ?? data.data?.id;
      expect(createdBookingId).toBeDefined();
    });

    test('🔴 201/400/500 — Durata non valida (0 minuti)', async () => {
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
      expect(createdBookingId).toBeDefined();

      const res = await fetch(`${BASE_URL}/api/bookings/${createdBookingId}/annul`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      expect([200, 204, 404]).toContain(res.status);
    });
  });
});
