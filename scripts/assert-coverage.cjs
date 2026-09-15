#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const ts = require("typescript");

const rootDir = path.resolve(__dirname, "..");
const coverageFile = path.join(rootDir, "coverage", "coverage-final.json");

// Kept in sync with jest.config.cjs's collectCoverageFrom negations: files
// deliberately excluded from coverage collection, not just missing by
// omission.
const EXCLUDED_FILES = new Set([
  path.join(rootDir, "src", "utils", "publicEnv.ts"),
]);

const TYPE_ONLY_STATEMENT_KINDS = new Set([
  ts.SyntaxKind.ImportDeclaration,
  ts.SyntaxKind.InterfaceDeclaration,
  ts.SyntaxKind.TypeAliasDeclaration,
]);

// ts-jest's instrumentation drops files that compile down to no runtime
// statements at all (pure `type`/`interface` declarations), so they never
// appear as a key in coverage-final.json -- correctly, since there is
// nothing to execute. Detect that case instead of requiring every such
// file to somehow show up in the report.
function isTypeOnlySourceFile(filePath) {
  const sourceFile = ts.createSourceFile(
    filePath,
    fs.readFileSync(filePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );

  return sourceFile.statements.every((statement) =>
    TYPE_ONLY_STATEMENT_KINDS.has(statement.kind),
  );
}

function listSourceFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return listSourceFiles(entryPath);
    }

    if (
      /\.(ts|tsx)$/.test(entry.name) &&
      !/\.test\.(ts|tsx)$/.test(entry.name) &&
      !entry.name.endsWith(".d.ts")
    ) {
      return [entryPath];
    }

    return [];
  });
}

if (!fs.existsSync(coverageFile)) {
  throw new Error(
    "coverage-final.json is missing; run Jest with --coverage first",
  );
}

const coverage = JSON.parse(fs.readFileSync(coverageFile, "utf8"));
const missingFiles = listSourceFiles(path.join(rootDir, "src"))
  .filter(
    (filePath) => !Object.prototype.hasOwnProperty.call(coverage, filePath),
  )
  .filter((filePath) => !isTypeOnlySourceFile(filePath))
  .filter((filePath) => !EXCLUDED_FILES.has(filePath));

if (missingFiles.length > 0) {
  throw new Error(
    `Coverage report omits source files:\n${missingFiles
      .map((filePath) => `- ${path.relative(rootDir, filePath)}`)
      .join("\n")}`,
  );
}

process.stdout.write(
  `coverage report includes ${listSourceFiles(path.join(rootDir, "src")).length} source files\n`,
);
