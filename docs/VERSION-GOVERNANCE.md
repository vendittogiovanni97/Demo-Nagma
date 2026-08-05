# Governance delle versioni

> Policy per gestire uno stack volutamente molto recente (Next 16, React 19,
> Prisma 7.8, TypeScript 6, Express 5, Zod 4, MUI 9) riducendo il rischio di
> breaking-change ed ecosistema immaturo. Aggiornato: 2026-08-05.

## Principi

1. **Pin delle major.** Nessun aggiornamento di *major* automatico. Le major si
   valutano una alla volta, con changelog letto e branch dedicato.
2. **Minor/patch controllati.** Aggiornamenti minor/patch raggruppati e testati
   dalla CI prima del merge (vedi Dependabot in `.github/dependabot.yml`).
3. **Lockfile è legge.** In CI si usa sempre `npm ci` (installa dal lockfile);
   il lockfile viene committato ad ogni cambio dipendenze.
4. **Un upgrade per PR.** Ogni PR di aggiornamento tocca una libreria (o un
   gruppo coeso), così un eventuale rollback è pulito.

## Strategia di pinning consigliata

Per le dipendenze **critiche e bleeding-edge** conviene passare da range `^`
(che accetta qualsiasi minor) a pin più stretti finché l'ecosistema non matura:

| Pacchetto | Range attuale | Consigliato | Motivo |
|---|---|---|---|
| next | `^16.2.4` | `~16.2.4` | Major appena uscita: evitare minor automatici |
| react / react-dom | `19.2.5` | `19.2.5` (esatto) | Già pinnato: mantenere |
| @prisma/client / prisma | `^7.8.0` | `~7.8.0` | Tenere client e CLI allineati alla stessa minor |
| typescript | `^6.0.2` | `~6.0.2` | TS major recente: minor possono introdurre check nuovi |
| express | `^5.2.1` | `~5.2.1` | v5 giovane nell'ecosistema middleware |
| zod | `^4.3.6` | `~4.3.6` | v4 ha avuto breaking rispetto a v3 |
| @mui/material | `^9.0.0` | `~9.0.0` | Major recente |

> Nota: `~x.y.z` consente solo patch (`x.y.*`), `^x.y.z` consente anche minor
> (`x.*`). Applicare i pin e rigenerare il lockfile con un `npm install`.

## Calendario upgrade

| Cadenza | Attività |
|---|---|
| Settimanale | Review PR Dependabot (patch/minor raggruppate) → merge se CI verde |
| Mensile | Valutazione major disponibili: leggere changelog, aprire branch spike |
| Trimestrale | Audit dipendenze non più mantenute / duplicate; `npm audit` di bilancio |

## Checklist per una major

- [ ] Leggere il changelog / migration guide ufficiale
- [ ] Branch dedicato `chore/upgrade-<pkg>-<versione>`
- [ ] `npm run lint && npm run typecheck && npm test` verdi
- [ ] `npm run build` (backend) e `next build` (frontend) verdi
- [ ] Smoke test manuale sui flussi critici (login, agenda, booking, finance)
- [ ] Aggiornare il lockfile e questa tabella
