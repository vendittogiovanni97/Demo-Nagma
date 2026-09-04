# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primario:** Il titolare del tattoo studio — apre il CRM tutto il giorno, alla scrivania o sul telefono tra un cliente e l'altro. Conosce il settore, non è un profilo tecnico. Ha bisogno di velocità operativa: prenotare, controllare chi è in studio, incassare, vedere i numeri.

**Secondari (confermati dal codice):** Artisti (ruolo ARTIST — vedono la propria agenda), staff admin (ruolo ADMIN), super admin per configurazione multi-tenant.

## Product Purpose

CRM operativo per tattoo studio che unifica in un'unica interfaccia: agenda prenotazioni, gestione clienti, finanze (incassi, acconti, quote artista, affitti postazione, spese/entrate libere), kanban del giorno, WhatsApp, form di consenso digitali e report.

Successo = il titolare chiude una giornata senza usare Excel, carta o WhatsApp manuale per nessuna operazione di studio.

## Positioning

**Tutto integrato per il modello economico dei tattoo studio.** Un foglio Excel non calcola automaticamente la quota artista, non gestisce l'acconto vs saldo, non distingue entrate da affitto postazione da entrate da sessione. Nagma CRM è costruito sul modello economico specifico del settore: quote artista configurabili per percentuale, gestione "Da Saldare" visiva nel kanban, storico finanziario per cliente.

## Operating Context

- Studio fisico con postazioni artisti e una reception (o il titolare che fa da reception)
- Uso misto desktop (gestione) e mobile/tablet (controllo rapido tra sessioni)
- Flusso tipico: nuova prenotazione → acconto → giorno dell'appuntamento (kanban) → incasso saldo → report mensile
- I clienti ricevono comunicazioni via WhatsApp; i form di consenso sono digitali
- Attuale: demo/showcase per Nagma Tattoo Studio
- Roadmap: piattaforma multi-tenant white-label per altri studi (branding via env `NEXT_PUBLIC_PORTAL_*`)

## Capabilities and Constraints

**Funzionalità confermate:**
- Agenda (calendario + kanban del giorno con drag & drop)
- Prenotazioni con acconto/saldo/quota artista
- Clienti con storico e form consenso
- Finance: transazioni, spese libere, entrate libere, affitti postazione, report
- Staff: turni, gestione ruoli, percentuali
- WhatsApp: template e invio messaggi
- Export CSV/Excel/PDF
- Config multi-tenant (logo, colori, feature flag per modulo)
- Backup database

**Vincoli tecnici:**
- Next.js 16 App Router, React 19, MUI 9 — stack fisso
- Backend Express 5 + Prisma 7 + PostgreSQL 17
- Auth via cookie httpOnly (`nagma_session`) — no token in JS
- 4 ruoli: SUPER_ADMIN, ADMIN, USER, ARTIST

**Decisioni aperte:**
- Timezone gestione multi-tenant (da risolvere prima del go-to-market)
- Report avanzati (modulo presente ma non completo)

## Brand Commitments

- Nome prodotto: **Nagma** / Nagma Tattoo CRM (configurabile per white-label)
- Estetica dark-first (tema scuro di default, light disponibile)
- Nessun asset grafico vincolante oltre al logo SVG configurabile via env

## Evidence on Hand

- Codebase completa funzionante con seed dati demo
- 21 modelli Prisma, 17 route frontend
- Suite test: Jest (backend), Playwright E2E (10 test), test sicurezza OWASP (21 test)
- AUDIT_REPORT.md presente nel repo

## Product Principles

1. **Operativo prima di tutto.** Ogni schermata serve a fare una cosa in studio, non a mostrare funzionalità.
2. **Il modello economico del tattoo studio è first-class.** Quote, acconti, saldi, affitti — non sono aggiunte, sono il cuore.
3. **White-label pronto, Nagma-first ora.** Le decisioni architetturali supportano il multi-tenant, ma l'esperienza corrente è ottimizzata per un singolo studio.
4. **Velocità operativa su profondità funzionale.** Il titolare deve poter prenotare, incassare e controllare i numeri in pochi tap.
5. **Sicurezza senza attrito.** Cookie httpOnly, revoca token, soft delete — protezioni che non rallentano il flusso quotidiano.
