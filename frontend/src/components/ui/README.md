# Componenti UI Centralizzati

Questa cartella contiene i componenti UI base e riutilizzabili di tutta l'applicazione.

## 📦 Button Component

Il componente `Button` è il componente base per tutti i pulsanti dell'applicazione. È stato progettato per essere super riutilizzabile e coerente con il design system.

### Caratteristiche

- ✅ **6 varianti di stile**: `primary`, `secondary`, `glass`, `danger`, `success`, `ghost`
- ✅ **3 dimensioni**: `sm`, `md`, `lg`
- ✅ **Loading state**: Mostra spinner e testo personalizzato durante il caricamento
- ✅ **Icon support**: Accetta qualsiasi ReactNode come icon
- ✅ **Full width**: Opzione `fullWidth` per button che occupano l'intera larghezza
- ✅ **Accessibilità**: Focus ring personalizzati e supporto per disabled state
- ✅ **TypeScript**: Completamente tipizzato

### Utilizzo Base

```tsx
import Button from '@/components/ui/Button';

// Primary button (default)
<Button>Accedi</Button>

// Con variante
<Button variant="secondary">Annulla</Button>

// Con size
<Button size="lg">Big Button</Button>

// Con icon
import { Heart } from 'lucide-react';
<Button variant="primary" icon={<Heart size={20} />}>
  Like
</Button>

// Con loading state
<Button 
  isLoading={loading} 
  loadingLabel="Salvataggio..."
>
  Salva
</Button>

// Full width
<Button fullWidth variant="danger">
  Elimina
</Button>

// Disabled
<Button disabled>Non cliccabile</Button>

// Custom className (Tailwind)
<Button className="mb-4">Con margin</Button>
```

### Props Disponibili

```typescript
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  // Style variant
  variant?: 'primary' | 'secondary' | 'glass' | 'danger' | 'success' | 'ghost';
  
  // Size
  size?: 'sm' | 'md' | 'lg';
  
  // Loading state
  isLoading?: boolean;
  loadingLabel?: string;
  
  // Icon support
  icon?: ReactNode;
  
  // Layout
  fullWidth?: boolean;
  
  // Standard HTML attributes
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  // ... tutti gli altri attributi standard di HTMLButtonElement
}
```

### Varianti di Stile

| Variante | Uso | Colore |
|----------|-----|--------|
| `primary` | Azioni principali | Accent (Cyan #00BFFF) |
| `secondary` | Azioni secondarie | Glass effect |
| `glass` | Azioni tertiary con backdrop blur | Glass effect |
| `danger` | Azioni distruttive | Danger (Red #ff5252) |
| `success` | Conferme positivi | Success (Green #25D366) |
| `ghost` | Link button | Transparent |

### Design Tokens

Tutti i colori e i valori di design sono centralizzati in `/src/config/design-tokens.ts`. Se devi modificare lo stile dei button:

```typescript
// frontend/src/config/design-tokens.ts
export const designTokens = {
  button: {
    variants: {
      primary: {
        background: '#00BFFF',
        color: '#000000',
        shadow: '0 0 15px rgba(0, 191, 255, 0.3)',
        // ...
      },
    },
  },
};
```

### Aggiornamento di SubmitButton

Il componente `SubmitButton` (in `/src/components/forms/SubmitButton.tsx`) è stato refactorizzato per usare il nuovo `Button` component:

```tsx
<SubmitButton
  loading={isSubmitting}
  label="Salva"
  loadingLabel="Salvataggio..."
  icon={<Save size={20} />}
  variant="primary"
/>
```

### Storie e Esempi

Vedi `ButtonStories.tsx` per un'anteprima interattiva di tutte le varianti e stati disponibili.

### Best Practices

1. **Usa sempre il componente Button** - Non creare button direttamente con `<button>` tag
2. **Scegli la variante giusta** - `primary` per azioni principali, `danger` per distruttive
3. **Aggiungi icon significativi** - Le icone aiutano l'utente a capire subito l'azione
4. **Usa loading state** - Feedback immediato durante operazioni async
5. **Mantieni consistenza** - Se aggiungi nuove varianti, aggiorna `design-tokens.ts`

### Aggiungere Nuove Varianti

Se hai bisogno di una nuova variante di button:

1. Aggiungi il nome in `ButtonVariant` type
2. Aggiungi i style in `variantStyles`
3. Aggiungi i token in `design-tokens.ts`
4. Aggiungi un esempio in `ButtonStories.tsx`

Esempio:
```tsx
// Button.tsx
type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'danger' | 'success' | 'ghost' | 'myNewVariant';

const variantStyles: Record<ButtonVariant, string> = {
  // ...
  myNewVariant: 'bg-purple-600 text-white hover:bg-purple-700',
};
```

---

**Ultimo aggiornamento:** 17 Aprile 2026  
**Componente creato per:** Nagma Tattoo CRM
