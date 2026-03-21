#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function createDeployVersion() {
  return Date.now().toString(36);
}

function upsertEnvVarFile(filePath, key, value) {
  const nextLine = `${key}=${value}`;
  const current = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, "utf8")
    : "";
  const lines = current
    .split(/\r?\n/)
    .filter((line) => line.trim() !== "" && !line.startsWith(`${key}=`));

  lines.push(nextLine);
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function syncDirectory(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    return false;
  }

  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(targetDir, { withFileTypes: true })) {
    fs.rmSync(path.join(targetDir, entry.name), {
      recursive: true,
      force: true,
    });
  }

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourceEntry = path.join(sourceDir, entry.name);
    const targetEntry = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      fs.cpSync(sourceEntry, targetEntry, { recursive: true });
      continue;
    }

    fs.copyFileSync(sourceEntry, targetEntry);
  }

  return true;
}

function syncWebAppData(rootDir, logger = console.log) {
  const sourceFile = path.join(rootDir, ".aboutme", "app-data.json");
  const sourceImagesDir = path.join(rootDir, ".aboutme", "images");
  const targetDir = path.join(rootDir, "public");
  const targetFile = path.join(targetDir, "app-data.json");
  const targetImagesDir = path.join(targetDir, "images");
  const deployVersion = createDeployVersion();
  const envLocalFile = path.join(rootDir, ".env.local");

  if (!fs.existsSync(sourceFile)) {
    throw new Error(
      `missing source file: ${path.relative(rootDir, sourceFile)}`,
    );
  }

  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(sourceFile, targetFile);
  syncDirectory(sourceImagesDir, targetImagesDir);
  upsertEnvVarFile(envLocalFile, "EXPO_PUBLIC_DEPLOY_VERSION", deployVersion);
  logger("synced .aboutme/app-data.json -> public/app-data.json");
  logger("synced .aboutme/images -> public/images");
  logger("updated .env.local -> EXPO_PUBLIC_DEPLOY_VERSION");

  return {
    sourceFile,
    targetFile,
    sourceImagesDir,
    targetImagesDir,
    deployVersion,
    envLocalFile,
  };
}

module.exports = { syncWebAppData };

if (require.main === module) {
  syncWebAppData(process.cwd());
}
