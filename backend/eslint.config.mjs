// ESLint flat config — backend (Node/Express/TypeScript).
// Regole non type-checked: veloci, non richiedono il "project" TS.
// Filosofia allineata al frontend: warning (non error) sulle voci di debito
// tecnico da ridurre progressivamente (any, unused, console) così la CI resta
// verde ma il debito è misurabile con `npm run lint`.

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'prisma/**',
      'src/modules/_template/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
    },
    rules: {
      // ── Debito tecnico da ridurre (warn, non blocca la CI) ──────────────
      // Operazionalizza la riduzione degli `any` prevista dalla roadmap M2.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Variabili/parametri inutilizzati: consentiti se prefissati con _
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      // Regola di progetto: usare il logger centralizzato, non console.*
      'no-console': 'warn',

      // ── Correttezza (error) ─────────────────────────────────────────────
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'smart'],
      // Catch vuoti consentiti (es. metrics best-effort in app.ts)
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
);
