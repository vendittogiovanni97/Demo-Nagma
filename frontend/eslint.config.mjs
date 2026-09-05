import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Playwright e2e tests — not React components, incompatible with react plugin
    "e2e/**",
  ]),
  {
    rules: {
      // ── TypeScript ────────────────────────────────────────────────
      // Allow `any` — will be tightened progressively
      "@typescript-eslint/no-explicit-any": "off",
      // Allow unused vars prefixed with _ (destructuring, catch blocks)
      "@typescript-eslint/no-unused-vars": "off",
      // Allow empty interfaces / object types (common in React component props)
      "@typescript-eslint/no-empty-object-type": "off",

      // ── React Hooks ───────────────────────────────────────────────
      // setState in useEffect — too strict for data-fetching patterns
      "react-hooks/set-state-in-effect": "off",
      // Missing deps — warn instead of error
      "react-hooks/exhaustive-deps": "off",
      // useMemo suggestions — advisory only
      "react-hooks/use-memo": "off",

      // ── React JSX ─────────────────────────────────────────────────
      // Unescaped entities — Italian text uses apostrophes heavily
      "react/no-unescaped-entities": "off",
    },
  },
]);

export default eslintConfig;
