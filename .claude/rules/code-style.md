# Regole Code Style — Demo Nagma

## Loading e Error State
MAI `useState` sparsi per gestire loading/errore di chiamate API:
```tsx
// ❌ vietato
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// ✅ corretto — toast globale
import { useToast } from '@/common/hooks/useToast';
const toast = useToast();
toast.success('Operazione completata');
toast.error('Errore durante il salvataggio');

// ✅ corretto — hook dedicato con loading integrato
const { isLoading, mutate } = useFormModal({ ... });
```

## Commenti nel Codice
Zero commenti che spiegano **cosa** fa il codice. Solo commenti per il **perché** non ovvio.

## Nessuna Compatibilità all'Indietro Inutile
Se qualcosa è inutilizzato, cancellalo completamente. Mai:
- Rinominare in `_variabile`
- Aggiungere `// removed`
- Lasciare re-export di roba eliminata

## TypeScript
- Nessun `any` — usa `unknown` se il tipo è davvero ignoto
- Tipi definiti nei rispettivi `model/` di ogni modulo
- `strict: true` — non disabilitare mai

## Import Path
Frontend: usare sempre `@/` (alias per `src/`). I file condivisi sono sotto `@/common/`:
```typescript
// ✅ corretto
import { apiClient } from '@/common/shared/api/client';
import { useToast } from '@/common/hooks/useToast';

// ❌ vietato
import { apiClient } from '../../../common/shared/api/client';
import { useToast } from '@/hooks/useToast';  // vecchio path, ora è in common/
```
