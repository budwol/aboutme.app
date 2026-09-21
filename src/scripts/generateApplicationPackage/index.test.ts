/**
 * @jest-environment node
 *
 * Composes generate-cv-pdf.cjs, which needs the plain "node" Jest
 * environment for the same pdfkit/fontkit reasons documented in
 * src/scripts/generateResumePdf/index.test.ts.
 */
import { afterEach, describe, expect, it, jest } from "@jest/globals";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import zlib from "zlib";

/* eslint-disable @typescript-eslint/no-require-imports */
const scriptModule =
  require("../../../scripts/generate-application-package.cjs") as {
    generateApplicationPackage: (
      rootDir: string,
      logger?: (message: string) => void,
    ) => Promise<{
      deTargetFile: string;
      deFileName: string;
      enTargetFile: string;
      enFileName: string;
      referenceFileCount: number;
      referenceManifest: {
        category: string;
        fileName: string;
        label: string;
        url: string;
        size: number;
      }[];
      documentSizeManifest: Record<string, number>;
    }>;
    buildPackageFileName: (name: unknown, langCode: string) => string;
    buildReferenceDocumentLabel: (
      fileName: string,
      slug: string,
      dirName: string,
    ) => string;
    createZipArchive: (
      files: { name: string; content: Buffer }[],
      now?: Date,
    ) => Buffer;
    crc32: (buffer: Buffer) => number;
  };
const {
  generateApplicationPackage,
  buildPackageFileName,
  buildReferenceDocumentLabel,
  createZipArchive,
  crc32,
} = scriptModule;
/* eslint-enable @typescript-eslint/no-require-imports */

const createdFixtures: string[] = [];
const silentLogger = () => undefined;

function createFixtureRoot() {
  const fixtureRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "aboutme-application-package-"),
  );
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

// Parses just enough of the ZIP central directory to assert the archive is
// structurally valid without depending on any external unzip tool --
// finds each local file header by its magic number and confirms the
// stored (or decompressed) bytes round-trip back to the original content.
function readZipEntries(buffer: Buffer): { name: string; content: Buffer }[] {
  const entries: { name: string; content: Buffer }[] = [];
  let offset = 0;

  while (offset < buffer.length) {
    const signature = buffer.readUInt32LE(offset);
    if (signature !== 0x04034b50) {
      break;
    }

    const method = buffer.readUInt16LE(offset + 8);
    const compressedSize = buffer.readUInt32LE(offset + 18);
    const nameLength = buffer.readUInt16LE(offset + 26);
    const extraLength = buffer.readUInt16LE(offset + 28);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const name = buffer
      .subarray(nameStart, nameStart + nameLength)
      .toString("utf8");
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
    const content = method === 8 ? zlib.inflateRawSync(compressed) : compressed;

    entries.push({ name, content });
    offset = dataStart + compressedSize;
  }

  return entries;
}

describe("generate-application-package", () => {
  afterEach(() => {
    for (const fixture of createdFixtures.splice(0)) {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  });

  describe("buildPackageFileName", () => {
    it("slugifies the name and uses the German word for a German zip", () => {
      expect(buildPackageFileName("Jane Doe", "de")).toBe(
        "Jane_Doe_-_Bewerbungsunterlagen.zip",
      );
    });

    it("uses the English word for an English zip", () => {
      expect(buildPackageFileName("Jane Doe", "en")).toBe(
        "Jane_Doe_-_ApplicationDocuments.zip",
      );
    });

    it("handles a non-string name", () => {
      expect(buildPackageFileName(undefined, "de")).toBe(
        "_-_Bewerbungsunterlagen.zip",
      );
    });
  });

  describe("createZipArchive", () => {
    it("round-trips a single small text file", () => {
      const now = new Date("2024-01-15T10:30:00");
      const zip = createZipArchive(
        [{ name: "hello.txt", content: Buffer.from("hello world") }],
        now,
      );

      expect(zip.subarray(0, 4).toString("hex")).toBe("504b0304");
      const entries = readZipEntries(zip);
      expect(entries).toEqual([
        { name: "hello.txt", content: Buffer.from("hello world") },
      ]);
      // End-of-central-directory signature must be present somewhere near
      // the tail of the archive.
      expect(zip.includes(Buffer.from("504b0506", "hex"))).toBe(true);
    });

    it("sets the UTF-8 language-encoding flag so a non-ASCII file name round-trips through a spec-compliant reader", () => {
      const zip = createZipArchive([
        {
          name: "Zertifikate/Teilnahmebestätigung.pdf",
          content: Buffer.from("%PDF-fake"),
        },
      ]);

      // Local file header: signature (4) + version (2), then the general
      // purpose bit flag at offset 6 -- bit 11 (0x0800) is the "language
      // encoding flag" (EFS) that tells a reader the name bytes are UTF-8,
      // not the legacy CP437 the ZIP format otherwise assumes. Without it,
      // a spec-compliant reader garbles any non-ASCII byte in the name even
      // though every byte written is correct UTF-8.
      const localFlag = zip.readUInt16LE(6);
      expect(localFlag & 0x0800).toBe(0x0800);

      const entries = readZipEntries(zip);
      expect(entries[0].name).toBe("Zertifikate/Teilnahmebestätigung.pdf");
    });

    it("round-trips multiple files, including one under a subfolder", () => {
      const zip = createZipArchive([
        { name: "CV.pdf", content: Buffer.from("%PDF-fake-content") },
        { name: "Certificates/zeugnis.txt", content: Buffer.from("Zeugnis") },
      ]);

      const entries = readZipEntries(zip);
      expect(entries.map((entry) => entry.name)).toEqual([
        "CV.pdf",
        "Certificates/zeugnis.txt",
      ]);
      expect(entries[1].content.toString("utf8")).toBe("Zeugnis");
    });

    it("produces a valid, empty archive for zero files", () => {
      const zip = createZipArchive([]);
      expect(readZipEntries(zip)).toEqual([]);
      expect(zip.subarray(0, 4).toString("hex")).toBe("504b0506");
    });

    it("falls back to STORE when deflating would not shrink the content", () => {
      // Highly random/incompressible bytes: DEFLATE will typically grow
      // rather than shrink this, exercising the "store, don't deflate"
      // branch.
      const random = crypto.randomBytes(64);
      const zip = createZipArchive([{ name: "random.bin", content: random }]);
      const entries = readZipEntries(zip);
      expect(entries[0].content).toEqual(random);
    });
  });

  describe("crc32", () => {
    it("is deterministic for the same input", () => {
      const buffer = Buffer.from("some content");
      expect(crc32(buffer)).toBe(crc32(Buffer.from("some content")));
    });

    it("differs for different input", () => {
      expect(crc32(Buffer.from("a"))).not.toBe(crc32(Buffer.from("b")));
    });

    it("is 0 for an empty buffer", () => {
      expect(crc32(Buffer.alloc(0))).toBe(0);
    });
  });

  it("throws when .aboutme/app-data.json is missing", async () => {
    const fixtureRoot = createFixtureRoot();

    await expect(
      generateApplicationPackage(fixtureRoot, silentLogger),
    ).rejects.toThrow(/missing source file/);
  });

  it("bundles each language's CV and Portfolio-ATS PDF into its own zip under public/files/", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });

    const logger = jest.fn<(message: string) => void>();
    const result = await generateApplicationPackage(fixtureRoot, logger);

    expect(result.referenceFileCount).toBe(0);
    expect(result.referenceManifest).toEqual([]);
    expect(path.dirname(result.deTargetFile)).toBe(
      path.join(fixtureRoot, "public", "files", "DE"),
    );
    expect(path.dirname(result.enTargetFile)).toBe(
      path.join(fixtureRoot, "public", "files", "EN"),
    );
    expect(result.deFileName).toBe("Jane_Example_-_Bewerbungsunterlagen.zip");
    expect(result.enFileName).toBe("Jane_Example_-_ApplicationDocuments.zip");

    const expectedEntryNames = {
      [result.deTargetFile]: [
        "Jane_Example_-_Lebenslauf.pdf",
        "Jane_Example_-_Lebenslauf_ATS.pdf",
        "Jane_Example_-_Portfolio.pdf",
        "Jane_Example_-_Portfolio_ATS.pdf",
      ],
      [result.enTargetFile]: [
        "Jane_Example_-_CV.pdf",
        "Jane_Example_-_CV_ATS.pdf",
        "Jane_Example_-_Portfolio.pdf",
        "Jane_Example_-_Portfolio_ATS.pdf",
      ],
    };
    for (const targetFile of [result.deTargetFile, result.enTargetFile]) {
      const zip = fs.readFileSync(targetFile);
      const entries = readZipEntries(zip);
      expect(entries.map((entry) => entry.name)).toEqual(
        expectedEntryNames[targetFile],
      );
      for (const entry of entries) {
        expect(entry.content.subarray(0, 5).toString("latin1")).toBe("%PDF-");
      }
    }

    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining(`public/files/DE/${result.deFileName}`),
    );
    expect(logger).toHaveBeenCalledWith(
      expect.stringContaining(`public/files/EN/${result.enFileName}`),
    );
    // Written unconditionally (even with zero reference files), so the
    // frontend's manifest fetch never has to distinguish "no file yet" from
    // "nothing to show".
    expect(
      fs.existsSync(
        path.join(fixtureRoot, "public", "files", "references-manifest.json"),
      ),
    ).toBe(true);
  });

  it("writes a document-sizes.json manifest covering every fixed CV/Portfolio/ZIP file", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });

    const result = await generateApplicationPackage(fixtureRoot, silentLogger);

    expect(Object.keys(result.documentSizeManifest).sort()).toEqual(
      [
        `/files/DE/${result.deFileName}`,
        `/files/EN/${result.enFileName}`,
        "/files/DE/Jane_Example_-_Lebenslauf.pdf",
        "/files/EN/Jane_Example_-_CV.pdf",
        "/files/DE/Jane_Example_-_Lebenslauf_ATS.pdf",
        "/files/EN/Jane_Example_-_CV_ATS.pdf",
        "/DE/Jane_Example_-_Portfolio.pdf",
        "/EN/Jane_Example_-_Portfolio.pdf",
        "/DE/Jane_Example_-_Portfolio_ATS.pdf",
        "/EN/Jane_Example_-_Portfolio_ATS.pdf",
      ].sort(),
    );
    // Every value is the real, non-zero byte size of an actual generated
    // file, not a placeholder.
    for (const size of Object.values(result.documentSizeManifest)) {
      expect(size).toBeGreaterThan(0);
    }
    expect(result.documentSizeManifest[`/files/DE/${result.deFileName}`]).toBe(
      fs.statSync(result.deTargetFile).size,
    );

    const manifestFile = path.join(
      fixtureRoot,
      "public",
      "files",
      "document-sizes.json",
    );
    expect(JSON.parse(fs.readFileSync(manifestFile, "utf8"))).toEqual(
      result.documentSizeManifest,
    );
  });

  function writeReferenceFile(
    fixtureRoot: string,
    dirName: string,
    fileName: string,
    content: string,
  ) {
    const dir = path.join(fixtureRoot, ".aboutme", "secrets", dirName);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, fileName), content);
  }

  it("includes every file under .aboutme/secrets/{Arbeitszeugnisse,Zertifikate,Zeugnisse}/ in both language zips, category by category", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });
    writeReferenceFile(fixtureRoot, "Zertifikate", "b-zertifikat.txt", "B");
    writeReferenceFile(fixtureRoot, "Zertifikate", "a-zertifikat.txt", "A");
    writeReferenceFile(
      fixtureRoot,
      "Arbeitszeugnisse",
      "arbeitszeugnis.txt",
      "AZ",
    );
    writeReferenceFile(fixtureRoot, "Zeugnisse", "zeugnis.txt", "Z");

    const result = await generateApplicationPackage(fixtureRoot, silentLogger);

    expect(result.referenceFileCount).toBe(4);
    // The reference-file entries (category order Zertifikate,
    // Arbeitszeugnisse, Zeugnisse first, alphabetical within each category)
    // are identical in both zips; only the four fixed-document names at the
    // front differ by language.
    const referenceEntryNames = [
      "Zertifikate/a-zertifikat.txt",
      "Zertifikate/b-zertifikat.txt",
      "Arbeitszeugnisse/arbeitszeugnis.txt",
      "Zeugnisse/zeugnis.txt",
    ];
    const deEntries = readZipEntries(fs.readFileSync(result.deTargetFile));
    expect(deEntries.map((entry) => entry.name)).toEqual([
      "Jane_Example_-_Lebenslauf.pdf",
      "Jane_Example_-_Lebenslauf_ATS.pdf",
      "Jane_Example_-_Portfolio.pdf",
      "Jane_Example_-_Portfolio_ATS.pdf",
      ...referenceEntryNames,
    ]);
    const enEntries = readZipEntries(fs.readFileSync(result.enTargetFile));
    expect(enEntries.map((entry) => entry.name)).toEqual([
      "Jane_Example_-_CV.pdf",
      "Jane_Example_-_CV_ATS.pdf",
      "Jane_Example_-_Portfolio.pdf",
      "Jane_Example_-_Portfolio_ATS.pdf",
      ...referenceEntryNames,
    ]);
  });

  it("ignores subdirectories within a reference category folder", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });
    const nestedDir = path.join(
      fixtureRoot,
      ".aboutme",
      "secrets",
      "Zertifikate",
      "nested",
    );
    fs.mkdirSync(nestedDir, { recursive: true });
    fs.writeFileSync(path.join(nestedDir, "ignored.txt"), "x");

    const result = await generateApplicationPackage(fixtureRoot, silentLogger);
    expect(result.referenceFileCount).toBe(0);
  });

  it("copies every reference file into its own category subfolder under public/files/ and lists it in the manifest", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });
    writeReferenceFile(
      fixtureRoot,
      "Zertifikate",
      "Jane_Example_-_Zertifikat_AutoCAD.pdf",
      "%PDF-fake",
    );

    const result = await generateApplicationPackage(fixtureRoot, silentLogger);

    const copiedFile = path.join(
      fixtureRoot,
      "public",
      "files",
      "Zertifikate",
      "Jane_Example_-_Zertifikat_AutoCAD.pdf",
    );
    expect(fs.readFileSync(copiedFile, "utf8")).toBe("%PDF-fake");

    expect(result.referenceManifest).toEqual([
      {
        category: "certificates",
        fileName: "Jane_Example_-_Zertifikat_AutoCAD.pdf",
        label: "AutoCAD",
        url: "/files/Zertifikate/Jane_Example_-_Zertifikat_AutoCAD.pdf",
        size: 9,
      },
    ]);

    const manifestFile = path.join(
      fixtureRoot,
      "public",
      "files",
      "references-manifest.json",
    );
    expect(JSON.parse(fs.readFileSync(manifestFile, "utf8"))).toEqual(
      result.referenceManifest,
    );
  });

  it("produces the same, stable file names across repeated runs", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });

    const first = await generateApplicationPackage(fixtureRoot, silentLogger);
    const second = await generateApplicationPackage(fixtureRoot, silentLogger);

    expect(second.deFileName).toBe(first.deFileName);
    expect(second.deTargetFile).toBe(first.deTargetFile);
    expect(second.enFileName).toBe(first.enFileName);
    expect(second.enTargetFile).toBe(first.enTargetFile);
  });

  it("overwrites both zips and the manifest in place when a reference file is added on a later run", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });

    const first = await generateApplicationPackage(fixtureRoot, silentLogger);
    expect(first.referenceFileCount).toBe(0);

    writeReferenceFile(fixtureRoot, "Zeugnisse", "zeugnis.txt", "Zeugnis");

    const second = await generateApplicationPackage(fixtureRoot, silentLogger);
    expect(second.referenceFileCount).toBe(1);

    const deEntries = readZipEntries(fs.readFileSync(second.deTargetFile));
    expect(deEntries.map((entry) => entry.name)).toEqual([
      "Jane_Example_-_Lebenslauf.pdf",
      "Jane_Example_-_Lebenslauf_ATS.pdf",
      "Jane_Example_-_Portfolio.pdf",
      "Jane_Example_-_Portfolio_ATS.pdf",
      "Zeugnisse/zeugnis.txt",
    ]);
    const enEntries = readZipEntries(fs.readFileSync(second.enTargetFile));
    expect(enEntries.map((entry) => entry.name)).toEqual([
      "Jane_Example_-_CV.pdf",
      "Jane_Example_-_CV_ATS.pdf",
      "Jane_Example_-_Portfolio.pdf",
      "Jane_Example_-_Portfolio_ATS.pdf",
      "Zeugnisse/zeugnis.txt",
    ]);
  });

  it("removes a reference file's copy under public/files/ once it's deleted from .aboutme/secrets/", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });
    const sourceFile = path.join(
      fixtureRoot,
      ".aboutme",
      "secrets",
      "Zertifikate",
      "zertifikat.txt",
    );
    writeReferenceFile(fixtureRoot, "Zertifikate", "zertifikat.txt", "A");

    const first = await generateApplicationPackage(fixtureRoot, silentLogger);
    expect(first.referenceFileCount).toBe(1);
    const copiedFile = path.join(
      fixtureRoot,
      "public",
      "files",
      "Zertifikate",
      "zertifikat.txt",
    );
    expect(fs.existsSync(copiedFile)).toBe(true);

    fs.rmSync(sourceFile);
    const second = await generateApplicationPackage(fixtureRoot, silentLogger);

    expect(second.referenceFileCount).toBe(0);
    expect(second.referenceManifest).toEqual([]);
    expect(fs.existsSync(copiedFile)).toBe(false);
  });

  describe("buildReferenceDocumentLabel", () => {
    it("drops the '<slug>_-_' prefix and turns underscores into spaces", () => {
      expect(
        buildReferenceDocumentLabel(
          "Jane_Example_-_Diplom_Informatik.pdf",
          "Jane_Example",
          "Zeugnisse",
        ),
      ).toBe("Diplom Informatik");
    });

    it("falls back to the extension-less file name when the prefix is absent", () => {
      expect(
        buildReferenceDocumentLabel("random_scan.pdf", "Jane_Example", ""),
      ).toBe("random scan");
    });

    it("drops the category's own redundant word for Zertifikate", () => {
      expect(
        buildReferenceDocumentLabel(
          "Jane_Example_-_Zertifikat_AutoCAD.pdf",
          "Jane_Example",
          "Zertifikate",
        ),
      ).toBe("AutoCAD");
    });

    it("drops the category's own redundant word for Arbeitszeugnisse", () => {
      expect(
        buildReferenceDocumentLabel(
          "Jane_Example_-_Arbeitszeugnis_2020-08-31_Acme.pdf",
          "Jane_Example",
          "Arbeitszeugnisse",
        ),
      ).toBe("2020-08-31 Acme");
    });

    it("does not drop anything for a category without a redundant word", () => {
      expect(
        buildReferenceDocumentLabel(
          "Jane_Example_-_Zeugnis_Fachhochschulreife.pdf",
          "Jane_Example",
          "Zeugnisse",
        ),
      ).toBe("Zeugnis Fachhochschulreife");
    });
  });

  it("lists Arbeitszeugnisse newest first, but keeps other categories alphabetical", async () => {
    const fixtureRoot = createFixtureRoot();
    writeAppData(fixtureRoot, { profile: { name: "Jane Example" } });
    writeReferenceFile(
      fixtureRoot,
      "Arbeitszeugnisse",
      "Jane_Example_-_Arbeitszeugnis_2010-08-31_Acme.pdf",
      "old",
    );
    writeReferenceFile(
      fixtureRoot,
      "Arbeitszeugnisse",
      "Jane_Example_-_Arbeitszeugnis_2020-08-31_Acme.pdf",
      "new",
    );
    writeReferenceFile(fixtureRoot, "Zertifikate", "b-zertifikat.txt", "B");
    writeReferenceFile(fixtureRoot, "Zertifikate", "a-zertifikat.txt", "A");

    const result = await generateApplicationPackage(fixtureRoot, silentLogger);

    expect(
      result.referenceManifest
        .filter((entry) => entry.category === "employmentReferences")
        .map((entry) => entry.fileName),
    ).toEqual([
      "Jane_Example_-_Arbeitszeugnis_2020-08-31_Acme.pdf",
      "Jane_Example_-_Arbeitszeugnis_2010-08-31_Acme.pdf",
    ]);
    expect(
      result.referenceManifest
        .filter((entry) => entry.category === "certificates")
        .map((entry) => entry.fileName),
    ).toEqual(["a-zertifikat.txt", "b-zertifikat.txt"]);
  });
});
