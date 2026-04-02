module.exports = {
  preset: "jest-expo",
  setupFiles: ["<rootDir>/jest.setup.cjs"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@tests/(.*)$": "<rootDir>/tests/$1",
    "^@app/(.*)$": "<rootDir>/src/app/$1",
    "^@assets/(.*)$": "<rootDir>/assets/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@secrets/(.*)$": "<rootDir>/secrets/$1",
    "^wna-logger$": "<rootDir>/src/utils/logger.ts",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "<rootDir>/tests/e2e/",
    "/playwright-report/",
    "/test-results/",
  ],
};
