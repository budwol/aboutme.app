// Jest's counterpart to publicEnv.ts (mapped in via jest.config.cjs's
// moduleNameMapper), since Jest's CommonJS runtime can't parse
// `import.meta` at all.
export function readPublicEnv(key: string): string | undefined {
  return process.env[key];
}

export function isDevMode(): boolean {
  return process.env.NODE_ENV !== "production";
}
