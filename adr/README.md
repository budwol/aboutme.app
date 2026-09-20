# Architecture Decision Records

This directory captures decisions already made in this codebase that weren't written down anywhere. They were reconstructed from the existing implementation, not designed fresh — treat them as documentation of established conventions, not as a design proposal.

Format: concise ADR (Context / Decision / Consequences). Keep each record focused on the decision and its practical consequence; omit implementation history and unnecessary detail. New ADRs get the next sequential number.

| ADR                                                             | Title                                                                                    |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| [0001](0001-private-content-outside-version-control.md)         | Private/personal content lives outside version control and is synced at build time       |
| [0002](0002-build-scripts-as-commonjs-with-typescript-tests.md) | Build and deploy tooling is plain CommonJS, tested from TypeScript specs                 |
| [0003](0003-bilingual-content-via-suffixed-fields.md)           | Bilingual content is authored as suffixed fields and normalized at runtime               |
| [0004](0004-centralized-i18n-key-registry.md)                   | Centralized i18n key registry backs all translation lookups                              |
| [0005](0005-wna-component-module-convention.md)                 | Components follow a `WnaXxx` directory-with-barrel convention                            |
| [0006](0006-cache-busted-static-assets.md)                      | Static local assets are cache-busted via a deploy version query param                    |
| [0007](0007-deploy-scripts-guard-destructive-actions.md)        | Deploy scripts guard destructive actions behind confirmation, dry-run, and path checks   |
| [0008](0008-dev-only-console-logging.md)                        | Console logging is dev-only; production logging is a no-op facade                        |
| [0009](0009-ci-as-chained-reusable-workflows.md)                | CI is split into single-concern reusable workflows chained by `needs`                    |
| [0010](0010-build-time-resume-pdf-generation.md)                | A condensed resume PDF is generated at build time from the same source data              |
| [0011](0011-ats-safe-resume-variant.md)                         | A separate, single-column resume variant is generated for ATS pipelines                  |
| [0012](0012-react-test-renderer-for-component-tests.md)         | Component tests use `react-test-renderer`, not `@testing-library/react-native`           |
| [0013](0013-100-percent-line-and-branch-coverage-target.md)     | 100% coverage is the target, enforced via `coverageThreshold`                            |
| [0014](0014-wna-side-file-naming-convention.md)                 | Non-component side-files (types/styles/state) are `camelCase`, prefixed with their owner |
| [0015](0015-app-wide-state-lives-outside-components.md)         | App-wide state lives in `src/state/`, separate from `src/components/`                    |
| [0016](0016-layer-boundaries-enforced-by-lint-and-ci.md)        | Layer boundaries are enforced by ESLint and a CI circular-dependency gate                |
| [0017](0017-naming-avoids-c-java-conventions.md)                | Naming avoids C#/Java conventions; overlapping type names are disambiguated by owner     |
| [0018](0018-clear-metro-cache-on-export.md)                     | `export:web` always clears the Metro bundler cache                                       |
| [0019](0019-splash-shell-and-intro-overlay-must-match.md)       | The static splash shell and the app's intro overlay must match                           |
| [0020](0020-commit-message-convention.md)                       | Commit messages use professional one-line Gitmoji descriptions                           |
| [0021](0021-production-source-maps-are-not-published.md)        | Production web builds do not publish source maps                                         |
| [0022](0022-csp-relies-on-self-only.md)                         | CSP relies on 'self' only, with no host or wildcard subdomain allowance                  |
| [0023](0023-explicit-cache-control-on-uncached-root-files.md)   | Root files not covered by the hashed-asset rule get an explicit Cache-Control            |
