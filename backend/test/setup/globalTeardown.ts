/**
 * Jest Global Teardown — arresta il server backend avviato da globalSetup.
 */

import { execSync } from 'child_process';

export default async function globalTeardown(): Promise<void> {
  const isExternal = (globalThis as Record<string, unknown>).__BACKEND_EXTERNAL__;

  if (isExternal) {
    // Il server era già in ascolto prima dei test, non lo tocchiamo
    return;
  }

  const pid = (globalThis as Record<string, unknown>).__BACKEND_PID__ as number | undefined;

  if (!pid) {
    return;
  }

  console.log(`\n🛑 Arresto server backend (PID: ${pid})...\n`);

  try {
    // Invia SIGTERM al gruppo di processi per catturare anche i figli di tsx
    process.kill(-pid, 'SIGTERM');
  } catch {
    // Su alcuni sistemi il PID potrebbe non esistere più o non avere gruppo
    try {
      process.kill(pid, 'SIGTERM');
    } catch {
      // Il processo è già terminato — nessun problema
    }
  }

  // Attendi 2s per pulizia ordinata, poi forza con SIGKILL se necessario
  await new Promise((r) => setTimeout(r, 2000));

  try {
    process.kill(pid, 0); // verifica se esiste ancora
    // Se siamo qui, il processo è ancora vivo → SIGKILL
    try {
      process.kill(-pid, 'SIGKILL');
    } catch {
      process.kill(pid, 'SIGKILL');
    }
  } catch {
    // Processo già terminato correttamente
  }

  // Fallback: libera la porta 3001 nel caso rimanga occupata
  try {
    execSync(`lsof -ti:3001 | xargs kill -9 2>/dev/null || true`, { stdio: 'ignore' });
  } catch {
    // Ignorabile
  }

  console.log('✅ Server backend arrestato\n');
}
