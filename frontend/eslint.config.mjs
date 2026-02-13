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
    // Test scripts (development only)
    "**/*.test.js",
    "**/check-*.js",
    "**/test-*.js",
    "**/*-test.js",
    "**/comprehensive-test.js",
    "**/final-qa-test.js",
    "**/quick-qa-test.js",
    "**/qa-install-test.js",
    "**/puppeteer-control.js",
  ]),
  {
    rules: {
      // Allow setState in effects for initial state setup
      'react-hooks/set-state-in-effect': 'off',
      // Allow some unused vars for future use
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true
      }],
    },
  },
]);

export default eslintConfig;
