// Vite only inlines `import.meta.env.X` for vars matching its `envPrefix`
// (see vite.config.ts), and only in files it bundles for the browser --
// this indirection exists so the two or three call sites needing a
// runtime env var don't each depend on `import.meta` directly, which
// Jest's CommonJS runtime can't parse at all (see publicEnv.jest.ts,
// mapped in via jest.config.cjs's moduleNameMapper).
export function readPublicEnv(key: string): string | undefined {
  return import.meta.env[key];
}

export function isDevMode(): boolean {
  return import.meta.env.DEV;
}
