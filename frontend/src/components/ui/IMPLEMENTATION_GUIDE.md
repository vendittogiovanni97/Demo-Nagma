# Guida di Implementazione - Button Component

Questa guida spiega come il componente Button è stato creato per garantire coerenza in tutto il frontend.

## 🎯 Obiettivi Raggiunti

### 1. Centralizzazione
- ✅ Un unico componente Button per tutta l'applicazione
- ✅ Design tokens centralizzati in `config/design-tokens.ts`
- ✅ Export da `components/ui/index.ts`

### 2. Riutilizzabilità
- ✅ 6 varianti di stile predefinite
- ✅ 3 dimensioni configurabili
- ✅ Props flessibili per icon, loading state, fullWidth
- ✅ Supporto per className personalizzati

### 3. Consistenza Visiva
- ✅ Colori allineati al design system (accent cyan, danger red, success green)
- ✅ Spacing e border-radius consistenti
- ✅ Shadow effects per depth visual
- ✅ Hover/focus states uniformi

### 4. Manutenibilità
- ✅ Un solo posto per aggiornare gli stili di tutti i button
- ✅ Design tokens documentati
- ✅ Type safety con TypeScript
- ✅ README e linee guida chiare

## 📊 Struttura File

```
frontend/src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx              ← Componente principale
│   │   ├── ButtonStories.tsx       ← Storie e esempi
│   │   ├── index.ts                ← Export centralizzato
│   │   ├── README.md               ← Documentazione
│   │   └── IMPLEMENTATION_GUIDE.md ← Questa guida
│   ├── forms/
│   │   └── SubmitButton.tsx        ← Refactorizzato per usare Button
│   └── ...
├── config/
│   ├── design-tokens.ts            ← Design tokens centralizzati
│   └── ...
└── ...
```

## 🔄 Refactoring Eseguito

### SubmitButton
**Prima:**
```tsx
// forms/SubmitButton.tsx
const [isSubmitting] = useFormStatus();
return (
  <button
    type="submit"
    disabled={isSubmitting}
    className="btn-primary w-full py-4 flex items-center justify-center gap-2 mt-4 text-lg disabled:opacity-60 disabled:cursor-not-allowed"
  >
    {/* ... */}
  </button>
);
```

**Dopo:**
```tsx
// forms/SubmitButton.tsx
return (
  <Button
    type="submit"
    variant="primary"
    size="lg"
    isLoading={loading}
    loadingLabel={loadingLabel || 'Salvataggio...'}
    icon={icon}
    fullWidth
    disabled={disabled}
  >
    {label}
  </Button>
);
```

## 💡 Prossimi Passi - Come Migrare il Resto

### 1. ExportButtons Buttons
**Posizione:** `components/feedback/ExportButtons.tsx`

Sostituire gli `<button>` tag con il componente Button:
```tsx
// Sostituire questa parte:
<button
  className="glass-btn flex items-center gap-2 px-5 disabled:cursor-not-allowed disabled:opacity-50"
>

// Con questa:
<Button
  variant="glass"
  size="md"
  icon={<FileSpreadsheet size={18} />}
>
```

### 2. Paginazione e Controlli
**Posizione:** `components/feedback/PaginationControls.tsx`

Usa `Button` con `variant="ghost"` per i link di navigazione.

### 3. Tutti gli altri Button
Cerca nel progetto tutti gli `<button>` tag che non usano il componente Button e migra a uno a uno.

**Comando utile:**
```bash
# Trova tutti i button tag nel codice
grep -r "<button" src/components --include="*.tsx" | grep -v "export" | grep -v "Button.tsx"
```

## 🔍 Verifica della Coerenza

### 1. Visual Consistency
- [ ] Tutti i button usano il componente Button
- [ ] Nessun button ha stili inline o className hardcoded
- [ ] Colori dei button vengono da `design-tokens.ts`

### 2. API Consistency
- [ ] Tutti i button use le stesse prop (variant, size, isLoading, icon, fullWidth)
- [ ] Loading state funziona ovunque
- [ ] Icon support è consistente

### 3. Documentation
- [ ] README.md è aggiornato
- [ ] ButtonStories.tsx mostra tutti i casi d'uso
- [ ] Commenti nel codice spiegano le decisioni

## 🚀 Migrare Altre Componenti

### Per i FormComponents (FormInput, FormSelect, ecc.)
Considera di creare componenti wrapper analoghi:
```tsx
// components/ui/FormButton.tsx
export default function FormButton({ label, type = 'submit', ...props }) {
  return (
    <Button
      type={type}
      variant="primary"
      size="lg"
      fullWidth
      {...props}
    >
      {label}
    </Button>
  );
}
```

### Per i Link/Navigation Button
```tsx
// Usa variant="ghost" per link-like button
<Button variant="ghost">Torna indietro</Button>

// Per veri link, considera Next.js Link:
import Link from 'next/link';
<Link href="/path">
  <Button as="span" variant="ghost">Link interno</Button>
</Link>
```

## 📋 Checklist per l'Implementazione Completa

- [ ] Button.tsx è in produzione
- [ ] SubmitButton.tsx è refactorizzato
- [ ] ExportButtons.tsx è migrato
- [ ] Tutti gli altri button tag sono sostituiti
- [ ] design-tokens.ts è importato dove necessario
- [ ] ButtonStories.tsx è navigabile (route creata)
- [ ] README.md è linkato nella documentazione principale
- [ ] Test unitari per Button (opzionale ma consigliato)
- [ ] Nessun CSS class duplicato (glass-btn, btn-primary in globals.css)

## 🎨 Tipologie di Button per Caso d'Uso

### Azioni Principali
```tsx
<Button variant="primary">Salva</Button>
<Button variant="primary" isLoading={loading}>Invia</Button>
```

### Azioni Secondarie
```tsx
<Button variant="secondary">Annulla</Button>
<Button variant="secondary">Continua</Button>
```

### Azioni Distruttive
```tsx
<Button variant="danger">Elimina</Button>
<Button variant="danger">Esci</Button>
```

### Conferme Positive
```tsx
<Button variant="success">Confermo</Button>
<Button variant="success" icon={<CheckCircle2 />}>Fatto</Button>
```

### Azioni Leggere
```tsx
<Button variant="glass">Esplora</Button>
<Button variant="ghost">Link</Button>
```

## 🔧 Troubleshooting

### Button non prende il focus ring
- Assicurati che `focus-visible:outline-none focus-visible:ring-2` sia nei `baseStyles`
- Verifica che i CSS personalizzati in `globals.css` non sovrascrivano

### Icon non si allinea bene
- Usa `size={20}` o `size={24}` per icone lucide-react
- Assicurati che l'icon sia dentro uno `<span>` con `flex items-center justify-center`

### Loading spinner non funziona
- Verifica che `isLoading` sia `true`
- Controlla che `loadingLabel` non sia vuoto
- Il testo di fallback è "Caricamento..." in italiano

---

**Creato:** 17 Aprile 2026  
**Versione:** 1.0  
**Status:** Production Ready ✅
