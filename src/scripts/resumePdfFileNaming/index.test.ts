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

const {
  buildAtsSkillList,
  buildAtsSoftSkillList,
  buildGoogleMapsUrl,
  buildLocalizedNameList,
  buildPortfolioFileName,
  buildSkillEntries,
  formatPhoneNumber,
  groupDigits,
  limitEntryTechstack,
  pickString,
  pickStringArray,
  slugifyName,
} = require("../../../scripts/generate-resume-pdf.cjs") as {
  buildPortfolioFileName: (
    name: string,
    langCode: "de" | "en",
    options?: { ats?: boolean },
  ) => string;
  buildAtsSkillList: (group: unknown, levels?: unknown) => unknown[];
  buildAtsSoftSkillList: (skills: unknown, lang: string) => unknown[];
  buildGoogleMapsUrl: (parts: string[]) => string | undefined;
  buildLocalizedNameList: (items: unknown, lang: string) => string[];
  buildSkillEntries: (
    group: unknown,
    levels?: unknown,
    limits?: unknown,
  ) => unknown[];
  formatPhoneNumber: (value: unknown) => string;
  groupDigits: (digits: string, sizes: number[]) => string[];
  limitEntryTechstack: (items: string[]) => string[];
  pickString: (
    entry: Record<string, unknown>,
    baseKey: string,
    lang: string,
    fallback?: string,
  ) => string;
  pickStringArray: (
    entry: Record<string, unknown>,
    baseKey: string,
    lang: string,
  ) => unknown[];
  slugifyName: (name: unknown) => string;
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

describe("resume PDF data helpers", () => {
  it("resolves localized strings and arrays with fallbacks", () => {
    expect(pickString({ titleDe: " Deutsch " }, "title", "de")).toBe(
      " Deutsch ",
    );
    expect(pickString({ title: "Plain" }, "title", "en")).toBe("Plain");
    expect(pickString({}, "title", "en", "Fallback")).toBe("Fallback");
    expect(
      pickStringArray({ descriptionDe: ["Deutsch"] }, "description", "de"),
    ).toEqual(["Deutsch"]);
    expect(
      pickStringArray({ descriptionEn: "English" }, "description", "en"),
    ).toEqual(["English"]);
    expect(
      pickStringArray({ description: ["Plain"] }, "description", "en"),
    ).toEqual(["Plain"]);
    expect(pickStringArray({}, "description", "en")).toEqual([]);
  });

  it("normalizes phone numbers and digit groups at their edge lengths", () => {
    expect(formatPhoneNumber(undefined)).toBe("");
    expect(formatPhoneNumber("---")).toBe("---");
    expect(formatPhoneNumber("+49 123 4567890")).toBe("+49 123 456 7890");
    expect(formatPhoneNumber("12345678901")).toBe("1234 567 8901");
    expect(groupDigits("1234567891", [3, 3, 3])).toEqual([
      "123",
      "456",
      "7891",
    ]);
    expect(groupDigits("12345678912", [3, 3, 3])).toEqual([
      "123",
      "456",
      "78912",
    ]);
    expect(groupDigits("123456789123", [3, 3, 3])).toEqual([
      "123",
      "456",
      "789",
      "123",
    ]);
  });

  it("builds skill and localized lists with defaults and limits", () => {
    expect(
      buildSkillEntries(
        { primary: ["TypeScript", "React"], secondary: ["Go"] },
        { TypeScript: "expert" },
        { primaryLimit: 1, secondaryLimit: 1, totalLimit: 2 },
      ),
    ).toEqual([
      { label: "TypeScript", ratio: 1 },
      { label: "Go", ratio: 0.6 },
    ]);
    expect(buildSkillEntries({}, undefined, undefined)).toEqual([]);
    expect(
      buildAtsSkillList({ primary: ["TypeScript"], secondary: ["Go"] }),
    ).toEqual([
      { name: "TypeScript", level: "mid" },
      { name: "Go", level: "mid" },
    ]);
    expect(
      buildAtsSoftSkillList(
        { primary: [{ nameEn: "Clear", level: "expert" }] },
        "en",
      ),
    ).toEqual([{ name: "Clear", level: "expert" }]);
    expect(buildLocalizedNameList([{ nameDe: "Klar" }], "en")).toEqual([
      "Klar",
    ]);
    expect(limitEntryTechstack(["A", "B", "C", "D", "E", "F"])).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
      "…",
    ]);
    expect(limitEntryTechstack(["A"])).toEqual(["A"]);
  });

  it("builds safe URLs and filesystem-safe names", () => {
    expect(buildGoogleMapsUrl([])).toBeUndefined();
    expect(buildGoogleMapsUrl(["Straße 1", "01234 Berlin"])).toBe(
      "https://www.google.com/maps/search/?api=1&query=Stra%C3%9Fe%201%2C%2001234%20Berlin",
    );
    expect(slugifyName(null)).toBe("");
    expect(slugifyName(" Björn Müller-Straße ")).toBe("Bjoern_Mueller-Strasse");
    expect(slugifyName("Anne O'Connor (Dr.)")).toBe("Anne_OConnor_Dr");
  });
});
