/**
 * @jest-environment node
 *
 * Requiring scripts/generate-resume-pdf.cjs pulls in pdfkit at module load
 * time even though this file only exercises its pure filename helper — see
 * src/scripts/generateResumePdf/index.test.ts for why that forces a plain
 * Node environment.
 */
import { afterEach, describe, expect, it } from "@jest/globals";
import { getResumePdfUrl } from "@utils/resumePdfUrl";

/* eslint-disable @typescript-eslint/no-require-imports */
const nodeUtil = require("util") as typeof import("util");
(globalThis as { TextDecoder: unknown }).TextDecoder = nodeUtil.TextDecoder;
(globalThis as { TextEncoder: unknown }).TextEncoder = nodeUtil.TextEncoder;

const { buildPortfolioFileName } =
  require("../../../scripts/generate-resume-pdf.cjs") as {
    buildPortfolioFileName: (
      name: string,
      langCode: "de" | "en",
      options?: { ats?: boolean },
    ) => string;
  };
/* eslint-enable @typescript-eslint/no-require-imports */

// generate-resume-pdf.cjs (ADR 0002/0010) and src/utils/resumePdfUrl both
// slug a profile name into a filename, reimplemented independently on
// either side of the build-script/app-runtime boundary rather than shared
// (ADR 0010 makes that same call for the De/En fallback convention). This
// doesn't test either implementation's internals — it only guards against
// the one thing that boundary can't enforce itself: the two ever disagreeing
// on the filename for the same name, which would silently break the
// website's download link or the PDF's own footer link to itself.
describe("resume PDF filename consistency", () => {
  const originalDeployVersion = process.env.EXPO_PUBLIC_DEPLOY_VERSION;

  afterEach(() => {
    if (originalDeployVersion === undefined) {
      delete process.env.EXPO_PUBLIC_DEPLOY_VERSION;
      return;
    }

    process.env.EXPO_PUBLIC_DEPLOY_VERSION = originalDeployVersion;
  });

  it.each(["Wolf Budgenhagen", "Björn Müller-Straße", "Anne O'Connor (Dr.)"])(
    "agrees with the website's download URL for %s",
    (name) => {
      delete process.env.EXPO_PUBLIC_DEPLOY_VERSION;

      for (const lang of ["de", "en"] as const) {
        expect(getResumePdfUrl(lang, name)).toBe(
          `/${buildPortfolioFileName(name, lang)}`,
        );
      }
    },
  );
});
