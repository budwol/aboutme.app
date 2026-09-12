#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const coverageFile = path.join(rootDir, "coverage", "coverage-final.json");

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
const missingFiles = listSourceFiles(path.join(rootDir, "src")).filter(
  (filePath) => !Object.prototype.hasOwnProperty.call(coverage, filePath),
);

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
