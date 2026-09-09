# Architecture Decision Records

This directory captures decisions already made in this codebase that weren't written down anywhere. They were reconstructed from the existing implementation, not designed fresh — treat them as documentation of established conventions, not as a design proposal.

Format: lightweight ADR (Context / Decision / Consequences). New ADRs get the next sequential number.

| ADR                                                             | Title                                                                                  |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [0001](0001-private-content-outside-version-control.md)         | Private/personal content lives outside version control and is synced at build time     |
| [0002](0002-build-scripts-as-commonjs-with-typescript-tests.md) | Build and deploy tooling is plain CommonJS, tested from TypeScript specs               |
| [0003](0003-bilingual-content-via-suffixed-fields.md)           | Bilingual content is authored as suffixed fields and normalized at runtime             |
| [0004](0004-centralized-i18n-key-registry.md)                   | Centralized i18n key registry backs all translation lookups                            |
| [0005](0005-wna-component-module-convention.md)                 | Components follow a `WnaXxx` directory-with-barrel convention                          |
| [0006](0006-cache-busted-static-assets.md)                      | Static local assets are cache-busted via a deploy version query param                  |
| [0007](0007-deploy-scripts-guard-destructive-actions.md)        | Deploy scripts guard destructive actions behind confirmation, dry-run, and path checks |
| [0008](0008-dev-only-console-logging.md)                        | Console logging is dev-only; production logging is a no-op facade                      |
| [0009](0009-ci-as-chained-reusable-workflows.md)                | CI is split into single-concern reusable workflows chained by `needs`                  |
| [0010](0010-build-time-resume-pdf-generation.md)                | A condensed resume PDF is generated at build time from the same source data            |
| [0011](0011-ats-safe-resume-variant.md)                         | A separate, single-column resume variant is generated for ATS pipelines                |
| [0012](0012-react-test-renderer-for-component-tests.md)         | Component tests use `react-test-renderer`, not `@testing-library/react-native`         |
