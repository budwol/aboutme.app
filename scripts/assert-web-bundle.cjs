const fs = require("fs");
const path = require("path");

const DEFAULT_MAX_BYTES = 1_700_000;
const FORBIDDEN_MARKERS = [
  "expo-image",
  "react-native-reanimated",
  "expo-router",
  "react-native",
];

function assertWebBundle(
  distDir,
  maxBytes = DEFAULT_MAX_BYTES,
  logger = console.log,
) {
  const bundleDir = path.join(distDir, "assets");
  const files = fs
    .readdirSync(bundleDir)
    .filter((file) => file.endsWith(".js"))
    .map((file) => path.join(bundleDir, file));

  if (files.length === 0) {
    throw new Error(`no web JavaScript bundle found in ${bundleDir}`);
  }

  const totalBytes = files.reduce(
    (total, file) => total + fs.statSync(file).size,
    0,
  );
  if (totalBytes > maxBytes) {
    throw new Error(
      `web JavaScript bundle exceeds ${maxBytes} bytes: ${totalBytes}`,
    );
  }

  const bundle = files.map((file) => fs.readFileSync(file, "utf8")).join("\n");
  for (const marker of FORBIDDEN_MARKERS) {
    if (bundle.includes(marker)) {
      throw new Error(`forbidden native web-bundle marker found: ${marker}`);
    }
  }

  logger(
    `web bundle check passed: ${totalBytes} bytes in ${files.length} file(s)`,
  );
  return { files, totalBytes };
}

module.exports = { DEFAULT_MAX_BYTES, assertWebBundle };

if (require.main === module) {
  assertWebBundle(path.resolve(process.argv[2] ?? "dist"));
}
