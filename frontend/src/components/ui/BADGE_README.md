# Badge Component

Componente Badge centralizzato per il frontend Next.js. Perfetto per tag, status indicator, e label visivi.

## Ubicazione
`src/components/ui/Badge.tsx`

## TypeScript Interface

```typescript
interface BadgeProps {
  variant?: BadgeVariant;  // 'primary' | 'secondary' | 'danger' | 'success' | 'info' | 'warning'
  size?: BadgeSize;        // 'xs' | 'sm' (default) | 'md'
  icon?: LucideIcon;       // Icona opzionale da lucide-react
  removable?: boolean;     // Mostra X button per rimuovere (default: false)
  onRemove?: () => void;   // Required se removable=true
  className?: string;      // Tailwind class aggiuntive
  children: ReactNode;     // Contenuto del badge
}
```

## Design Tokens

Integrazione con `src/config/design-tokens.ts`:

| Variant | Background | Text Color |
|---------|-----------|-----------|
| primary | bg-accent | text-black |
| secondary | bg-white/10 | text-white |
| danger | bg-danger/20 | text-danger |
| success | bg-success/20 | text-success |
| info | bg-accent/20 | text-accent |
| warning | bg-yellow/20 | text-yellow |

## Sizing

| Size | Padding | Font Size |
|------|---------|-----------|
| xs | px-2 py-1 | text-xs |
| sm | px-3 py-1.5 | text-sm |
| md | px-4 py-2 | text-base |

## Features

- ✅ TypeScript strict mode
- ✅ forwardRef support per ref control
- ✅ LucideIcon integration con sizing dinamico
- ✅ Removable mode con X button interattivo
- ✅ Design token alignment con app palette
- ✅ Tailwind classes (px, py, text-*, rounded-lg, font-semibold)
- ✅ Smooth hover effects su close button
- ✅ Accessibility: aria-label, focus-visible ring
- ✅ Warning console se removable senza onRemove

## Utilizzo

### Badge Semplice
```tsx
<Badge variant="primary">Nuovo</Badge>
```

### Con Icona
```tsx
import { CheckCircle } from 'lucide-react';

<Badge variant="success" icon={CheckCircle}>
  Completato
</Badge>
```

### Rimovibile
```tsx
const [visible, setVisible] = useState(true);

{visible && (
  <Badge
    variant="info"
    removable
    onRemove={() => setVisible(false)}
  >
    Info importante
  </Badge>
)}
```

### Combinato
```tsx
<Badge
  variant="warning"
  size="md"
  icon={AlertCircle}
  removable
  onRemove={handleRemove}
  className="custom-class"
>
  Attenzione
</Badge>
```

### Diversi Size
```tsx
<div className="flex gap-2">
  <Badge size="xs" variant="primary">XS</Badge>
  <Badge size="sm" variant="secondary">SM</Badge>
  <Badge size="md" variant="danger">MD</Badge>
</div>
```

## Esempi Completi (BadgeStories.tsx)

Visualizza tutti i variant, size, e combinazioni nel componente `BadgeStories`:

```tsx
import { BadgeStories } from '@/components/ui';

<BadgeStories />
```

## Importazione

```tsx
import Badge from '@/components/ui/Badge';
// oppure
import { Badge } from '@/components/ui';
```

## Accessibilità

- Close button ha aria-label="Rimuovi"
- Focus-visible ring per keyboard navigation
- Icone scaled dinamicamente per ogni size
- Semantic HTML (button per remove action)

## Performance

- forwardRef per ottimizzazione
- Minimal re-renders con event handlers
- Tailwind classes pre-compiled
- LucideIcon lazy-loaded da package

## Comportamento

- **variant default:** `primary`
- **size default:** `sm`
- **removable default:** `false`
- **icon size:** dinamico basato su size prop
- **close button:** visibile solo se removable=true
- **warning:** console.warn se removable senza onRemove
