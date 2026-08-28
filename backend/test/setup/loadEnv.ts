import { config } from 'dotenv';
import path from 'path';

// I test di integrazione firmano i JWT con process.env.JWT_SECRET e devono
// usare lo stesso valore del server (che carica backend/.env via dotenv/config).
// Senza questo, jest userebbe il fallback e il server rifiuterebbe i token (401).
config({ path: path.resolve(__dirname, '../../.env') });

// SECURITY (Audit H4): prisma.ts non ha più fallback con credenziali note e
// richiede DATABASE_URL al momento dell'import. I test unitari non si
// connettono realmente al database (il pool è lazy), ma hanno bisogno di una
// stringa sintatticamente valida: se backend/.env non esiste, ne forniamo una
// di test che punta a un DB inesistente. Vale SOLO per il processo di test,
// non indebolisce la configurazione runtime/produzione.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://jest:jest@localhost:5432/nagmadb_test?schema=public';
}
