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
];
