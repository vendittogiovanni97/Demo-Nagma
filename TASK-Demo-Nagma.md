# TASK STRATEGICI - Demo-Nagma

## 📊 ANALISI PROGETTO

**Moduli Attuali:**
- Frontend: 25+ route modules, app routing, common (shared hooks/utilities), 20+ feature modules
- Backend: 16+ feature modules, core (auth, middleware, db), consolidated routes

**Tech Stack:**
- Frontend: React 19 + MUI + AG-Grid + React Router 7
- Backend: Express 5 + Mongoose (MongoDB)
- Testing: Vitest (frontend), Jest (backend)
- Design: MUI components, AG-Grid for tables

**Gap Identificati:**
- ❌ Nessun "Dark Mode" support
- ❌ Nessun "Export Functionality" (PDF, Excel, CSV)
- ❌ Nessun sistema di "Favorites/Bookmarks"
- ❌ Nessun "Advanced Filtering" e "Saved Views"
- ❌ Nessun "User Preferences" persistito
- ❌ Nessun "Pagination Consistency" standardizzato
- ❌ Nessun "Mobile Responsiveness" optimization
- ❌ Nessun "Performance Monitoring" / Analytics

---

## 🎯 MODULO REPORTS - Generazione Report, Aggregazioni & Export (Fatto)

**Stato:** ✅ **(Fatto)**  
**Priorità:** ALTA  

**Descrizione:**
Modulo completo di Reportistica & Analytics end-to-end con aggregazioni backend Prisma (ricavi, appuntamenti, clienti, staff), esportazione CSV/PDF e visualizzazione dati frontend con carte KPI e griglia AG-Grid paginata.

### Componenti Implementati:
- **Backend (`backend/src/modules/reports/`)**:
  - `types/reports.types.ts`: DTO per filtri, aggregazioni e paginazione.
  - `services/reports.service.ts`: Aggregazioni Prisma e generazione PDF/CSV via PDFKit.
  - `controllers/reports.controller.ts`: Endpoint `/summary`, `/details`, `/export`.
  - `routes/reports.routes.ts`: Rotte Express protette con middleware auth.
  - `reports.bootstrap.ts`: Registrazione DI container e integrazione in `routes.ts`.
- **Frontend (`frontend/src/modules/reports/` & `app/reports/`)**:
  - `api/reportsApi.ts`: Client HTTP via `apiClient` e download file.
  - `hooks/useReports.ts`: Hook React con SWR per caricamento e refresh dati.
  - `components/ReportsFilterBar.tsx`: Filtri per date/preset ed export.
  - `components/ReportsSummaryCards.tsx`: KPI cards per metriche finanziarie e booking.
  - `components/ReportsDataGrid.tsx`: Tabella AG-Grid avanzata con paginazione MUI.
  - `app/reports/page.tsx`: Pagina Next.js App Router.

---

## 🎯 TASK #1: Implementare DARK MODE / Theme Support

**Priorità:** MEDIA

**Descrizione:**
Tema chiaro/scuro con toggle e preferenze persistite (localStorage).

### Backend Tasks:
1. User schema update:
   - Add `theme: 'light' | 'dark' | 'system'` field
   - API endpoint: `PATCH /api/user/theme` → save preference

### Frontend Tasks:
1. Theme Provider:
   - Create custom MUI theme (light + dark)
   - Color palette per tema
   - useTheme hook

2. ThemeContext:
   - Global state per tema
   - Persist in localStorage
   - Listen to system preference (if 'system')

3. UI Components:
   - Theme toggle button (sun/moon icon)
   - Placed in header/navbar
   - Smooth transition tra temi

4. MUI Integration:
   - Apply theme a tutti i MUI components
   - Custom colors per tema
   - Dark mode for AG-Grid

**Prompt:**
```
"Implement dark mode support for Demo-Nagma with:
- Custom MUI theme (light and dark palettes)
- ThemeProvider context for global state
- Theme persistence in localStorage
- 'system' preference option (matches OS)
- Theme toggle button in header with sun/moon icons
- Smooth color transitions
- AG-Grid dark mode styling
- API endpoint to save user theme preference
- useTheme hook for custom components
Support: automatic theme switch, manual override, persistence."
```

---

## 🎯 TASK #2: Implementare EXPORT FUNCTIONALITY (PDF, Excel, CSV) (Fatto)

**Stato:** ✅ **(Fatto)**  
**Priorità:** ALTA

**Descrizione:**
Motore generico di esportazione dati riutilizzabile (CSV, Excel .xlsx formattato con stili e PDF stampabile) integrato sia nel backend Express che in tutte le griglie frontend.

### Componenti Implementati:
- **Backend (`backend/src/modules/export/`)**:
  - `types/export.types.ts`: DTO per richieste di export, colonne e formati.
  - `services/export.service.ts`: Generazione di CSV UTF-8 BOM, Excel (.xlsx) con stili/colori via `exceljs`, PDF con `pdfkit` e resolver entità Prisma.
  - `controllers/export.controller.ts`: Handler `POST /api/export` con download diretto.
  - `routes/export.routes.ts`: Rotta Express protetta da auth middleware.
  - `export.bootstrap.ts`: Registrazione nel container DI e in `routes.ts`.
- **Frontend (`frontend/src/modules/export/` & `common/`)**:
  - `api/exportApi.ts`: Client HTTP via `fetch` con autenticazione Bearer token e download blob.
  - `hooks/useExport.ts`: Hook React per gestione download e selezione colonne.
  - `components/ExportDropdownButton.tsx`: Pulsante con menu a tendina (CSV, Excel .xlsx, PDF, Personalizza...).
  - `components/ExportModalDialog.tsx`: Dialog per la selezione colonne, nome file e formato.
  - `common/utils/exportTable.ts` e `DataTableToolbar.tsx`: Integrazione del formato PDF (.pdf) in tutte le griglie della piattaforma.

---

**Prompt:**
```
"Implement export functionality for Demo-Nagma with:
- Backend export service for CSV, Excel, PDF formats
- Excel export with formatting: headers, colors, widths
- PDF export with company logo, title, filters summary
- CSV export with proper encoding
- API endpoint accepting format, filters, column selection
- React export button component with dropdown
- Export dialog to select columns and customize output
- Automatic file download after generation
- Filename with timestamp (data_YYYY-MM-DD.xlsx)
- Error handling and user feedback
Support exporting filtered and sorted data from grids."
```

---

## 🎯 TASK #3: Implementare FAVORITES / Bookmarks System

**Priorità:** MEDIA

**Descrizione:**
Permettere ai user di salvare item come preferiti per quick access.

### Backend Tasks:
1. Mongoose schema `Bookmark`:
   - userId
   - Type (module, page, report, document, etc)
   - Reference (entityId or URL)
   - Label (custom name)
   - Order (for sorting)
   - CreatedAt

2. API:
   - `POST /api/bookmarks` - Add bookmark
   - `GET /api/bookmarks` - List user's bookmarks
   - `DELETE /api/bookmarks/:id` - Remove bookmark
   - `PATCH /api/bookmarks/:id/order` - Reorder (drag & drop)

### Frontend Tasks:
1. Star/Bookmark Icon:
   - In each entity (module page header, grid row, card)
   - Click to toggle bookmark
   - Highlight se già bookmarkato
   - Toast feedback

2. Bookmarks Sidebar:
   - Collapsible section in navigation
   - List bookmarks con icons
   - Reorderable via drag & drop
   - Quick access links
   - Remove bookmark button

3. Quick Access:
   - Dashboard widget con recent bookmarks
   - Keyboard shortcut to show bookmarks

**Prompt:**
```
"Implement favorites/bookmarks system for Demo-Nagma with:
- Mongoose schema for storing user bookmarks
- API endpoints: create, list, delete, reorder
- Star/bookmark icon in entity headers and grid rows
- Toggle favorite state with visual feedback
- Bookmarks sidebar with quick access links
- Drag & drop reordering of bookmarks
- Dashboard widget showing recent bookmarks
- Keyboard shortcut to toggle current page as favorite
- Toast notifications for bookmark actions
- Persist order in database
Support bookmarking modules, pages, documents, and custom URLs."
```

---

## 🎯 TASK #4: Implementare ADVANCED FILTERING & Saved Views (Fatto)

**Stato:** ✅ **(Fatto)**  
**Priorità:** ALTA

**Descrizione:**
Filtri avanzati componibili (condizioni multiple, logica AND/OR, operatori flessibili) e sistema di salvataggio/gestione di viste personalizzate (`SavedView`) per ogni modulo della piattaforma.

### Componenti Implementati:
- **Backend (`backend/src/`)**:
  - `prisma/schema.prisma`: Nuovo modello `SavedView` con relazione 1-a-molti con `User`.
  - `modules/saved-views/types/savedView.types.ts`: DTO e validazione Zod `createSavedViewSchema` e `updateSavedViewSchema`.
  - `modules/saved-views/services/savedViewService.ts`: Metodi `getSavedViews`, `createSavedView`, `updateSavedView`, `deleteSavedView` e `setDefault`.
  - `modules/saved-views/controllers/savedViewController.ts`: Express handler per `GET /api/saved-views`, `POST /api/saved-views`, `PATCH /api/saved-views/:id`, `DELETE /api/saved-views/:id` e `PATCH /api/saved-views/:id/set-default`.
  - `modules/saved-views/routes/savedView.routes.ts` & `savedView.bootstrap.ts`: Rotte protette da auth ed iniezione nel container DI.
- **Frontend (`frontend/src/`)**:
  - `modules/saved-views/api/savedViewApi.ts`: Client API HTTP per il salvataggio ed il recupero remoto delle viste.
  - `common/components/filters/FilterBuilderModal.tsx`: Componente Modal interattivo per comporre filtri con operatori (`contains`, `equals`, `greaterThan`, `lessThan`, `inRange`, `isEmpty`) e logica AND/OR.
  - `common/components/filters/SavedViewsSelector.tsx`: Componente Dropdown per selezionare viste salvate, salvare la vista corrente, impostarla come predefinita o eliminarla.
  - `common/hooks/useSavedViews.ts`: Custom Hook React per connettere la gestione delle viste alle tabelle della piattaforma.

---

**Prompt:**
```
"Implement advanced filtering and saved views for Demo-Nagma with:
- Mongoose SavedView schema for persisting filter configurations
- Advanced filter panel with multiple filter types
- Field-specific filter inputs: date range, dropdown, text search, number range
- AND logic for combining filters
- Saved views: create, list, load, update, delete
- Default view selection per module
- UI showing active filter count
- Quick preset filters (All, Active, My Items, Recently Updated)
- Drag & drop filter reordering
- Export filtered results
- Mobile-responsive filter panel
Persist view configurations per user and module."
```

---

## 🎯 TASK #5: Implementare USER PREFERENCES & Settings Page (Fatto)

**Stato:** ✅ **(Fatto)**  
**Priorità:** MEDIA

**Descrizione:**
Sistema completo di preferenze utente personalizzate (lingua, fuso orario, formato data, elementi per pagina e notifiche) sincronizzato sia in DB PostgreSQL tramite Prisma che nel frontend via React Context.

### Componenti Implementati:
- **Backend (`backend/src/`)**:
  - `prisma/schema.prisma`: Nuovo modello `UserPreference` con relazione 1-a-1 con `User`.
  - `modules/user/types/userPreferences.types.ts`: DTO e validazione Zod `updateUserPreferencesSchema`.
  - `modules/user/services/userPreferencesService.ts`: Metodi `getPreferences` e `updatePreferences` con upsert.
  - `modules/user/controllers/userPreferencesController.ts`: Handler Express per `GET /api/user/preferences` e `PATCH /api/user/preferences`.
  - `modules/user/routes/userPreferences.routes.ts` & `userPreferences.bootstrap.ts`: Rotte protette da auth middleware e registrazione nel DI container.
- **Frontend (`frontend/src/`)**:
  - `modules/user/api/userPreferencesApi.ts`: Client API per la gestione remota delle preferenze.
  - `common/context/PreferencesContext.tsx`: Provider React Context e hook `usePreferences()` con sincronizzazione `localStorage`.
  - `app/settings/page.tsx`: Pagina impostazioni utente responsive con sezioni per *Generale & Lingua*, *Visualizzazione & Tabelle* e *Notifiche*.
  - `common/components/layout/Navbar.tsx`: Collegamento rapido alla pagina `/settings` nel menu profilo.

---

**Prompt:**
```
"Implement user preferences and settings page for Demo-Nagma with:
- MongoDB UserPreferences schema
- API endpoints for fetching and updating preferences
- Settings page (/settings) with form sections
- Preferences: language, timezone, date format, items per page, notifications
- Save/cancel buttons with success feedback
- PreferencesContext for global state
- usePreferences custom hook
- Apply preferences across app (dates, grids, UI)
- Persist preferences in localStorage and database
- Timezone-aware date formatting
- Defaults for new users
Ensure preferences apply immediately after saving."
```

---

## 🎯 TASK #6: Implementare Standardized PAGINATION (Fatto)

**Stato:** ✅ **(Fatto)**  
**Priorità:** MEDIA

**Descrizione:**
Standardizzazione unificata della paginazione lato backend e frontend per tutte le griglie della piattaforma.

### Componenti Implementati:
- **Backend (`backend/src/core/`)**:
  - `shared/kernel/interfaces.ts`: Struttura di risposta unificata `IPaginatedResponse<T>` contenente `{ data, total, page, limit, pages, totalPages }`.
  - `shared/kernel/pagination.ts` & `shared/utils/date-utils.ts`: Helper `paginate` con calcolo rigido di `pages`/`totalPages` e `limit` di default a 25 elementi.
- **Frontend (`frontend/src/common/`)**:
  - `components/table/StandardPagination.tsx`: Componente UI di paginazione unificato e responsive con MUI `TablePagination` (selettore righe `10, 25, 50, 100`) e `Pagination`.
  - `hooks/useInfiniteScroll.ts`: Hook per la paginazione continua ad avvio/scorrimento (Infinite Scroll).
  - `hooks/useDataTable.ts` & `DataTableImpl.tsx`: Persistenza del limite righe in `localStorage` (`nagma_items_per_page`), scroll-to-top automatico ad ogni cambio pagina e selettore `[10, 25, 50, 100]`.

---

**Prompt:**
```
"Implement standardized pagination for Demo-Nagma with:
- Backend pagination utility function
- Consistent response format: { data, total, page, limit, pages }
- Query params: ?page=1&limit=10
- Update all list endpoints with pagination
- React pagination component
- Page number display with navigation
- Items per page selector (10, 25, 50, 100)
- Total items and current range display
- Scroll to top on page change
- Infinite scroll alternative
- Mobile-responsive pagination
- Remember last viewed page
Support both offset-based and cursor-based pagination."
```

---

## 🎯 TASK #7: Implementare MOBILE RESPONSIVENESS Optimization (Fatto)

**Stato:** ✅ **(Fatto)**  
**Priorità:** MEDIA

**Descrizione:**
Ottimizzazione completa dell'interfaccia utente per smartphone e tablet con menu a comparsa slide-out (Drawer Navigation), pulsanti touch-friendly e rendering responsive delle tabelle.

### Componenti Implementati:
- **Frontend (`frontend/src/`)**:
  - `app/layout.tsx`: Esportazione dei metadati `viewport` (`width: 'device-width'`, `initialScale: 1`) e `themeColor`.
  - `common/components/layout/MobileDrawer.tsx`: Componente Drawer slide-out responsive per schermi mobili contenente profilo utente, badge ruolo, collegamenti completi con stato attivo, pulsante "Nuova Prenotazione" e disconnessione.
  - `common/components/layout/Navbar.tsx`: Pulsante Hamburger responsive (min 44px) su schermi `isSmall` / `isMedium` per l'apertura e chiusura del `MobileDrawer`.
  - `common/components/table/DataTableToolbar.tsx` & `DataTableImpl.tsx`: Garanzia di touch-target da 44px su tutti i pulsanti ed abilitazione dello scorrimento touch orizzontale fluido (`WebkitOverflowScrolling: 'touch'`) e rendering a schede (`renderCard`).

---

**Prompt:**
```
"Implement mobile responsiveness for Demo-Nagma with:
- Responsive layout using MUI breakpoints (xs, sm, md, lg, xl)
- Drawer navigation on mobile (hamburger menu)
- Collapsible sidebar on tablet
- Responsive AG-Grid (hide columns on mobile, card view alternative)
- Touch-friendly buttons and inputs (44px minimum tap target)
- Full-width forms on mobile
- Swipe actions for grid rows (edit, delete)
- Responsive images and icons
- Mobile-optimized modals and dialogs
- Viewport meta tags and PWA support
- Test on breakpoints and real devices
Ensure all features work on mobile without horizontal scrolling."
```

---

## 🎯 TASK #8: Implementare PERFORMANCE MONITORING & Analytics (Fatto)

**Stato:** ✅ **(Fatto)**  
**Priorità:** BASSA (ma importante per scale)

**Descrizione:**
Sistema completo di monitoraggio delle prestazioni dell'applicazione (latenze HTTP, P95/P99, tracciamento richieste lente, percentuale di errore e Core Web Vitals) con dashboard di diagnostica in SuperAdmin Panel.

### Componenti Implementati:
- **Backend (`backend/src/`)**:
  - `modules/metrics/types/metrics.types.ts`: DTO per `MetricsSummaryDto`, `EndpointMetricDto`, `CoreWebVitalsDto`.
  - `modules/metrics/services/metrics.service.ts`: Service in-memory per registrare richieste, calcolare latenza media, P95, P99, percentuale d'errore e log delle richieste lente (>100ms).
  - `modules/metrics/controllers/metrics.controller.ts`: Endpoint `GET /api/metrics/summary`, `POST /api/metrics/vitals` e `DELETE /api/metrics/reset`.
  - `modules/metrics/routes/metrics.routes.ts` & `metrics.bootstrap.ts`: Rotte Express protette da auth ed iniezione DI container.
  - `app.ts`: Integrazione automatica del tracciamento delle latenze nel middleware `res.on('finish')`.
- **Frontend (`frontend/src/`)**:
  - `modules/metrics/api/metricsApi.ts`: Client API HTTP per recuperare le metriche ed inviare i dati Web Vitals.
  - `common/utils/webVitals.ts`: Tracker basato su `PerformanceObserver` per First Contentful Paint (FCP), Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS) e Time to First Byte (TTFB).
  - `modules/superadmin/components/PerformanceDashboard.tsx`: Componente Dashboard di Diagnostica con 4 KPI cards, schede Core Web Vitals con badge di stato, tabella prestazioni per endpoint e log in tempo reale delle richieste lente.
  - `modules/superadmin/pages/SuperAdminPanelPage.tsx`: Integrazione del nuovo Tab **"Prestazioni & Diagnostica"**.

---

**Prompt:**
```
"Implement performance monitoring and analytics for Demo-Nagma with:
- Backend logging: API response times, database query times
- Frontend Core Web Vitals tracking (LCP, FID, CLS)
- Custom metrics: API latency, grid render time, page load time
- Error tracking and reporting
- Analytics: page views, feature usage, user sessions
- Metrics aggregation and dashboard
- Integration with service like Sentry or DataDog (optional)
- Response time percentiles (p50, p95, p99)
- Performance alerts for degradation
- Historical trending and comparison
Ensure minimal performance impact from monitoring itself."
```

---

## 📋 ORDINE DI PRIORITÀ CONSIGLIATO

1. **TASK #1 - Dark Mode** ← Nice to have, moderate effort
2. **TASK #2 - Export Functionality** ← High ROI, users love it
3. **TASK #3 - Favorites** ← Quick win, engagement boost
4. **TASK #4 - Advanced Filtering** ← Discovery enhancement
5. **TASK #5 - User Settings** ← UX polish
6. **TASK #6 - Pagination** ← Consistency across app
7. **TASK #7 - Mobile Optimization** ← Critical for reach
8. **TASK #8 - Performance Monitoring** ← Long-term health

---

## 🚀 COME USARE I PROMPT

Per ogni task:
1. Copia il prompt dalla sezione "Prompt da dare"
2. Incolla nel chat con Claude (avendogli precedentemente dato il PROMPT-Demo-Nagma.md)
3. Claude genererà codice completo (backend + frontend)
4. Integra nel tuo repo
5. Test con `npm run dev` e `npm run test`

Buona fortuna! 💪
