import { config } from 'dotenv';
import path from 'path';

// I test di integrazione firmano i JWT con process.env.JWT_SECRET e devono
// usare lo stesso valore del server (che carica backend/.env via dotenv/config).
// Senza questo, jest userebbe il fallback e il server rifiuterebbe i token (401).
config({ path: path.resolve(__dirname, '../../.env') });
