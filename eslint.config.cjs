const { FlatCompat } = require("@eslint/eslintrc");
const compat = new FlatCompat();
module.exports = [
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    ignores: ["dist", "build", "node_modules", ".expo", ".expo-shared"],
  },
  ...compat.extends("expo", "prettier"),
  {
    languageOptions: {
      parser: require("@typescript-eslint/parser"),
    },
    plugins: {
      "@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
    },
    rules: {
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
    },
  },
  {
    // Enforces the layering documented in ADR 15: foundational modules never
    // depend upward on state/UI/routing, state never depends on UI/routing,
    // and UI/routing never depends on the route files that mount them.
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      import: require("eslint-plugin-import"),
    },
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
              from: [
                "./src/state",
                "./src/components",
                "./src/navigation",
                "./src/app",
              ],
              message:
                "Foundational modules (utils/constants/app-data/storage/theme/i18n) must not depend on state/, components/, navigation/, or app/ — see ADR 15.",
            },
            {
              target: "./src/state",
              from: ["./src/components", "./src/navigation", "./src/app"],
              message:
                "src/state/ must not depend on components/, navigation/, or app/ — see ADR 15.",
            },
            {
              target: ["./src/components", "./src/navigation"],
              from: "./src/app",
              message:
                "components/ and navigation/ must not depend on app/ — Expo Router route files mount these, not the other way around.",
            },
          ],
        },
      ],
    },
  },
];
