const js = require("@eslint/js");
const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const importPlugin = require("eslint-plugin-import");
const reactPlugin = require("eslint-plugin-react");
const reactHooksPlugin = require("eslint-plugin-react-hooks");

module.exports = [
  {
    ignores: [
      "dist",
      "build",
      "node_modules",
      "coverage",
      "playwright-report",
      "test-results",
    ],
  },
  js.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  reactPlugin.configs.flat.recommended,
  {
    files: ["**/*.{cjs,mjs,js,jsx,ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      eqeqeq: ["warn", "smart"],
      "no-var": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // False-positive prone against libraries whose default export also
      // happens to carry a same-named member (e.g. i18next's `use`).
      "import/no-named-as-default-member": "off",
    },
  },
  {
    // TypeScript itself catches undefined-variable errors (and does so
    // more accurately, e.g. across ambient/global declarations), so
    // no-undef is redundant and prone to false positives here. `.cjs`
    // scripts have no ESM alternative to require(), so no-require-imports
    // only makes sense for TypeScript source.
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-require-imports": "warn",
    },
  },
  {
    // Enforces the layering documented in ADR 15: foundational modules never
    // depend upward on state/UI/routing, state never depends on UI/routing,
    // and UI/routing never depends on the route files that mount them.
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: [
                "./src/utils",
                "./src/constants",
                "./src/app-data",
                "./src/storage",
                "./src/theme",
                "./src/i18n",
              ],
              from: ["./src/state", "./src/components", "./src/navigation"],
              message:
                "Foundational modules (utils/constants/app-data/storage/theme/i18n) must not depend on state/, components/, or navigation/ — see ADR 15.",
            },
            {
              target: "./src/state",
              from: ["./src/components", "./src/navigation"],
              message:
                "src/state/ must not depend on components/ or navigation/ — see ADR 15.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["scripts/**/*.{cjs,mjs,js}"],
    ignores: ["scripts/web-service-worker.js"],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      "no-console": "off",
    },
  },
  {
    // Runs as a browser Service Worker, not in Node.
    files: ["scripts/web-service-worker.js"],
    languageOptions: {
      globals: globals.serviceworker,
    },
    rules: {
      "no-console": "off",
    },
  },
];
