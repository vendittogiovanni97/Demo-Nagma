# Design System — Nagma Tattoo CRM

<!-- impeccable:design-schema 1 -->
<!-- generated from: frontend/src/common/theme/theme.ts, frontend/src/common/theme/colorTokens.ts -->
<!-- mode: Operate -->

## Creative Identity

**North Star:** L'Atelier del Tatuatore — un ambiente di lavoro dark con tensione cromatica, tipografia compatta e decisa, zero fronzoli. Non è un'app generica con dark mode: è costruita per chi lavora sotto la luce di una lampada da tatuaggio, ha le mani occupate e vuole dati leggibili a colpo d'occhio.

**Nomi dei colori:**
- `#00bfff` → **Inchiostro Elettrico** — il primario, l'accento che segnala ogni azione, ogni stato attivo, ogni dato significativo
- `#0d1a28` → **Notte da Studio** — lo sfondo base, profondo come il retro di uno studio alle 22
- `#1a2332` → **Carta di Lavoro** — la superficie delle card e dei panel, leggermente più chiara del fondo

**Feel dei componenti:** Fluido e reattivo — i componenti rispondono ai gesti con micro-transizioni (translateY, box-shadow glow, border-color). Il sistema "vive" senza mai distrarre.

---

## Color System

### Superfici (background)

| Token | Valore | Uso |
|-------|--------|-----|
| `background.default` | `#0d1a28` — Notte da Studio | Sfondo app, canvas |
| `background.paper` | `#1a2332` — Carta di Lavoro | Card, Panel, Dialog, Menu |
| `secondary.dark` | `#0f1620` | Sidebar/AppBar collapsed |
| `secondary.light` | `#2a3545` | Hover su superfici elevate |

### Brand

| Token | Valore | Uso |
|-------|--------|-----|
| `primary.main` | `#00bfff` — Inchiostro Elettrico | CTA, link attivi, stato focus, accenti dati |
| `primary.light` | `#33d4ff` | Hover su contained button |
| `primary.dark` | `#0095cc` | Pressed state |
| `primary.contrastText` | `#ffffff` | Testo su primary |

### Semantici

| Token | Valore | Uso |
|-------|--------|-----|
| `success.main` | `#34d399` | Saldato, conferma |
| `warning.main` | `#fbbf24` | Da saldare, attenzione |
| `error.main` | `#f87171` | Errore, cancellazione |
| `info.main` | `#38bdf8` | Informazione |

### Custom

| Token | Valore | Uso |
|-------|--------|-----|
| `custom.purple` | `#a855f7` | Kanban IN_ATTESA, accento secondario |
| `custom.emerald` | `#34d399` | Alias success, SALDATO |
| `custom.whatsapp` | `#25D366` | Modulo WhatsApp |

### Testo

| Token | Valore | Uso |
|-------|--------|-----|
| `text.primary` | `#ffffff` | Corpo testo principale |
| `text.secondary` | `#b0b0b0` | Label, helper, placeholder |
| `text.disabled` | `rgba(176,176,176,0.5)` | Disabled state |

### Bordi e Divisori

| Token | Valore | Uso |
|-------|--------|-----|
| `divider` | `rgba(0,191,255,0.12)` | Separatori orizzontali, bordi card a riposo |
| — | `rgba(0,191,255,0.20)` | Bordo card/dialog (più visibile) |
| — | `rgba(0,191,255,0.40)` | Bordo card su hover |

### Interazione

| Token | Valore | Uso |
|-------|--------|-----|
| `action.hover` | `rgba(0,191,255,0.08)` | Hover su list item, menu, table row |
| `action.selected` | `rgba(0,191,255,0.16)` | Selected/active state |
| `action.active` | `#00bfff` | Icon attiva in sidebar |

---

## Data Colors (colorTokens.ts)

Questi colori rappresentano **dati**, non superfici. Non sostituiscono i token MUI.

### Kanban Stage Colors

| Stage | Colore | Hex |
|-------|--------|-----|
| IN_ARRIVO | Cyan vivo | `#00e5ff` |
| IN_ATTESA | Viola | `#ab47bc` |
| IN_SEDUTA | Sky | `#29b6f6` |
| DA_SALDARE | Ambra | `#ffa726` |
| SALDATO | Verde | `#66bb6a` |

### Staff Color Presets

`#00BFFF` · `#4F7CFF` · `#25D366` · `#FF6B6B` · `#FFB020` · `#9B6DFF`

### WhatsApp Variable Highlight

`#00e5ff` · `#ff007f` · `#7000ff` · `#ffaa00` · `#00ff66`

---

## Typography

**Font stack:** Outfit → -apple-system → Roboto → sans-serif

Outfit è geometrico e tecnico: trasmette competenza senza freddezza. Peso 400/500/600/700. `textTransform: none` su tutti i button — mai uppercase.

| Scale | Size | Weight | Line-height | Uso |
|-------|------|--------|-------------|-----|
| `h1` | 34px | 700 | 1.15 | Titoli pagina principali |
| `h2` | 28px | 700 | 1.20 | Sezione |
| `h3` | 24px | 700 | 1.25 | Sottosezione |
| `h4` | 20px | 700 | 1.30 | Card title |
| `h5` | 17px | 600 | 1.35 | Panel title |
| `h6` | 15px | 600 | 1.40 | Dialog title |
| `body1` | 15px | 400 | 1.50 | Testo principale |
| `body2` | 13px | 400 | 1.45 | Testo secondario, table cell |
| `button` | 13px | 600 | 1.40 | Tutti i pulsanti |
| `caption` | 11px | 400 | 1.50 | Note, metadata |
| `overline` | 11px | 600 | 1.40 | Label categoria (`letter-spacing: 0.08em`, uppercase) |

---

## Spacing & Layout

**Base unit:** 8px (`theme.spacing(1) = 8px`)

| Uso | Valore |
|-----|--------|
| Card padding | 18px |
| Dialog padding | 18px / 20px |
| Table cell | 12px 14px |
| Button padding | 8px 16px |
| Button min-height | 38px |
| Input min-height | 42px |

**Breakpoints:**

| Nome | px |
|------|----|
| xs | 0 |
| sm | 600 |
| md | 900 |
| lg | 1200 |
| xl | 1600 |

---

## Border Radius

| Contesto | Raggio |
|----------|--------|
| Default (shape.borderRadius) | 8px |
| Card, Dialog, Modal | 12px |
| Chip, Badge | 999px |
| Tooltip | 4px |
| IconButton | 8px |
| Menu | 8px |

---

## Elevation & Shadow System

Due famiglie di shadow — l'ombra "pura" (dark) e l'ombra "glow" (cyan). La glow si usa per elementi in stato active/hover/focus che devono comunicare energia.

**Dark shadows** (superfici standard):

| Level | Valore |
|-------|--------|
| 1 | `0px 2px 4px rgba(0,0,0,0.10)` |
| 2 | `0px 4px 8px rgba(0,0,0,0.15)` |
| 3 | `0px 8px 16px rgba(0,0,0,0.20)` |
| 4 | `0px 12px 24px rgba(0,0,0,0.25)` |

**Cyan glow shadows** (elementi interattivi, focus, hover):

| Level | Valore |
|-------|--------|
| 10 | `0px 4px 6px rgba(0,191,255,0.10)` |
| 11 | `0px 8px 12px rgba(0,191,255,0.12)` |
| 15 | `0px 24px 40px rgba(0,191,255,0.20)` |

Usi tipici:
- Card a riposo: shadow level 1 (dark) + border `rgba(0,191,255,0.20)`
- Card su hover: `0px 6px 18px rgba(0,191,255,0.12)` + border `rgba(0,191,255,0.40)`
- Button contained su hover: `0px 8px 24px rgba(0,191,255,0.30)`
- Dialog: border `rgba(0,191,255,0.20)` + radius 12px

---

## Motion

**Principio:** Le transizioni confermano l'interazione, non la decorano. Ogni componente risponde; nessuna animazione bloccante.

| Contesto | Durata | Easing | Effetto |
|----------|--------|--------|---------|
| Button principale | 300ms | ease | `translateY(-1px)` su hover, ritorno su active |
| Input focus | 300ms | ease | border-color + border-width transition |
| Card hover | 300ms | ease | box-shadow upgrade + border-color upgrade |
| IconButton | 200ms | ease | background-color fade |
| MenuItem | 200ms | ease | background-color fade |
| Table row hover | 200ms | ease | background-color fade |
| Switch, Checkbox, Radio | 300ms | ease | color transition |

---

## Component Signatures

### Button

- Contained: `bg #00bfff`, testo `#0a1a26` (dark su cyan), hover `translateY(-1px)` + glow shadow
- Outlined: border + testo `#00bfff`, hover `bg rgba(0,191,255,0.08)`
- Text: `color #00bfff`, hover `bg rgba(0,191,255,0.08)`
- `borderRadius: 8px`, `padding: 8px 16px`, `minHeight: 38px`, font 13px/600, `textTransform: none`

### Input / TextField

- Border a riposo: `rgba(0,191,255,0.20)`
- Border hover: `rgba(0,191,255,0.40)`
- Border focused: `#00bfff`, width 2px
- Background: `#1a2332` (autofill forzato)
- `borderRadius: 8px`, `minHeight: 42px`

### Card

- `background: #1a2332`, `borderRadius: 12px`
- Border: `1px solid rgba(0,191,255,0.20)`
- Shadow: `0px 4px 10px rgba(0,0,0,0.14)`
- Hover: shadow glow + border `rgba(0,191,255,0.40)`
- CardHeader: padding 18px, `borderBottom: 1px solid rgba(0,191,255,0.12)`
- CardContent: padding 18px

### Dialog / Modal

- `background: #1a2332`, `border: 1px solid rgba(0,191,255,0.20)`, `borderRadius: 12px`
- Title: 16px/600, `borderBottom: 1px solid rgba(0,191,255,0.12)`, padding 18px 20px
- Actions: `borderTop: 1px solid rgba(0,191,255,0.12)`, padding 14px 20px, `gap: 10px`

### Chip

- Filled: `bg rgba(0,191,255,0.12)`, `color #00bfff`
- Outlined: `border rgba(0,191,255,0.20)`, `color #b0b0b0`
- `height: 28px`, `borderRadius: 999px`, font 11px/500

### Table

- Header: `bg rgba(0,191,255,0.08)`, header cell `color #00bfff`, font 12px/600
- Body: row hover `bg rgba(0,191,255,0.05)`, cell `color #ffffff`, font 14px
- Border: `rgba(0,191,255,0.12)` su tutto

### AppBar

- `background: #0d1a28`, `borderBottom: 1px solid rgba(0,191,255,0.12)`

---

## Absolute Bans

- Nessun colore hardcoded in `sx` o `style` — usare sempre `theme.palette.*` o i token di `colorTokens.ts`
- Nessun `rgba()` o `#hex` inline nei componenti React
- Nessun font diverso da Outfit per il testo dell'interfaccia
- Nessun `textTransform: uppercase` sui button
- Nessuna ombra colorata su superfici statiche — il glow cyan è riservato agli stati interattivi
