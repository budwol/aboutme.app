---
name: data-contract
description: Maintain and verify JSON data contracts, example datasets, normalization rules, generated copies, localized fields, and fixture consistency.
---

# Data Contract

Use this skill when application data, example fixtures, generated runtime copies, schemas, localization fields, or data migrations change.

## Workflow

1. Identify the source of truth, generated artifacts, consumers, normalization rules, and test fixtures.
2. Compare the current data shape against types, defaults, serializers, renderers, build scripts, and examples.
3. Check required fields, optional fallbacks, localized variants, array/object types, URLs, asset references, and unknown-field behavior.
4. Keep tracked example data representative but anonymized; never copy private runtime data into version control.
5. Add schema and drift tests that fail when examples, fixtures, or generated copies become stale.
6. Test malformed, partial, empty, legacy, and mixed-language input.
7. Regenerate derived artifacts through the project scripts and verify they contain the intended source data.
