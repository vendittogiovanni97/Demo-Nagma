---
target: frontend/src
slug: frontend-src
date: 2026-09-04
total_score: 19
max_score: 40
na_heuristics: ""
p0_count: 2
p1_count: 2
method: dual-agent
---

## Design Health Score

| # | Euristica | Score |
|---|-----------|-------|
| 1 | Visibility of System Status | 2 |
| 2 | Match System / Real World | 3 |
| 3 | User Control and Freedom | 2 |
| 4 | Consistency and Standards | 2 |
| 5 | Error Prevention | 2 |
| 6 | Recognition Rather Than Recall | 2 |
| 7 | Flexibility and Efficiency | 3 |
| 8 | Aesthetic and Minimalist Design | 2 |
| 9 | Error Recovery | 1 |
| 10 | Help and Documentation | 0 |
| **Totale** | | **19/40 — Poor** |

## Design Specificity Verdict

LLM: SaaS dark generico con vocabolario tattoo applicato in superficie. Il Kanban con timer live e color coding artista sono le uniche scelte visivamente specifiche al settore. Tutto il resto (glassmorphism navbar, Lucide icons, Outfit/Inter mix) è intercambiabile con Linear/Vercel.

Detector 7 findings (exit 2):
- side-tab x3: BookingCard.tsx:61, CalendarEvent.tsx:156, TodayAgendaWidget.tsx:225
- overused-font x3: globals.css:122,151,286
- layout-transition x1: LayoutContainer.tsx:44

## Priority Issues

[P0] Nuova Prenotazione assente su laptop standard — Navbar.tsx:205 — {isXLarge && ...}
[P0] Incassa non registra transazione — KanbanBoard.tsx:88-90, KanbanCard.tsx:199-218
[P1] Finance date picker non sincronizzati — FinanceOverviewWidget.tsx:48-55
[P1] CSS vars non tracciate dal tema MUI — AgendaPage.tsx:223-224
[P2] IA avatar dropdown sovraccarica — Navbar.tsx:490-507
