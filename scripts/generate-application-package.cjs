#!/usr/bin/env node

// Bundles the German CV PDF (scripts/generate-cv-pdf.cjs) together with any
// reference/certificate scans dropped under .aboutme/secrets/ into a single
// downloadable ZIP archive -- the "application package" a candidate forwards
// to a recruiter by hand. The same scans are also copied individually into
// public/files/ (plus a references-manifest.json listing them, written by
// writeReferenceDocuments below) so they can be downloaded one at a time
// from the documents page, not only as part of the bundle -- see
// src/utils/referenceDocumentsManifest and
// src/components/screens/WnaDownloadsRoute.tsx on the frontend side.
//
// The actual access control for everything under public/files/ (this ZIP
// and the CV PDFs generate-cv-pdf.cjs writes there) is nginx's HTTP Basic
// Auth, configured in scripts/init-process.cjs -- so, unlike an earlier
// version of this script, the file name here is a plain, stable,
// human-readable name, not a random per-build token. Guessing the name
// doesn't help without the password nginx actually enforces.
//
// No zip library is added as a dependency (ADR 0002's build scripts stay
// dependency-light) -- Node's built-in zlib already provides DEFLATE, and
// the ZIP container format itself (local file headers + a central
// directory + an end-of-central-directory record) is small enough to write
// by hand and verify byte-for-byte in tests.

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const { generateCvPdf, buildCvFileName } = require("./generate-cv-pdf.cjs");
const {
  generateResumePdf,
  buildPortfolioFileName,
} = require("./generate-resume-pdf.cjs");

const GERMAN_DIACRITICS = {
  ä: "ae",
  ö: "oe",
  ü: "ue",
  Ä: "Ae",
  Ö: "Oe",
  Ü: "Ue",
  ß: "ss",
};

// Mirrors slugifyName in generate-resume-pdf.cjs / generate-cv-pdf.cjs.
function slugifyName(name) {
  if (typeof name !== "string") {
    return "";
  }
  return name
    .replace(/[äöüÄÖÜß]/g, (char) => GERMAN_DIACRITICS[char])
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^A-Za-z0-9_-]/g, "");
}

// Matches the (unconditional) prefix convention buildPortfolioFileName /
// buildCvFileName already use elsewhere in this codebase, rather than
// special-casing an empty slug. One ZIP per language (see
// generateApplicationPackage) since the CV and Portfolio-ATS files inside
// it are themselves language-specific -- a single shared ZIP would force a
// recruiter to sift through both languages' documents to find the one they
// asked for. The language lives in the word itself, like buildCvFileName's
// "Lebenslauf"/"CV" -- no _DE/_EN suffix; the two ZIPs are told apart by
// which public/files/DE//EN/ folder they land in (see
// generateApplicationPackage below).
const PACKAGE_FILE_WORDS = {
  de: "Bewerbungsunterlagen",
  en: "ApplicationDocuments",
};

function buildPackageFileName(name, langCode) {
  const word = PACKAGE_FILE_WORDS[langCode] ?? PACKAGE_FILE_WORDS.en;
  return `${slugifyName(name)}_-_${word}.zip`;
}

// Each real folder a candidate drops scans into under .aboutme/secrets/
// (gitignored, like the rest of .aboutme/secrets/ -- see
// scripts/init-process.cjs's documents-password.txt for the sibling
// precedent). `category` is the stable machine-readable id the frontend's
// ReferenceDocumentCategory type and i18n labels key off
// (documentsCategory* in src/i18n) -- the folder name itself is also the
// zip/public/files/ subfolder name, so recruiters who unzip the archive or
// browse the URL directly still see the German folder names on disk.
const REFERENCE_CATEGORIES = [
  { dirName: "Zertifikate", category: "certificates" },
  { dirName: "Arbeitszeugnisse", category: "employmentReferences" },
  { dirName: "Zeugnisse", category: "diplomas" },
];

// Arbeitszeugnisse are named "<Name>_-_Arbeitszeugnis_<YYYY-MM-DD>_...", so
// an ordinary alphabetical sort of the full file name already sorts them
// chronologically (the shared prefix means the ISO date is what the
// comparison actually turns on) -- newest-first here just means comparing
// in the opposite direction, matching the usual CV convention of listing
// the most recent reference first. Every other category has no such date
// convention and keeps the plain ascending sort.
const DESCENDING_SORT_CATEGORY_DIR_NAMES = new Set(["Arbeitszeugnisse"]);

// Flat, non-recursive per category, same as the single-folder version this
// replaced -- a stray subdirectory (e.g. an editor's ".DS_Store" sibling
// folder) is silently ignored rather than walked.
function listReferenceFiles(rootDir) {
  const secretsDir = path.join(rootDir, ".aboutme", "secrets");

  return REFERENCE_CATEGORIES.flatMap(({ dirName, category }) => {
    const categoryDir = path.join(secretsDir, dirName);
    if (!fs.existsSync(categoryDir)) {
      return [];
    }

    const sortSign = DESCENDING_SORT_CATEGORY_DIR_NAMES.has(dirName) ? -1 : 1;

    return fs
      .readdirSync(categoryDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .sort((a, b) => sortSign * a.localeCompare(b))
      .map((fileName) => ({
        category,
        dirName,
        fileName,
        content: fs.readFileSync(path.join(categoryDir, fileName)),
      }));
  });
}

// The category heading a reference document's card already carries
// ("Zertifikate", "Arbeitszeugnisse") makes repeating that same word inside
// every one of its rows' own label redundant ("Zertifikat AutoCAD" under a
// "Zertifikate" heading) -- stripped here, per category, before the
// underscore-to-space pass below.
const REFERENCE_LABEL_REDUNDANT_WORDS = {
  Zertifikate: "Zertifikat",
  Arbeitszeugnisse: "Arbeitszeugnis",
};

function stripLeadingWord(text, word) {
  if (!word) {
    return text;
  }
  const prefix = `${word}_`;
  return text.startsWith(prefix) ? text.slice(prefix.length) : text;
}

// "Wolf_Budgenhagen_-_Zertifikat_AutoCAD.pdf" -> "AutoCAD": drops the
// "<Name>_-_" prefix every file in .aboutme/secrets/ shares (it exists only
// to keep the raw files self-identifying on disk/in the zip), then the
// category's own redundant word (see REFERENCE_LABEL_REDUNDANT_WORDS
// above), and turns the remaining underscores into spaces for a label a
// human actually wants to read on the documents page. Falls back to the
// untouched file name (still minus its extension) when the "<Name>_-_"
// prefix isn't present, rather than mangling an unexpected name.
function buildReferenceDocumentLabel(fileName, slug, dirName) {
  const withoutExtension = fileName.replace(/\.[^.]+$/, "");
  const prefix = `${slug}_-_`;
  const withoutPrefix = withoutExtension.startsWith(prefix)
    ? withoutExtension.slice(prefix.length)
    : withoutExtension;
  const withoutRedundantWord = stripLeadingWord(
    withoutPrefix,
    REFERENCE_LABEL_REDUNDANT_WORDS[dirName],
  );
  return withoutRedundantWord.replace(/_/g, " ");
}

// ---- Minimal ZIP writer -----------------------------------------------
//
// Deliberately only what's needed here: one segment per entry (no ZIP64,
// no encryption, no data descriptors -- every entry's size is known
// upfront), DEFLATE with a STORE fallback when deflating wouldn't actually
// shrink the entry (e.g. an already-compressed PDF/JPEG certificate scan).

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc = CRC32_TABLE[(crc ^ buffer[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function toDosDateTime(date) {
  const dosTime =
    (date.getHours() << 11) |
    (date.getMinutes() << 5) |
    (date.getSeconds() >> 1);
  const dosDate =
    ((date.getFullYear() - 1980) << 9) |
    ((date.getMonth() + 1) << 5) |
    date.getDate();
  return { dosTime, dosDate };
}

// A regular file, world-readable (-rw-r--r--), stored in the zip's
// external file attributes as Unix tools (macOS Archive Utility, `unzip`,
// etc.) expect them: the Unix mode lives in the high 16 bits.
const EXTERNAL_FILE_ATTRS = (0o100644 << 16) >>> 0;

// Bit 11 of the general purpose bit flag ("language encoding flag", EFS):
// tells a reader the file name/comment bytes are UTF-8, not the legacy
// IBM Code Page 437 the ZIP format otherwise assumes. Entry names here
// come straight from real file names on disk (buildZipEntry encodes them
// as UTF-8) -- reference/certificate scans in particular routinely contain
// German umlauts ("Teilnahmebestätigung..."). Without this flag, a
// spec-compliant reader (Python's zipfile, Windows Explorer, strict-mode
// 7-Zip) decodes those UTF-8 bytes as CP437 instead and shows a garbled
// name, even though every byte written was correct.
const GENERAL_PURPOSE_BIT_FLAG_UTF8 = 0x0800;

function buildZipEntry(name, content, modifiedAt) {
  const nameBuffer = Buffer.from(name, "utf8");
  const crc = crc32(content);
  const deflated = zlib.deflateRawSync(content);
  const useDeflate = deflated.length < content.length;
  const method = useDeflate ? 8 : 0;
  const storedContent = useDeflate ? deflated : content;
  const { dosTime, dosDate } = toDosDateTime(modifiedAt);

  return {
    name,
    nameBuffer,
    method,
    crc,
    compressedSize: storedContent.length,
    uncompressedSize: content.length,
    dosTime,
    dosDate,
    data: storedContent,
  };
}

function writeLocalFileHeader(entry) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4); // version needed to extract
  header.writeUInt16LE(GENERAL_PURPOSE_BIT_FLAG_UTF8, 6); // general purpose bit flag
  header.writeUInt16LE(entry.method, 8);
  header.writeUInt16LE(entry.dosTime, 10);
  header.writeUInt16LE(entry.dosDate, 12);
  header.writeUInt32LE(entry.crc, 14);
  header.writeUInt32LE(entry.compressedSize, 18);
  header.writeUInt32LE(entry.uncompressedSize, 22);
  header.writeUInt16LE(entry.nameBuffer.length, 26);
  header.writeUInt16LE(0, 28); // extra field length
  return Buffer.concat([header, entry.nameBuffer]);
}

function writeCentralDirectoryHeader(entry, localHeaderOffset) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4); // version made by
  header.writeUInt16LE(20, 6); // version needed to extract
  header.writeUInt16LE(GENERAL_PURPOSE_BIT_FLAG_UTF8, 8); // general purpose bit flag
  header.writeUInt16LE(entry.method, 10);
  header.writeUInt16LE(entry.dosTime, 12);
  header.writeUInt16LE(entry.dosDate, 14);
  header.writeUInt32LE(entry.crc, 16);
  header.writeUInt32LE(entry.compressedSize, 20);
  header.writeUInt32LE(entry.uncompressedSize, 24);
  header.writeUInt16LE(entry.nameBuffer.length, 28);
  header.writeUInt16LE(0, 30); // extra field length
  header.writeUInt16LE(0, 32); // file comment length
  header.writeUInt16LE(0, 34); // disk number start
  header.writeUInt16LE(0, 36); // internal file attributes
  header.writeUInt32LE(EXTERNAL_FILE_ATTRS, 38);
  header.writeUInt32LE(localHeaderOffset, 42);
  return Buffer.concat([header, entry.nameBuffer]);
}

// Builds a valid (non-ZIP64) .zip archive in memory from a flat list of
// {name, content} entries. `now` is injectable so tests can assert exact
// bytes without depending on the current date/time.
function createZipArchive(files, now = new Date()) {
  const localSegments = [];
  const centralSegments = [];
  let offset = 0;

  for (const file of files) {
    const entry = buildZipEntry(file.name, file.content, now);
    const localHeader = writeLocalFileHeader(entry);
    localSegments.push(localHeader, entry.data);
    centralSegments.push(writeCentralDirectoryHeader(entry, offset));
    offset += localHeader.length + entry.data.length;
  }

  const centralDirectory = Buffer.concat(centralSegments);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(0x06054b50, 0);
  endRecord.writeUInt16LE(0, 4); // number of this disk
  endRecord.writeUInt16LE(0, 6); // disk where central directory starts
  endRecord.writeUInt16LE(files.length, 8);
  endRecord.writeUInt16LE(files.length, 10);
  endRecord.writeUInt32LE(centralDirectory.length, 12);
  endRecord.writeUInt32LE(offset, 16);
  endRecord.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...localSegments, centralDirectory, endRecord]);
}

// ---- Orchestration ------------------------------------------------------

// Builds one language's ZIP -- that language's full fixed document set (CV,
// CV-ATS, designed Portfolio, Portfolio-ATS), plus the language-agnostic
// reference/certificate scans every package includes -- and writes it to
// public/files/<DE|EN>/. Its own file name carries no _DE/_EN suffix (see
// buildPackageFileName), so the folder is what disambiguates the two ZIPs,
// same as the CV/Portfolio files. Every entry inside the zip keeps the
// exact same name it has as a standalone download (buildCvFileName/
// buildPortfolioFileName) rather than a generic "CV.pdf"/"Portfolio-ATS.pdf"
// placeholder, so a file extracted out of the zip is still self-identifying
// once it's no longer sitting next to the others.
function writeLanguagePackage(
  filesDir,
  name,
  langCode,
  cvFile,
  cvAtsFile,
  portfolioFile,
  portfolioAtsFile,
  referenceFiles,
  logger,
) {
  const files = [
    {
      name: buildCvFileName(name, langCode),
      content: fs.readFileSync(cvFile),
    },
    {
      name: buildCvFileName(name, langCode, { ats: true }),
      content: fs.readFileSync(cvAtsFile),
    },
    {
      name: buildPortfolioFileName(name, langCode),
      content: fs.readFileSync(portfolioFile),
    },
    {
      name: buildPortfolioFileName(name, langCode, { ats: true }),
      content: fs.readFileSync(portfolioAtsFile),
    },
    ...referenceFiles.map((file) => ({
      name: `${file.dirName}/${file.fileName}`,
      content: file.content,
    })),
  ];

  const langDir = path.join(filesDir, langCode.toUpperCase());
  fs.mkdirSync(langDir, { recursive: true });
  const fileName = buildPackageFileName(name, langCode);
  const targetFile = path.join(langDir, fileName);
  fs.writeFileSync(targetFile, createZipArchive(files));
  logger(
    `generated .aboutme/ -> public/files/${langCode.toUpperCase()}/${fileName}`,
  );

  return { targetFile, fileName };
}

const REFERENCE_MANIFEST_FILE_NAME = "references-manifest.json";

// Copies every reference/certificate scan into its own category subfolder
// under public/files/ (so each one can be downloaded on its own from the
// documents page, not only as part of the ZIP) and writes a small manifest
// next to them listing what's there -- the exact set of files is
// deployment-specific data, not something the frontend can know at build
// time the way the fixed CV/Portfolio file names are (see
// src/utils/documentsManifest), so it reads this file at runtime instead
// (src/utils/referenceDocumentsManifest).
function writeReferenceDocuments(filesDir, referenceFiles, name, logger) {
  // Each category subfolder is fully replaced, not just written into: a
  // file removed from .aboutme/secrets/ (or renamed) otherwise leaves a
  // stale, still-downloadable copy behind under public/files/ forever --
  // it drops out of references-manifest.json immediately, but the file
  // itself would keep sitting there since nothing else ever deletes it.
  for (const { dirName } of REFERENCE_CATEGORIES) {
    fs.rmSync(path.join(filesDir, dirName), { recursive: true, force: true });
  }

  const slug = slugifyName(name);
  const manifest = referenceFiles.map((file) => {
    const categoryDir = path.join(filesDir, file.dirName);
    fs.mkdirSync(categoryDir, { recursive: true });
    fs.writeFileSync(path.join(categoryDir, file.fileName), file.content);

    return {
      category: file.category,
      fileName: file.fileName,
      label: buildReferenceDocumentLabel(file.fileName, slug, file.dirName),
      url: `/files/${encodeURIComponent(file.dirName)}/${encodeURIComponent(file.fileName)}`,
      size: file.content.length,
    };
  });

  const manifestFile = path.join(filesDir, REFERENCE_MANIFEST_FILE_NAME);
  fs.writeFileSync(manifestFile, JSON.stringify(manifest));
  logger(
    `generated .aboutme/secrets/ -> public/files/${REFERENCE_MANIFEST_FILE_NAME}`,
  );

  return manifest;
}

const DOCUMENT_SIZES_FILE_NAME = "document-sizes.json";

// A flat {url: sizeInBytes} map for every file in the *fixed* CV/Portfolio/
// ZIP document set (src/utils/documentsManifest) -- unlike references-
// manifest.json above, these file names are already known at build time,
// but their *sizes* aren't known to the frontend at all without reading the
// actual generated files, which only this build script ever does. Keyed by
// pathname only (no query string): the two Portfolio entries are served
// from public/ root with a cache-busting `?v=...` query the frontend adds
// separately (getVersionedLocalAssetUrl) -- looking this map up by pathname
// alone, after stripping any query string, means this file doesn't need to
// know that deploy version at all.
function writeDocumentSizeManifest(filesDir, entries, logger) {
  const manifest = {};
  for (const { url, filePath } of entries) {
    manifest[url] = fs.statSync(filePath).size;
  }

  const manifestFile = path.join(filesDir, DOCUMENT_SIZES_FILE_NAME);
  fs.writeFileSync(manifestFile, JSON.stringify(manifest));
  logger(`generated public/ -> public/files/${DOCUMENT_SIZES_FILE_NAME}`);

  return manifest;
}

async function generateApplicationPackage(rootDir, logger = console.log) {
  const {
    deTargetFile: cvDeFile,
    enTargetFile: cvEnFile,
    deAtsTargetFile: cvAtsDeFile,
    enAtsTargetFile: cvAtsEnFile,
  } = await generateCvPdf(rootDir, logger);
  const {
    deTargetFile: portfolioDeFile,
    enTargetFile: portfolioEnFile,
    deAtsTargetFile: portfolioAtsDeFile,
    enAtsTargetFile: portfolioAtsEnFile,
  } = await generateResumePdf(rootDir, logger);
  const sourceFile = path.join(rootDir, ".aboutme", "app-data.json");
  const data = JSON.parse(fs.readFileSync(sourceFile, "utf8"));

  const referenceFiles = listReferenceFiles(rootDir);
  const filesDir = path.join(rootDir, "public", "files");
  fs.mkdirSync(filesDir, { recursive: true });

  const name = data.profile?.name;
  const de = writeLanguagePackage(
    filesDir,
    name,
    "de",
    cvDeFile,
    cvAtsDeFile,
    portfolioDeFile,
    portfolioAtsDeFile,
    referenceFiles,
    logger,
  );
  const en = writeLanguagePackage(
    filesDir,
    name,
    "en",
    cvEnFile,
    cvAtsEnFile,
    portfolioEnFile,
    portfolioAtsEnFile,
    referenceFiles,
    logger,
  );
  const referenceManifest = writeReferenceDocuments(
    filesDir,
    referenceFiles,
    name,
    logger,
  );

  const documentSizeManifest = writeDocumentSizeManifest(
    filesDir,
    [
      { url: `/files/DE/${de.fileName}`, filePath: de.targetFile },
      { url: `/files/EN/${en.fileName}`, filePath: en.targetFile },
      {
        url: `/files/DE/${buildCvFileName(name, "de")}`,
        filePath: cvDeFile,
      },
      {
        url: `/files/EN/${buildCvFileName(name, "en")}`,
        filePath: cvEnFile,
      },
      {
        url: `/files/DE/${buildCvFileName(name, "de", { ats: true })}`,
        filePath: cvAtsDeFile,
      },
      {
        url: `/files/EN/${buildCvFileName(name, "en", { ats: true })}`,
        filePath: cvAtsEnFile,
      },
      {
        url: `/DE/${buildPortfolioFileName(name, "de")}`,
        filePath: portfolioDeFile,
      },
      {
        url: `/EN/${buildPortfolioFileName(name, "en")}`,
        filePath: portfolioEnFile,
      },
      {
        url: `/DE/${buildPortfolioFileName(name, "de", { ats: true })}`,
        filePath: portfolioAtsDeFile,
      },
      {
        url: `/EN/${buildPortfolioFileName(name, "en", { ats: true })}`,
        filePath: portfolioAtsEnFile,
      },
    ],
    logger,
  );

  return {
    deTargetFile: de.targetFile,
    deFileName: de.fileName,
    enTargetFile: en.targetFile,
    enFileName: en.fileName,
    referenceFileCount: referenceFiles.length,
    referenceManifest,
    documentSizeManifest,
  };
}

module.exports = {
  buildPackageFileName,
  buildReferenceDocumentLabel,
  createZipArchive,
  crc32,
  generateApplicationPackage,
  slugifyName,
};

if (require.main === module) {
  generateApplicationPackage(process.cwd()).catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
