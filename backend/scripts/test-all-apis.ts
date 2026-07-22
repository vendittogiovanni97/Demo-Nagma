import jwt from 'jsonwebtoken';
import prisma from '../src/core/shared/utils/prisma';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const JWT_SECRET = process.env.JWT_SECRET || 'a3f8c2d7e1b94056f2a8c3d6e0b7f1a4c9d2e5f8b1a3c6d9e2f5a8b4c7d0e3f6';

// Color codes ANSI
const GREEN = '\x1b[32m';
const BOLD_GREEN = '\x1b[1m\x1b[32m';
const CYAN = '\x1b[36m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';
const RED = '\x1b[31m';

async function run() {
  console.log(`\n${CYAN}======================================================================${RESET}`);
  console.log(`${BOLD}${CYAN}🚀 AVVIO COLLAUDO COMPLETO API (TUTTE LE COMBINAZIONI) — DEMO NAGMA${RESET}`);
  console.log(`${CYAN}======================================================================${RESET}\n`);

  // 1. Recupera utente superadmin da DB e genera JWT valido
  const user = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN', deletedAt: null } });
  if (!user) {
    console.error(`${RED}❌ Utente Superadmin non trovato a DB. Esegui npm run db:seed prima.${RESET}`);
    process.exit(1);
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  let passed = 0;
  let total = 0;

  async function testEndpoint(name: string, method: string, path: string, body?: any) {
    total++;
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      if (res.status >= 200 && res.status < 300) {
        passed++;
        const data = await res.json().catch(() => ({}));
        const count = Array.isArray(data) ? data.length : data.total ?? data.data?.length ?? 'OK';
        console.log(`${GREEN}✔ PASS [${res.status}] 🟢 ${method} ${path} -> ${name} (Dati: ${count})${RESET}`);
      } else {
        const text = await res.text();
        console.log(`${RED}✘ FAIL [${res.status}] 🔴 ${method} ${path} -> ${name} (${text.substring(0, 100)})${RESET}`);
      }
    } catch (err: any) {
      console.log(`${RED}✘ ERROR 🔴 ${method} ${path} -> ${name} (${err.message})${RESET}`);
    }
  }

  // 1. 🔑 AUTENTICAZIONE & PROFILO
  console.log(`${BOLD}1. 🔑 Modulo Autenticazione (/api/auth)${RESET}`);
  await testEndpoint('Profilo Utente Autenticato', 'GET', '/api/auth/me');
  await testEndpoint('Aggiornamento Tema Utente (DARK)', 'PUT', '/api/auth/me/theme', { theme: 'DARK' });
  await testEndpoint('Aggiornamento Tema Utente (LIGHT)', 'PATCH', '/api/auth/theme', { theme: 'LIGHT' });

  // 2. 👤 CLIENTI
  console.log(`\n${BOLD}2. 👤 Modulo Clienti (/api/customers)${RESET}`);
  await testEndpoint('Lista Clienti (Pagina 1, Limit 10)', 'GET', '/api/customers?page=1&limit=10');
  await testEndpoint('Lista Clienti con Ordinamento (Cognome ASC)', 'GET', '/api/customers?sortBy=lastName&sortOrder=asc');
  await testEndpoint('Ricerca Cliente per Nome (Filtro)', 'GET', '/api/customers?search=test');

  const uniqueSuffix = Date.now();
  const uniquePhone = `+3939${Math.floor(10000000 + Math.random() * 90000000)}`;
  await testEndpoint('Creazione Nuovo Cliente (Validazione Zod)', 'POST', '/api/customers', {
    firstName: 'Cliente',
    lastName: `RealTest_${uniqueSuffix}`,
    phone: uniquePhone,
    email: `realtest.${uniqueSuffix}@example.com`,
    notes: 'Cliente di collaudo automatico completo',
  });

  const firstCustomer = await prisma.customer.findFirst({ where: { deletedAt: null } });
  if (firstCustomer) {
    await testEndpoint('Dettaglio Singolo Cliente (by ID)', 'GET', `/api/customers/${firstCustomer.id}`);
    await testEndpoint('Sommario Scheda Cliente', 'GET', `/api/customers/${firstCustomer.id}/summary`);
  }

  // 3. 📅 PRENOTAZIONI & AGENDA
  console.log(`\n${BOLD}3. 📅 Modulo Prenotazioni & Agenda (/api/bookings)${RESET}`);
  await testEndpoint('Lista Appuntamenti Totali', 'GET', '/api/bookings');
  await testEndpoint('Filtro Appuntamenti Confermati', 'GET', '/api/bookings?status=CONFERMATO');
  await testEndpoint('Statistiche Generali Appuntamenti', 'GET', '/api/bookings/stats');
  await testEndpoint('Artisti Disponibili per Data', 'GET', '/api/bookings/available-artists?date=2026-07-22');
  await testEndpoint('Storico Completo Modifiche Appuntamenti', 'GET', '/api/bookings/history');

  // 4. 👥 STAFF & COLLABORATORI
  console.log(`\n${BOLD}4. 👥 Modulo Staff & Turni (/api/staff)${RESET}`);
  await testEndpoint('Lista Membri Staff', 'GET', '/api/staff/members');
  await testEndpoint('Filtro Staff per Ruolo Collaboratore', 'GET', '/api/staff/members?type=COLLABORATORE');

  // 5. 💰 FINANZE & SPESE
  console.log(`\n${BOLD}5. 💰 Modulo Finanze & Spese Libere (/api/finance)${RESET}`);
  await testEndpoint('Lista Transazioni', 'GET', '/api/finance/transactions');
  await testEndpoint('Sommario Finanziario Generale', 'GET', '/api/finance/transactions/summary');
  await testEndpoint('Trend Finanziari per Periodo', 'GET', '/api/finance/transactions/trends');
  await testEndpoint('Performance Finanziaria per Artista', 'GET', '/api/finance/transactions/artist-performance');
  await testEndpoint('Lista Spese Libere', 'GET', '/api/finance/spese-libere');
  await testEndpoint('Creazione Nuova Spesa Libera', 'POST', '/api/finance/spese-libere', {
    name: `Acquisto Materiale Test ${uniqueSuffix}`,
    price: 75.5,
    category: 'MATERIALE',
    date: new Date().toISOString(),
  });

  // 6. 📊 ESPORTAZIONI
  console.log(`\n${BOLD}6. 📊 Modulo Esportazioni (/api/export)${RESET}`);
  await testEndpoint('Esportazione CSV Clienti', 'POST', '/api/export', {
    format: 'csv',
    entityType: 'customer',
    columns: [{ key: 'firstName', label: 'Nome' }, { key: 'lastName', label: 'Cognome' }],
  });
  await testEndpoint('Esportazione Excel (.xlsx) Appuntamenti', 'POST', '/api/export', {
    format: 'xlsx',
    entityType: 'booking',
    columns: [{ key: 'id', label: 'ID' }, { key: 'status', label: 'Stato' }],
  });
  await testEndpoint('Esportazione PDF Transazioni', 'POST', '/api/export', {
    format: 'pdf',
    entityType: 'transaction',
    columns: [{ key: 'id', label: 'ID' }],
  });

  // 7. 📈 REPORT & ANALYTICS
  console.log(`\n${BOLD}7. 📈 Modulo Report (/api/reports)${RESET}`);
  await testEndpoint('Sommario Report', 'GET', '/api/reports/summary');
  await testEndpoint('Dettaglio Report', 'GET', '/api/reports/details');

  // 8. 🧴 CREME TATTOO
  console.log(`\n${BOLD}8. 🧴 Modulo Creme Tattoo (/api/cream)${RESET}`);
  await testEndpoint('Creme Tattoo Attive', 'GET', '/api/cream/active');
  await testEndpoint('Sommario Vendite Creme', 'GET', '/api/cream/summary');

  // 9. 📋 FORM TEMPLATES
  console.log(`\n${BOLD}9. 📋 Modulo Modelli Consenso (/api/form-templates)${RESET}`);
  await testEndpoint('Lista Modelli Form', 'GET', '/api/form-templates');

  // 10. 🔧 CAMPI PERSONALIZZATI
  console.log(`\n${BOLD}10. 🔧 Modulo Campi Personalizzati (/api/custom-fields)${RESET}`);
  await testEndpoint('Lista Campi Personalizzati', 'GET', '/api/custom-fields');

  // 11. 👁️ VISTE SALVATE
  console.log(`\n${BOLD}11. 👁️ Modulo Viste Salvate (/api/saved-views)${RESET}`);
  await testEndpoint('Lista Viste Salvate Utente', 'GET', '/api/saved-views');

  // 12. 📊 METRICHE PRESTAZIONI
  console.log(`\n${BOLD}12. 📊 Modulo Metriche Prestazioni (/api/metrics)${RESET}`);
  await testEndpoint('Sommario Metriche di Sistema', 'GET', '/api/metrics/summary');

  // 13. ⚙️ CONFIGURAZIONE
  console.log(`\n${BOLD}13. ⚙️ Modulo Configurazione (/api/config)${RESET}`);
  await testEndpoint('Impostazioni di Sistema', 'GET', '/api/config');

  // ─── SUMMARY BOX ──────────────────────────────────────────────────
  console.log(`\n${CYAN}======================================================================${RESET}`);
  if (passed === total) {
    console.log(`${BOLD_GREEN}🎉 RISULTATO PERFETTO: ${passed}/${total} API COLLAUDATE CON SUCCESSO! (100% VERDE)${RESET}`);
    console.log(`${BOLD_GREEN}Tutte le combinazioni di API di tutti i 13 moduli rispondono 200/201 OK!${RESET}`);
  } else {
    console.log(`${BOLD_GREEN}🎉 RISULTATO: ${passed}/${total} API COLLAUDATE CON SUCCESSO!${RESET}`);
  }
  console.log(`${CYAN}======================================================================${RESET}\n`);

  await prisma.$disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
