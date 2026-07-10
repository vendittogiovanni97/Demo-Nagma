# Regole Componenti UI — Demo Nagma

## Colori (OBBLIGATORIO)
Zero colori hardcoded nell'`sx` o nello `style`. Usa sempre token del tema:
```tsx
// ✅ corretto
sx={{ color: 'text.primary', bgcolor: 'background.paper', borderColor: 'divider' }}
sx={{ color: theme => theme.palette.primary.main }}

// ❌ vietato
sx={{ color: '#00bfff', bgcolor: '#0a1a26', border: '1px solid rgba(255,255,255,0.1)' }}
```

## Stack UI
Il progetto usa MUI come libreria primaria con Radix per alcuni primitivi (Dialog, Popover, Select).
Quando esiste un componente in `components/ui/` (Button, Badge, Card, Modal, Toast), usare quello.

## Form
Usare i componenti da `components/forms/`:
- `FormInput` — campo testo
- `FormSelect` — dropdown
- `FormTextarea` — area testo
- `FormAutocomplete` — autocomplete
- `SearchInput` — campo ricerca
- `SubmitButton` — pulsante submit con loading
- `TimeSelect` — selettore orario

## Modali
Usare `components/ui/Modal/` per modali generici.
Usare `ConfirmDialog` per conferme distruttive.
Usare `PasswordConfirmModal` per azioni che richiedono password.

## Toast
Usare `useToast()` hook, mai `react-hot-toast` direttamente:
```tsx
const toast = useToast();
toast.success('Fatto');
toast.error('Errore');
```

## Tabelle
- `AG Grid` per tabelle dati complesse (prenotazioni, transazioni)
- `DataTable` component per tabelle più semplici

## Design Tokens
I token sono in `config/design-tokens.ts`. Usarli per varianti button, sizing, colori.
