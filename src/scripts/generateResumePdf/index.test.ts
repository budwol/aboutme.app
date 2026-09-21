/**
 * @jest-environment node
 *
 * pdfkit's package exports only resolve the Node CJS build under the
 * "node" export condition. The project's default jsdom test environment
 * omits that condition and falls back to its ESM browser bundle, which
 * Jest can't parse. This script only ever runs under plain Node, so a
 * plain node test environment matches how it's actually executed.
 */
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import fs from "fs";
import os from "os";
import path from "path";

/* eslint-disable @typescript-eslint/no-require-imports */

const { generateResumePdf } =
  require("../../../scripts/generate-resume-pdf.cjs") as {
    generateResumePdf: (
      rootDir: string,
      logger?: (message: string) => void,
    ) => Promise<{
      deTargetFile: string;
      enTargetFile: string;
      deAtsTargetFile: string;
      enAtsTargetFile: string;
    }>;
  };
/* eslint-enable @typescript-eslint/no-require-imports */

const createdFixtures: string[] = [];
const silentLogger = () => undefined;

function createFixtureRoot() {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "aboutme-resume-"));
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
}

describe("generate-resume-pdf", () => {
  afterEach(() => {
    for (const fixture of createdFixtures.splice(0)) {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  it("throws when .aboutme/app-data.json is missing", async () => {
    const fixtureRoot = createFixtureRoot();

    await expect(generateResumePdf(fixtureRoot, silentLogger)).rejects.toThrow(
      /missing source file/,
    );
  });

  it("writes a German and an English resume PDF into public/", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, {
      accentColor: "#61afa7",
      profile: {
        name: "Jane Example",
        titleDe: "Softwareentwicklerin",
        titleEn: "Software Engineer",
        descriptionDe: ["Zeile 1", "Zeile 2"],
        descriptionEn: ["Line 1", "Line 2"],
      },
      techStack: {
        primary: ["TypeScript", "React"],
        secondary: ["Go"],
      },
      experience: [
        {
          periodDe: "seit 2020",
          periodEn: "since 2020",
          roleDe: "Entwicklerin",
          roleEn: "Developer",
          company: "Cool Company",
          companyUrl: "https://cool-company.example.com",
          descriptionDe: "Baute Dinge und hielt sie am Laufen.",
          descriptionEn: "Built things and kept them running.",
          detailsDe: ["Detail 1", "Detail 2"],
          detailsEn: ["Detail 1", "Detail 2"],
          techstack: ["TypeScript", "Docker"],
        },
      ],
      contact: {
        phone: "+49 123 456",
        email: "jane@example.com",
        addressStreet: "Straße 1",
        addressZipCode: "01234",
        addressCity: "Berlin",
        addressCountry: "Deutschland",
        linkedin: "https://linkedin.com/jane",
        xing: "https://xing.com/jane",
        github: "https://github.com/jane",
      },
    });

    const logger = jest.fn<(message: string) => void>();
    const result = await generateResumePdf(fixtureRoot, logger);

    expect(result.deTargetFile).toBe(
      path.join(fixtureRoot, "public", "DE", "Jane_Example_-_Portfolio.pdf"),
    );
    expect(result.enTargetFile).toBe(
      path.join(fixtureRoot, "public", "EN", "Jane_Example_-_Portfolio.pdf"),
    );
    expect(result.deAtsTargetFile).toBe(
      path.join(
        fixtureRoot,
        "public",
        "DE",
        "Jane_Example_-_Portfolio_ATS.pdf",
      ),
    );
    expect(result.enAtsTargetFile).toBe(
      path.join(
        fixtureRoot,
        "public",
        "EN",
        "Jane_Example_-_Portfolio_ATS.pdf",
      ),
    );

    const dePdf = fs.readFileSync(result.deTargetFile);
    const enPdf = fs.readFileSync(result.enTargetFile);
    const deAtsPdf = fs.readFileSync(result.deAtsTargetFile);
    const enAtsPdf = fs.readFileSync(result.enAtsTargetFile);

    expect(dePdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(enPdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(deAtsPdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(enAtsPdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
    expect(dePdf.length).toBeGreaterThan(1000);
    expect(enPdf.length).toBeGreaterThan(1000);
    expect(deAtsPdf.length).toBeGreaterThan(500);
    expect(enAtsPdf.length).toBeGreaterThan(500);
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining("DE/Jane_Example_-_Portfolio.pdf"),
    );
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining("EN/Jane_Example_-_Portfolio.pdf"),
    );
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining("DE/Jane_Example_-_Portfolio_ATS.pdf"),
    );
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining("EN/Jane_Example_-_Portfolio_ATS.pdf"),
    );
  });

  it("renders the current example data including the extended resume sections", async () => {
    const fixtureRoot = createFixtureRoot();
    copyExampleAppData(fixtureRoot);

    const result = await generateResumePdf(fixtureRoot, silentLogger);
    const generatedFiles = [
      result.deTargetFile,
      result.enTargetFile,
      result.deAtsTargetFile,
      result.enAtsTargetFile,
    ];

    expect(generatedFiles).toHaveLength(4);
    for (const file of generatedFiles) {
      const pdf = fs.readFileSync(file);
      expect(pdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
      expect(pdf.length).toBeGreaterThan(1000);
    }
  });

  it("renders successfully when a PNG avatar is configured", async () => {
    const fixtureRoot = createFixtureRoot();
    const imagesDir = path.join(fixtureRoot, ".aboutme", "images");
    fs.mkdirSync(imagesDir, { recursive: true });
    // 1x1 px PNG, small enough to inline as a fixture.
    const onePixelPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64",
    );
    fs.writeFileSync(path.join(imagesDir, "avatar.png"), onePixelPng);

    writeAppData(fixtureRoot, {
      profile: {
        name: "Jane Example",
        title: "Engineer",
        description: "Just a single line.",
        avatar: "avatar.png",
      },
      contact: { email: "jane@example.com" },
      experience: [],
    });

    const result = await generateResumePdf(fixtureRoot, silentLogger);

    const dePdf = fs.readFileSync(result.deTargetFile);
    expect(dePdf.subarray(0, 5).toString("latin1")).toBe("%PDF-");
  });

  it("skips the photo gracefully when the configured avatar file is missing", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, {
      profile: {
        name: "Jane Example",
        title: "Engineer",
        description: "Just a single line.",
        avatar: "does-not-exist.webp",
      },
      contact: { email: "jane@example.com" },
      experience: [],
    });

    const result = await generateResumePdf(fixtureRoot, silentLogger);

    expect(fs.existsSync(result.deTargetFile)).toBe(true);
  });

  it("falls back to plain fields when localized variants are missing", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, {
      profile: {
        name: "Jane Example",
        title: "Engineer",
        description: "Just a single line.",
      },
      contact: { email: "jane@example.com" },
      experience: [
        {
          period: "2018 - 2020",
          role: "Engineer",
          company: "Old Co",
          description: "Did engineering things.",
          techstack: [],
        },
      ],
    });

    const result = await generateResumePdf(fixtureRoot, silentLogger);

    expect(fs.existsSync(result.deTargetFile)).toBe(true);
    expect(fs.existsSync(result.enTargetFile)).toBe(true);
  });
});
