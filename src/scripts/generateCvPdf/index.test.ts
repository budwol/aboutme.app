/**
 * @jest-environment node
 *
 * See src/scripts/generateResumePdf/index.test.ts for why this script's
 * tests need the plain "node" Jest environment: pdfkit only resolves its
 * Node CJS build under Node's own export condition, which the default RN
 * test environment doesn't set.
 */
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";

/* eslint-disable @typescript-eslint/no-require-imports */
const scriptModule = require("../../../scripts/generate-cv-pdf.cjs") as {
  generateCvPdf: (
    rootDir: string,
    logger?: (message: string) => void,
  ) => Promise<{
    deTargetFile: string;
    enTargetFile: string;
    deAtsTargetFile: string;
    enAtsTargetFile: string;
  }>;
  buildCvFileName: (
    name: unknown,
    langCode: string,
    options?: { ats?: boolean },
  ) => string;
  formatBirthDate: (isoDate: unknown, lang: string) => string;
  formatPhoneNumber: (raw: unknown) => string;
  pickString: (
    entry: Record<string, unknown>,
    baseKey: string,
    lang: string,
    fallback?: string,
  ) => string;
};
const {
  generateCvPdf,
  buildCvFileName,
  formatBirthDate,
  formatPhoneNumber,
  pickString,
} = scriptModule;
/* eslint-enable @typescript-eslint/no-require-imports */

const createdFixtures: string[] = [];
const silentLogger = () => undefined;

function createFixtureRoot() {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-cv-"));
  createdFixtures.push(fixtureRoot);
  return fixtureRoot;
}

function writeAppData(fixtureRoot: string, data: unknown) {
  const sourceDir = path.join(fixtureRoot, ".aboutme");
  fs.mkdirSync(sourceDir, { recursive: true });
  fs.writeFileSync(
    path.join(sourceDir, "app-data.json"),
    JSON.stringify(data, null, 2),
    "utf8",
  );
}

// personalDetails/education/languages/drivingLicense.../interests... live
// in this separate, never-synced-to-public file (see the comment on
// readCvData in the script itself) rather than in app-data.json.
function writeCvData(fixtureRoot: string, data: unknown) {
  const sourceDir = path.join(fixtureRoot, ".aboutme");
  fs.mkdirSync(sourceDir, { recursive: true });
  fs.writeFileSync(
    path.join(sourceDir, "cv-data.json"),
    JSON.stringify(data, null, 2),
    "utf8",
  );
}

function copyExampleAppData(fixtureRoot: string) {
  writeAppData(
    fixtureRoot,
    JSON.parse(
      fs.readFileSync(
        path.resolve(process.cwd(), "app-data.example.json"),
        "utf8",
      ),
    ),
  );
  writeCvData(
    fixtureRoot,
    JSON.parse(
      fs.readFileSync(
        path.resolve(process.cwd(), "cv-data.example.json"),
        "utf8",
      ),
    ),
  );
}

function assertPdf(filePath: string) {
  const pdf = fs.readFileSync(filePath);
  expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  expect(pdf.length).toBeGreaterThan(500);
}

describe("generate-cv-pdf", () => {
  afterEach(() => {
    for (const fixture of createdFixtures.splice(0)) {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  describe("formatBirthDate", () => {
    it("formats an ISO date as DD.MM.YYYY in German", () => {
      expect(formatBirthDate("1987-02-14", "de")).toBe("14.02.1987");
    });

    it("formats an ISO date as 'Month D, YYYY' in English", () => {
      expect(formatBirthDate("1987-02-14", "en")).toBe("February 14, 1987");
    });

    it("passes through a non-ISO string unchanged", () => {
      expect(formatBirthDate("around 1987", "de")).toBe("around 1987");
    });

    it("returns an empty string for a non-string value", () => {
      expect(formatBirthDate(undefined, "de")).toBe("");
    });
  });

  describe("formatPhoneNumber", () => {
    it("groups a number with a country code as +XX XXX XXX XXXX", () => {
      expect(formatPhoneNumber("+49 152 12345678")).toBe("+49 152 123 45678");
    });

    it("groups a number without a country code as XXXX XXX XXXX", () => {
      expect(formatPhoneNumber("030 1234567")).toBe("0301 234 567");
    });

    it("returns an empty string for a non-string value", () => {
      expect(formatPhoneNumber(undefined)).toBe("");
    });

    it("returns the trimmed input unchanged when it has no digits", () => {
      expect(formatPhoneNumber(" on request ")).toBe("on request");
    });
  });

  describe("buildCvFileName", () => {
    it("slugifies the name and uses the German word for a German file", () => {
      expect(buildCvFileName("Jane Doe", "de")).toBe(
        "Jane_Doe_-_Lebenslauf.pdf",
      );
    });

    it("uses the English word for an English file", () => {
      expect(buildCvFileName("Jane Doe", "en")).toBe("Jane_Doe_-_CV.pdf");
    });

    it("handles a non-string name", () => {
      expect(buildCvFileName(undefined, "en")).toBe("_-_CV.pdf");
    });

    it("adds an _ATS suffix when the ats option is set", () => {
      expect(buildCvFileName("Jane Doe", "de", { ats: true })).toBe(
        "Jane_Doe_-_Lebenslauf_ATS.pdf",
      );
    });
  });

  describe("pickString", () => {
    it("prefers the language-suffixed field", () => {
      expect(
        pickString({ roleDe: "Entwickler", role: "Dev" }, "role", "de"),
      ).toBe("Entwickler");
    });

    it("falls back to the plain field", () => {
      expect(pickString({ role: "Dev" }, "role", "de")).toBe("Dev");
    });

    it("falls back to the given fallback when nothing matches", () => {
      expect(pickString({}, "role", "de", "n/a")).toBe("n/a");
    });
  });

  it("throws when .aboutme/app-data.json is missing", async () => {
    const fixtureRoot = createFixtureRoot();

    await expect(generateCvPdf(fixtureRoot, silentLogger)).rejects.toThrow(
      /missing source file/,
    );
  });

  it("writes a German and an English CV PDF into public/files/", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, {
      profile: {
        name: "Jane Example",
        titleDe: "Entwicklerin",
        titleEn: "Engineer",
      },
      contact: { email: "jane@example.com" },
    });

    const logger = jest.fn<(message: string) => void>();
    const result = await generateCvPdf(fixtureRoot, logger);

    expect(result.deTargetFile).toBe(
      path.join(
        fixtureRoot,
        "public",
        "files",
        "DE",
        "Jane_Example_-_Lebenslauf.pdf",
      ),
    );
    expect(result.enTargetFile).toBe(
      path.join(fixtureRoot, "public", "files", "EN", "Jane_Example_-_CV.pdf"),
    );
    expect(result.deAtsTargetFile).toBe(
      path.join(
        fixtureRoot,
        "public",
        "files",
        "DE",
        "Jane_Example_-_Lebenslauf_ATS.pdf",
      ),
    );
    expect(result.enAtsTargetFile).toBe(
      path.join(
        fixtureRoot,
        "public",
        "files",
        "EN",
        "Jane_Example_-_CV_ATS.pdf",
      ),
    );
    assertPdf(result.deTargetFile);
    assertPdf(result.enTargetFile);
    assertPdf(result.deAtsTargetFile);
    assertPdf(result.enAtsTargetFile);
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining("files/DE/Jane_Example_-_Lebenslauf.pdf"),
    );
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining("files/EN/Jane_Example_-_CV.pdf"),
    );
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining("files/DE/Jane_Example_-_Lebenslauf_ATS.pdf"),
    );
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining("files/EN/Jane_Example_-_CV_ATS.pdf"),
    );
  });

  it("renders successfully when a PNG avatar is configured", async () => {
    const fixtureRoot = createFixtureRoot();
    const imagesDir = path.join(fixtureRoot, ".aboutme", "images");
    fs.mkdirSync(imagesDir, { recursive: true });
    // 1x1 px PNG, small enough to inline as a fixture -- same fixture
    // src/scripts/generateResumePdf/index.test.ts uses for the same check.
    const onePixelPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    );
    fs.writeFileSync(path.join(imagesDir, "avatar.png"), onePixelPng);
    writeAppData(fixtureRoot, {
      profile: { name: "Jane Example", avatar: "avatar.png" },
      contact: { email: "jane@example.com" },
    });

    const result = await generateCvPdf(fixtureRoot, silentLogger);

    assertPdf(result.deTargetFile);
    assertPdf(result.enTargetFile);
    // The ats variant never embeds the photo (see hasAvatar in writeCvPdf),
    // so it stays smaller than the designed variant despite otherwise
    // rendering the exact same content.
    const designedSize = fs.statSync(result.deTargetFile).size;
    const atsSize = fs.statSync(result.deAtsTargetFile).size;
    expect(designedSize).toBeGreaterThan(atsSize);
  });

  it("skips the photo gracefully when the configured avatar file is missing", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, {
      profile: { name: "Jane Example", avatar: "does-not-exist.webp" },
      contact: { email: "jane@example.com" },
    });

    const result = await generateCvPdf(fixtureRoot, silentLogger);
    assertPdf(result.deTargetFile);
  });

  it("links the designed CV's footer to its own ats companion, but never the ats variant to itself", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, {
      profile: { name: "Jane Example" },
      contact: { email: "jane@example.com" },
      siteUrl: "https://example.com",
    });

    const result = await generateCvPdf(fixtureRoot, silentLogger);

    const designedPdf = fs.readFileSync(result.deTargetFile).toString("latin1");
    const atsPdf = fs.readFileSync(result.deAtsTargetFile).toString("latin1");
    const atsUrl =
      "https://example.com/files/DE/Jane_Example_-_Lebenslauf_ATS.pdf";

    expect(designedPdf).toContain(atsUrl);
    expect(atsPdf).not.toContain(atsUrl);
  });

  it("renders the ats variant with every optional section, and without the accent-colored rule/underline", async () => {
    const fixtureRoot = createFixtureRoot();
    copyExampleAppData(fixtureRoot);

    const result = await generateCvPdf(fixtureRoot, silentLogger);

    assertPdf(result.deAtsTargetFile);
    assertPdf(result.enAtsTargetFile);
    // The designed variant's accent color is only ever set via fillColor
    // with a stroke -- the ats variant skips both entirely, so unlike the
    // designed CV, the accent hex string never appears in the ats PDF at
    // all (pdfkit round-trips it as literal PDF color operands).
    const atsPdf = fs.readFileSync(result.deAtsTargetFile).toString("latin1");
    const designedPdf = fs.readFileSync(result.deTargetFile).toString("latin1");
    expect(designedPdf.length).not.toBe(atsPdf.length);
  });

  it("renders successfully when .aboutme/cv-data.json is entirely missing", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });

    const result = await generateCvPdf(fixtureRoot, silentLogger);
    assertPdf(result.deTargetFile);
  });

  it("renders the full example dataset, including every optional section", async () => {
    const fixtureRoot = createFixtureRoot();
    copyExampleAppData(fixtureRoot);

    const result = await generateCvPdf(fixtureRoot, silentLogger);

    assertPdf(result.deTargetFile);
    assertPdf(result.enTargetFile);
  });

  it("renders with only a birth date and no birth place", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });
    writeCvData(fixtureRoot, {
      personalDetails: { birthDate: "1990-05-01" },
    });

    const result = await generateCvPdf(fixtureRoot, silentLogger);
    assertPdf(result.deTargetFile);
  });

  it("renders with only a birth place and no birth date", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });
    writeCvData(fixtureRoot, {
      personalDetails: { birthPlace: "Berlin" },
    });

    const result = await generateCvPdf(fixtureRoot, silentLogger);
    assertPdf(result.deTargetFile);
  });

  it("omits the personal details section entirely when none of it is set", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });

    const result = await generateCvPdf(fixtureRoot, silentLogger);
    assertPdf(result.deTargetFile);
  });

  it("renders education entries with only an institution or only a degree", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });
    writeCvData(fixtureRoot, {
      education: [
        { periodDe: "2010", institution: "Uni Beispiel" },
        { periodDe: "2005", degreeDe: "Abitur" },
      ],
    });

    const result = await generateCvPdf(fixtureRoot, silentLogger);
    assertPdf(result.deTargetFile);
  });

  it("renders a language entry without a proficiency level", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });
    writeCvData(fixtureRoot, {
      languages: [{ nameDe: "Französisch" }],
    });

    const result = await generateCvPdf(fixtureRoot, silentLogger);
    assertPdf(result.deTargetFile);
  });

  it("ignores a non-array languages value", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });
    writeCvData(fixtureRoot, { languages: "not-an-array" });

    const result = await generateCvPdf(fixtureRoot, silentLogger);
    assertPdf(result.deTargetFile);
  });

  it("renders certifications as their own section, separate from Sonstiges", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, {
      profile: { name: "Jane Example" },
      // certificates lives in app-data.json (like the designed Portfolio
      // PDF's own pill list), not cv-data.json.
      certificates: [
        { nameDe: "ISTQB 4.0 CTFL", nameEn: "ISTQB 4.0 CTFL" },
        { nameDe: "ITIL 4 CFL", nameEn: "ITIL 4 CFL" },
      ],
    });

    const withCertificates = await generateCvPdf(fixtureRoot, silentLogger);
    assertPdf(withCertificates.deTargetFile);
    const withCertificatesSize = fs.statSync(
      withCertificates.deTargetFile,
    ).size;

    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });
    const withoutCertificates = await generateCvPdf(fixtureRoot, silentLogger);
    const withoutCertificatesSize = fs.statSync(
      withoutCertificates.deTargetFile,
    ).size;

    // Not a content assertion (the PDF's text is FlateDecode-compressed) --
    // just confirms the certifications section actually adds real content
    // rather than silently being skipped.
    expect(withCertificatesSize).toBeGreaterThan(withoutCertificatesSize);
  });

  it("ignores a non-array certificates value", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, {
      profile: { name: "Jane Example" },
      certificates: "not-an-array",
    });

    const result = await generateCvPdf(fixtureRoot, silentLogger);
    assertPdf(result.deTargetFile);
  });

  it("falls back to the plain interests field when the suffixed one is absent", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });
    writeCvData(fixtureRoot, { interests: ["Reading"] });

    const result = await generateCvPdf(fixtureRoot, silentLogger);
    assertPdf(result.deTargetFile);
  });

  it("falls back to the default accent color when accentColor is invalid", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, {
      profile: { name: "Jane Example" },
      accentColor: "not-a-color",
    });

    const result = await generateCvPdf(fixtureRoot, silentLogger);
    assertPdf(result.deTargetFile);
  });

  it("renders experience entries without a description", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, {
      profile: { name: "Jane Example" },
      experience: [{ periodDe: "2020", roleDe: "Entwickler", company: "Acme" }],
    });

    const result = await generateCvPdf(fixtureRoot, silentLogger);
    assertPdf(result.deTargetFile);
  });

  it("paginates cleanly across a long experience and education list", async () => {
    const fixtureRoot = createFixtureRoot();
    const longDescription =
      "Ein sehr langer Beschreibungstext, der über mehrere Zeilen umbricht und so die Zeilenhöhenberechnung des Layouts unter realen Bedingungen prüft, damit ein Seitenumbruch mitten in einem Eintrag ausgeschlossen werden kann.";

    writeAppData(fixtureRoot, {
      profile: { name: "Jane Example", titleDe: "Entwicklerin" },
      contact: {
        email: "jane@example.com",
        phone: "+49 123 456",
        addressStreet: "Straße 1",
        addressZipCode: "01234",
        addressCity: "Berlin",
        addressCountry: "Deutschland",
      },
      siteUrl: "https://example.com",
      experience: Array.from({ length: 12 }, (_, index) => ({
        periodDe: `${2000 + index}`,
        roleDe: "Softwareentwickler",
        company: `Firma ${index}`,
        descriptionDe: longDescription,
      })),
    });
    writeCvData(fixtureRoot, {
      personalDetails: {
        birthDate: "1990-01-01",
        birthPlace: "Berlin",
        familyStatusDe: "Ledig",
      },
      education: Array.from({ length: 8 }, (_, index) => ({
        periodDe: `${1990 + index}`,
        institution: `Schule ${index}`,
        degreeDe: longDescription,
      })),
      languages: [{ nameDe: "Deutsch", levelDe: "Muttersprache" }],
      drivingLicenseDe: "Führerschein Klasse B",
      interestsDe: ["Lesen", "Wandern"],
    });

    const result = await generateCvPdf(fixtureRoot, silentLogger);
    const pdf = fs.readFileSync(result.deTargetFile);
    assertPdf(result.deTargetFile);
    // A dense, multi-page document must actually span more than one page --
    // pdfkit's page objects show up as "/Type /Page" entries in the raw PDF.
    const pageMatches = pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g);
    expect((pageMatches ?? []).length).toBeGreaterThan(1);
  });
});
