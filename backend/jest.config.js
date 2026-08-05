/** @type {import('jest').Config} */
module.exports = {
  // ─── Coverage ────────────────────────────────────────────────────────────
  // Soglie tarate sui valori REALI della sola suite unit (misurati:
  // ~35% globale, auth ~32%, booking ~47%, finance ~27%). Sono un "ratchet":
  // fissate appena sotto l'attuale per restare verdi, da ALZARE nel tempo
  // verso il target roadmap del 70% sui moduli core (l'aumento arriverà in
  // parte contando anche la copertura dei test integration via
  // `npm run test:coverage:full`).
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.bootstrap.ts',
    '!src/modules/_template/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text-summary', 'html', 'lcov'],
  coverageThreshold: {
    // Floor globale (attuale ~35%). Target: 60%+.
    global: {
      statements: 30,
      branches: 30,
      functions: 33,
      lines: 30,
    },
    // Moduli sensibili — floor attuale, target 70%.
    './src/modules/auth/': {
      statements: 28,
      branches: 40,
      functions: 28,
      lines: 28,
    },
    './src/modules/booking/': {
      statements: 42,
      branches: 40,
      functions: 30,
      lines: 42,
    },
    './src/modules/finance/': {
      statements: 22,
      branches: 12,
      functions: 22,
      lines: 22,
    },
  },

  // Configurazione base ts-jest condivisa
  projects: [
    // ─── Progetto 1: Test unitari (modules/) — nessun server necessario ──────────
    {
      displayName: 'unit',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/src', '<rootDir>/test/modules'],
      testMatch: ['**/*.test.ts'],
      testPathIgnorePatterns: ['/node_modules/', '/_template/'],
      moduleFileExtensions: ['ts', 'js', 'json'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@core/(.*)$': '<rootDir>/src/core/$1',
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
      },
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: 'tsconfig.jest.json',
          diagnostics: { ignoreCodes: [151002] },
        }],
      },
      clearMocks: true,
      restoreMocks: true,
    },

    // ─── Progetto 2: Test di integrazione + sicurezza — richiede server ──────────
    {
      displayName: 'integration',
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/test/integration', '<rootDir>/test/security'],
      testMatch: ['**/*.test.ts'],
      testPathIgnorePatterns: ['/node_modules/'],
      moduleFileExtensions: ['ts', 'js', 'json'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@core/(.*)$': '<rootDir>/src/core/$1',
        '^@modules/(.*)$': '<rootDir>/src/modules/$1',
      },
      transform: {
        '^.+\\.ts$': ['ts-jest', {
          tsconfig: 'tsconfig.jest.json',
          diagnostics: { ignoreCodes: [151002] },
        }],
      },
      // Avvia/arresta il server automaticamente prima/dopo i test di integrazione
      globalSetup: '<rootDir>/test/setup/globalSetup.ts',
      globalTeardown: '<rootDir>/test/setup/globalTeardown.ts',
      setupFilesAfterEnv: ['<rootDir>/test/setup/closeHttpConnections.ts'],
      // Timeout più alto per le chiamate HTTP
      testTimeout: 30000,
      clearMocks: true,
      restoreMocks: true,
    },
  ],
};
