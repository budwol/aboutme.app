module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.[jt]sx?$": [
      "ts-jest",
      { tsconfig: { module: "commonjs", allowJs: true } },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(htmlparser2|domutils|domhandler|entities|domelementtype|dom-serializer|launder)/)",
  ],
  setupFiles: ["<rootDir>/jest.setup.cjs"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@tests/(.*)$": "<rootDir>/tests/$1",
    "^@assets/(.*)$": "<rootDir>/assets/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@constants/(.*)$": "<rootDir>/src/constants/$1",
    "^@utils/publicEnv$": "<rootDir>/src/utils/publicEnv.jest.ts",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^wna-logger$": "<rootDir>/src/utils/logger.ts",
  },
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "<rootDir>/tests/e2e/",
    "/playwright-report/",
    "/test-results/",
  ],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/utils/publicEnv.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      lines: 100,
      functions: 100,
      statements: 100,
    },
  },
};
