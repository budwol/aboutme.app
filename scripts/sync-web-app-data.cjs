#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function syncWebAppData(rootDir, logger = console.log) {
  const sourceFile = path.join(rootDir, ".aboutme", "app-data.json");
  const targetDir = path.join(rootDir, "public");
  const targetFile = path.join(targetDir, "app-data.json");

  if (!fs.existsSync(sourceFile)) {
    throw new Error(
      `missing source file: ${path.relative(rootDir, sourceFile)}`,
    );
  }

  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(sourceFile, targetFile);
  logger("synced .aboutme/app-data.json -> public/app-data.json");

  return { sourceFile, targetFile };
}

module.exports = { syncWebAppData };

if (require.main === module) {
  syncWebAppData(process.cwd());
}
