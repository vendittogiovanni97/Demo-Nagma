/** @type {import('jest').Config} */
module.exports = {
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
      // Timeout più alto per le chiamate HTTP
      testTimeout: 30000,
      clearMocks: true,
      restoreMocks: true,
    },
  ],
};
