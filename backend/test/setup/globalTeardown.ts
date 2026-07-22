/**
 * Jest Global Teardown — arresta il server backend avviato da globalSetup.
 *
 * Poiché il server è stato avviato con `detached: true`, ha il proprio pgid = pid.
 * Usiamo `process.kill(-pid, signal)` per inviare il segnale all'intero gruppo
 * del server senza toccare il processo Jest.
 */

import { execSync } from 'child_process';

export default async function globalTeardown(): Promise<void> {
  const isExternal = (globalThis as Record<string, unknown>).__BACKEND_EXTERNAL__;

  if (isExternal) {
    // Il server era già in ascolto prima dei test — non lo tocchiamo
    return;
  }

  const pid = (globalThis as Record<string, unknown>).__BACKEND_PID__ as number | undefined;

  if (!pid) {
    return;
  }

  console.log(`\n🛑 Arresto server backend (PID: ${pid})...\n`);

  // — Step 1: SIGTERM ordinato al process group del server (pgid = pid con detached: true)
  try {
    process.kill(-pid, 'SIGTERM');
  } catch {
    // Il processo è già terminato — OK
  }

  // — Step 2: Aspetta 2s per pulizia ordinata
  await new Promise((r) => setTimeout(r, 2000));

  // — Step 3: Verifica se ancora vivo; se sì, SIGKILL solo al suo process group
  try {
    process.kill(-pid, 0); // throws se il gruppo non esiste più
    // Ancora vivo → forza
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      // Ignorabile
    }
  } catch {
    // Processo già terminato correttamente ✓
  }

  // — Step 4: Fallback cross-platform — libera porta 3001 nel caso rimanga occupata
  const port = process.env.PORT || '3001';
  try {
    // macOS / Linux con lsof
    execSync(`lsof -ti:${port} | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' });
  } catch {
    try {
      // Linux alternativo con fuser
      execSync(`fuser -k ${port}/tcp 2>/dev/null || true`, { stdio: 'ignore' });
    } catch {
      // Ignorabile — porta già libera
    }
  }

  console.log('✅ Server backend arrestato\n');
}
