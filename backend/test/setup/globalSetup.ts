/**
 * Jest Global Setup — avvia il server backend prima dei test di integrazione/security.
 *
 * Funziona sia in locale che in CI senza modifiche al workflow:
 * il processo figlio usa tsx per eseguire src/index.ts direttamente.
 */

import { spawn, ChildProcess } from 'child_process';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const MAX_WAIT_MS = 30_000;
const POLL_INTERVAL_MS = 500;

// Variabile globale per il processo server (condivisa con globalTeardown via __BACKEND_PID__)
let serverProcess: ChildProcess | null = null;

async function waitForServer(): Promise<void> {
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_MS) {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.ok) return;
    } catch {
      // server non ancora pronto
    }
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(
    `❌ Il server non ha risposto su ${BASE_URL}/health entro ${MAX_WAIT_MS / 1000}s`,
  );
}

export default async function globalSetup(): Promise<void> {
  const rootDir = path.resolve(__dirname, '../../');

  // Se il server è già in ascolto (avviato manualmente), non ne spawniamo uno nuovo
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (res.ok) {
      console.log(`\n✅ Server già in ascolto su ${BASE_URL} — skip avvio automatico\n`);
      // Segnala a globalTeardown di non uccidere il processo
      (globalThis as Record<string, unknown>).__BACKEND_EXTERNAL__ = true;
      return;
    }
  } catch {
    // non in ascolto, lo avviamo noi
  }

  console.log('\n🚀 Avvio server backend per i test di integrazione...\n');

  const env: NodeJS.ProcessEnv = {
    ...process.env,
    NODE_ENV: 'test',
    PORT: '3001',
    // Assicuriamo che la config non venga caricata da DB durante i test
    INIT_CONFIG_FROM_DB: 'false',
  };

  serverProcess = spawn('npx', ['tsx', 'src/index.ts'], {
    cwd: rootDir,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false,
  });

  if (serverProcess.stdout) {
    serverProcess.stdout.on('data', (chunk: Buffer) => {
      if (process.env.JEST_SERVER_VERBOSE === '1') {
        process.stdout.write(`[SERVER] ${chunk.toString()}`);
      }
    });
  }

  if (serverProcess.stderr) {
    serverProcess.stderr.on('data', (chunk: Buffer) => {
      if (process.env.JEST_SERVER_VERBOSE === '1') {
        process.stderr.write(`[SERVER ERR] ${chunk.toString()}`);
      }
    });
  }

  serverProcess.on('error', (err) => {
    console.error('❌ Errore avvio processo server:', err);
  });

  // Salva il PID nel global per il teardown
  (globalThis as Record<string, unknown>).__BACKEND_PID__ = serverProcess.pid;
  (globalThis as Record<string, unknown>).__BACKEND_EXTERNAL__ = false;

  await waitForServer();
  console.log(`✅ Server pronto su ${BASE_URL}\n`);
}
